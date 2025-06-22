import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // 'participants' or 'winners'
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    const supabase = createServerClient()

    if (type === "participants") {
      const { data, error } = await supabase
        .from("participants")
        .select("name, email, phone, entry_time, is_winner, prize_position")
        .eq("entry_date", date)
        .order("entry_time", { ascending: true })

      if (error) {
        console.error("Export participants error:", error)
        return NextResponse.json({ error: "Failed to export participants" }, { status: 500 })
      }

      // Convert to CSV
      const headers = ["Name", "Email", "Phone", "Entry Time", "Is Winner", "Prize Position"]
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          [
            `"${row.name}"`,
            `"${row.email}"`,
            `"${row.phone}"`,
            `"${row.entry_time}"`,
            row.is_winner ? "Yes" : "No",
            row.prize_position || "",
          ].join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="participants-${date}.csv"`,
        },
      })
    }

    if (type === "winners") {
      const { data, error } = await supabase
        .from("winners")
        .select(
          `
          prize_position,
          notified,
          created_at,
          participants (name, email, phone)
        `,
        )
        .eq("contest_date", date)
        .order("prize_position", { ascending: true })

      if (error) {
        console.error("Export winners error:", error)
        return NextResponse.json({ error: "Failed to export winners" }, { status: 500 })
      }

      // Convert to CSV
      const headers = ["Position", "Name", "Email", "Phone", "Notified", "Selected At"]
      const csvContent = [
        headers.join(","),
        ...data.map((row) =>
          [
            row.prize_position,
            `"${row.participants?.name || ""}"`,
            `"${row.participants?.email || ""}"`,
            `"${row.participants?.phone || ""}"`,
            row.notified ? "Yes" : "No",
            `"${row.created_at}"`,
          ].join(","),
        ),
      ].join("\n")

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="winners-${date}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      {
        error: "Export failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
