import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { getCurrentSession, getPrizesForParticipants, CONTEST_CONFIG } from "@/lib/contest-config"

export async function GET() {
  try {
    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]
    const currentSession = getCurrentSession()

    // Check if session columns exist by querying information_schema
    let hasSessionColumns = false
    try {
      const { data: columnCheck } = await supabase
        .from("information_schema.columns")
        .select("column_name")
        .eq("table_name", "participants")
        .eq("column_name", "contest_session")
        .single()

      hasSessionColumns = !!columnCheck
    } catch (error) {
      // If information_schema query fails, try a direct approach
      try {
        const { data } = await supabase.from("participants").select("contest_session").limit(1)
        hasSessionColumns = true
      } catch (directError) {
        console.log("Session columns not available, using legacy mode")
        hasSessionColumns = false
      }
    }

    if (!hasSessionColumns) {
      // Legacy mode - work without session columns
      console.log("Running in legacy mode")

      const { count: todayCount } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("entry_date", today)

      const { count: totalCount } = await supabase.from("participants").select("*", { count: "exact", head: true })

      const { count: winnersCount } = await supabase
        .from("winners")
        .select("*", { count: "exact", head: true })
        .eq("contest_date", today)

      const todayParticipants = todayCount || 0
      const availablePrizes = getPrizesForParticipants(todayParticipants)

      return NextResponse.json({
        currentSession,
        currentSessionParticipants: todayParticipants,
        todayTotalParticipants: todayParticipants,
        totalParticipants: totalCount || 0,
        currentSessionWinners: winnersCount || 0,
        availablePrizes,
        remainingSlots: Math.max(0, CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION - todayParticipants),
        winnersSelected: false,
        sessionsData: CONTEST_CONFIG.SESSION_TIMES.map((session) => ({
          session: session.session,
          time: session.time,
          label: session.label,
          participants: session.session === currentSession ? todayParticipants : 0,
          winners: session.session === currentSession ? winnersCount || 0 : 0,
          availablePrizes: session.session === currentSession ? availablePrizes : 0,
          remainingSlots:
            session.session === currentSession
              ? Math.max(0, CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION - todayParticipants)
              : CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION,
        })),
        lastUpdated: new Date().toISOString(),
        mode: "legacy",
      })
    }

    // Session-based mode
    console.log("Running in session mode")

    // Get current session participant count with better error handling
    let currentSessionCount = 0
    try {
      const { count, error } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("entry_date", today)
        .eq("contest_session", currentSession)

      if (error) {
        console.error("Current session count error:", error.message)
        // Fall back to 0 if there's an error
        currentSessionCount = 0
      } else {
        currentSessionCount = count || 0
      }
    } catch (error) {
      console.error("Exception in current session count:", error)
      currentSessionCount = 0
    }

    // Get today's total participants
    let todayTotalCount = 0
    try {
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("entry_date", today)

      todayTotalCount = count || 0
    } catch (error) {
      console.error("Today total count error:", error)
      todayTotalCount = 0
    }

    // Get total participants
    let totalCount = 0
    try {
      const { count } = await supabase.from("participants").select("*", { count: "exact", head: true })

      totalCount = count || 0
    } catch (error) {
      console.error("Total count error:", error)
      totalCount = 0
    }

    // Get current session winners
    let currentSessionWinners = 0
    try {
      const { count } = await supabase
        .from("winners")
        .select("*", { count: "exact", head: true })
        .eq("contest_date", today)
        .eq("contest_session", currentSession)

      currentSessionWinners = count || 0
    } catch (error) {
      console.error("Winners count error:", error)
      currentSessionWinners = 0
    }

    // Get all sessions data for today
    const sessionsData = await Promise.all(
      CONTEST_CONFIG.SESSION_TIMES.map(async (sessionInfo) => {
        try {
          const { count: sessionParticipants } = await supabase
            .from("participants")
            .select("*", { count: "exact", head: true })
            .eq("entry_date", today)
            .eq("contest_session", sessionInfo.session)

          const { count: sessionWinners } = await supabase
            .from("winners")
            .select("*", { count: "exact", head: true })
            .eq("contest_date", today)
            .eq("contest_session", sessionInfo.session)

          const availablePrizes = getPrizesForParticipants(sessionParticipants || 0)

          return {
            session: sessionInfo.session,
            time: sessionInfo.time,
            label: sessionInfo.label,
            participants: sessionParticipants || 0,
            winners: sessionWinners || 0,
            availablePrizes,
            remainingSlots: Math.max(0, CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION - (sessionParticipants || 0)),
          }
        } catch (sessionError) {
          console.error(`Error fetching session ${sessionInfo.session} data:`, sessionError)
          return {
            session: sessionInfo.session,
            time: sessionInfo.time,
            label: sessionInfo.label,
            participants: 0,
            winners: 0,
            availablePrizes: 0,
            remainingSlots: CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION,
          }
        }
      }),
    )

    // Check if current session winners have been selected
    let winnersSelected = false
    try {
      const { data: currentContest } = await supabase
        .from("contests")
        .select("winners_selected")
        .eq("contest_date", today)
        .eq("contest_session", currentSession)
        .single()

      winnersSelected = currentContest?.winners_selected || false
    } catch (error) {
      console.log("No contest data available or contest_session column missing")
      winnersSelected = false
    }

    const availablePrizes = getPrizesForParticipants(currentSessionCount)

    return NextResponse.json({
      currentSession,
      currentSessionParticipants: currentSessionCount,
      todayTotalParticipants: todayTotalCount,
      totalParticipants: totalCount,
      currentSessionWinners,
      availablePrizes,
      remainingSlots: Math.max(0, CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION - currentSessionCount),
      winnersSelected,
      sessionsData,
      lastUpdated: new Date().toISOString(),
      mode: "session",
    })
  } catch (error) {
    console.error("Stats API error:", error)

    // Return safe default values on any error
    return NextResponse.json({
      currentSession: getCurrentSession(),
      currentSessionParticipants: 0,
      todayTotalParticipants: 0,
      totalParticipants: 0,
      currentSessionWinners: 0,
      availablePrizes: 0,
      remainingSlots: CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION,
      winnersSelected: false,
      sessionsData: CONTEST_CONFIG.SESSION_TIMES.map((session) => ({
        session: session.session,
        time: session.time,
        label: session.label,
        participants: 0,
        winners: 0,
        availablePrizes: 0,
        remainingSlots: CONTEST_CONFIG.MAX_PARTICIPANTS_PER_SESSION,
      })),
      lastUpdated: new Date().toISOString(),
      error: "Database temporarily unavailable",
      mode: "fallback",
    })
  }
}
