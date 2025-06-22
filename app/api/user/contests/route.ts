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

    const { data: contests, error } = await supabase
      .from("participants")
      .select("*")
      .eq("user_id", userId)
      .order("entry_time", { ascending: false })

    if (error) {
      console.error("User contests fetch error:", error)
      return NextResponse.json({ error: "Failed to fetch user contests" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      contests: contests || [],
    })
  } catch (error) {
    console.error("User contests API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
