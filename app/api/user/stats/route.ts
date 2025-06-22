import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get user's contest entries
    const { data: entries, error: entriesError } = await supabase.from("participants").select("*").eq("user_id", userId)

    if (entriesError) {
      console.error("Entries fetch error:", entriesError)
      return NextResponse.json({ error: "Failed to fetch user stats" }, { status: 500 })
    }

    const totalEntries = entries?.length || 0
    const totalWins = entries?.filter((entry) => entry.is_winner).length || 0
    const winRate = totalEntries > 0 ? (totalWins / totalEntries) * 100 : 0
    const totalSpent = entries?.reduce((sum, entry) => sum + (entry.entry_fee || 0), 0) || 0

    return NextResponse.json({
      success: true,
      stats: {
        totalEntries,
        totalWins,
        winRate,
        totalSpent,
      },
    })
  } catch (error) {
    console.error("User stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
