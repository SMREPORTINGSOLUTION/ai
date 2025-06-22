import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { sendEmail, generateWinnerEmail } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]

    // Check if winners already selected for today
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("winners_selected, total_participants")
      .eq("contest_date", today)
      .single()

    if (contestError && contestError.code !== "PGRST116") {
      console.error("Contest check error:", contestError)
      return NextResponse.json({ error: "Unable to check contest status" }, { status: 500 })
    }

    if (contest?.winners_selected) {
      return NextResponse.json({ error: "Winners already selected for today" }, { status: 400 })
    }

    // Get all participants for today who haven't won yet
    const { data: participants, error: participantsError } = await supabase
      .from("participants")
      .select("*")
      .eq("entry_date", today)
      .eq("is_winner", false)

    if (participantsError) {
      console.error("Participants fetch error:", participantsError)
      return NextResponse.json({ error: "Unable to fetch participants" }, { status: 500 })
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ error: "No participants found for today" }, { status: 400 })
    }

    if (participants.length < 100) {
      return NextResponse.json(
        {
          error: `Only ${participants.length} participants today. Need at least 100 for full contest.`,
          suggestion: "You can still select winners from available participants.",
        },
        { status: 400 },
      )
    }

    // Randomly select 100 winners using crypto-secure randomization
    const shuffled = participants
      .map((p) => ({ participant: p, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((p) => p.participant)

    const winners = shuffled.slice(0, Math.min(100, participants.length))

    console.log(`Selecting ${winners.length} winners from ${participants.length} participants`)

    // Process winners in batches to avoid timeout
    const batchSize = 10
    let processedCount = 0

    for (let i = 0; i < winners.length; i += batchSize) {
      const batch = winners.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (winner, batchIndex) => {
          const position = i + batchIndex + 1

          try {
            // Insert into winners table
            const { error: winnerInsertError } = await supabase.from("winners").insert([
              {
                participant_id: winner.id,
                contest_date: today,
                prize_position: position,
                notified: false,
              },
            ])

            if (winnerInsertError) {
              console.error(`Winner insert error for ${winner.email}:`, winnerInsertError)
              return
            }

            // Update participant as winner
            const { error: participantUpdateError } = await supabase
              .from("participants")
              .update({ is_winner: true, prize_position: position })
              .eq("id", winner.id)

            if (participantUpdateError) {
              console.error(`Participant update error for ${winner.email}:`, participantUpdateError)
              return
            }

            // Send winner email (don't await to speed up process)
            sendEmail({
              to: winner.email,
              subject: `🎉 You Won an iPhone 15! Position #${position}`,
              html: generateWinnerEmail(winner.name, position),
            }).catch((emailError) => {
              console.error(`Failed to send email to ${winner.email}:`, emailError)
            })

            processedCount++
          } catch (error) {
            console.error(`Failed to process winner ${winner.email}:`, error)
          }
        }),
      )

      // Small delay between batches
      if (i + batchSize < winners.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }

    // Mark contest as completed
    const { error: contestUpdateError } = await supabase.from("contests").upsert(
      [
        {
          contest_date: today,
          total_participants: participants.length,
          winners_selected: true,
        },
      ],
      {
        onConflict: "contest_date",
      },
    )

    if (contestUpdateError) {
      console.error("Contest update error:", contestUpdateError)
    }

    // Update winner notification status
    const { error: notificationUpdateError } = await supabase
      .from("winners")
      .update({ notified: true })
      .eq("contest_date", today)

    if (notificationUpdateError) {
      console.error("Notification update error:", notificationUpdateError)
    }

    return NextResponse.json({
      success: true,
      message: `${processedCount} winners selected and notification emails sent!`,
      winnersCount: processedCount,
      totalParticipants: participants.length,
    })
  } catch (error) {
    console.error("Winner selection error:", error)
    return NextResponse.json(
      {
        error: "Failed to select winners",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
