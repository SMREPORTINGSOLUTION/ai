import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { CONTEST_CONFIG } from "@/lib/contest-config"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Get all winners with participant details
    const { data: winnersData, error } = await supabase
      .from("winners")
      .select(`
        id,
        prize_position,
        contest_date,
        contest_session,
        created_at,
        participants (
          name
        )
      `)
      .order("contest_date", { ascending: false })
      .order("contest_session", { ascending: true })
      .order("prize_position", { ascending: true })

    if (error) {
      console.error("Winners fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch winners" }, { status: 500 })
    }

    // Group winners by date and session
    const groupedWinners: { [key: string]: any } = {}

    winnersData?.forEach((winner) => {
      const date = winner.contest_date
      if (!groupedWinners[date]) {
        groupedWinners[date] = {
          date,
          sessions: CONTEST_CONFIG.SESSION_TIMES.map((sessionInfo) => ({
            session: sessionInfo.session,
            time: sessionInfo.time,
            label: sessionInfo.label,
            winners: [],
            totalPrizes: 0,
          })),
        }
      }

      const sessionIndex = winner.contest_session - 1
      if (sessionIndex >= 0 && sessionIndex < groupedWinners[date].sessions.length) {
        groupedWinners[date].sessions[sessionIndex].winners.push({
          id: winner.id,
          name: winner.participants?.name || "Unknown",
          prize_position: winner.prize_position,
          contest_date: winner.contest_date,
          contest_session: winner.contest_session,
          created_at: winner.created_at,
        })
      }
    })

    // Get contest data to determine total prizes for each session
    const { data: contestsData } = await supabase
      .from("contests")
      .select("contest_date, contest_session, prizes_available")
      .order("contest_date", { ascending: false })

    // Update total prizes for each session
    contestsData?.forEach((contest) => {
      const date = contest.contest_date
      if (groupedWinners[date]) {
        const sessionIndex = contest.contest_session - 1
        if (sessionIndex >= 0 && sessionIndex < groupedWinners[date].sessions.length) {
          groupedWinners[date].sessions[sessionIndex].totalPrizes = contest.prizes_available || 0
        }
      }
    })

    const winnersArray = Object.values(groupedWinners)

    return NextResponse.json({
      success: true,
      winners: winnersArray,
    })
  } catch (error) {
    console.error("Winners list API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
