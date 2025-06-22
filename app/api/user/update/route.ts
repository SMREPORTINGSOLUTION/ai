import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function PUT(request: NextRequest) {
  try {
    const { userId, name, email, phone } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("users")
      .update({
        name: name?.trim(),
        email: email?.toLowerCase().trim(),
        phone: phone?.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      console.error("User update error:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: data,
    })
  } catch (error) {
    console.error("User update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
