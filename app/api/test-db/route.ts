import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test basic connection by checking tables
    const { data: tablesTest, error: tablesError } = await supabase
      .from("participants")
      .select("count", { count: "exact", head: true })
      .limit(1)

    if (tablesError) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: tablesError.message,
        },
        { status: 500 },
      )
    }

    // Get current stats
    const today = new Date().toISOString().split("T")[0]

    const { count: participantCount } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("entry_date", today)

    const { count: totalCount } = await supabase.from("participants").select("*", { count: "exact", head: true })

    const { count: winnerCount } = await supabase
      .from("winners")
      .select("*", { count: "exact", head: true })
      .eq("contest_date", today)

    // Test table structure
    const { data: sampleParticipant } = await supabase.from("participants").select("*").limit(1).single()

    const { data: sampleContest } = await supabase.from("contests").select("*").limit(1).single()

    const { data: sampleWinner } = await supabase.from("winners").select("*").limit(1).single()

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      tables: ["participants", "contests", "winners"],
      stats: {
        todayParticipants: participantCount || 0,
        totalParticipants: totalCount || 0,
        todayWinners: winnerCount || 0,
      },
      sampleData: {
        participant: sampleParticipant ? "✅ Table exists" : "❌ No data",
        contest: sampleContest ? "✅ Table exists" : "❌ No data",
        winner: sampleWinner ? "✅ Table exists" : "❌ No data",
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Database test error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
