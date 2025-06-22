import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html } = await request.json()

    // Mock email sending - replace with your email service
    console.log(`Sending email to: ${to}`)
    console.log(`Subject: ${subject}`)

    // Simulate email sending delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
