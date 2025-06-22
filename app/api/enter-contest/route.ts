import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import { sendEmail, generatePaidEntryConfirmationEmail } from "@/lib/email-service"
import { getCurrentSession } from "@/lib/contest-config"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, paymentMethod, paymentId, orderId, entryFee, contestSession } = await request.json()

    if (!name || !email || !phone || !paymentMethod || !paymentId || !entryFee) {
      return NextResponse.json({ error: "All fields including payment details are required" }, { status: 400 })
    }

    // Validate entry fee
    if (entryFee !== 10) {
      return NextResponse.json({ error: "Invalid entry fee amount" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[+]?[1-9][\d]{3,14}$/
    if (!phoneRegex.test(phone.replace(/[\s\-()]/g, ""))) {
      return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 })
    }

    const supabase = createServerClient()
    const today = new Date().toISOString().split("T")[0]
    const currentContestSession = contestSession || getCurrentSession()

    // Check if session columns exist
    let hasSessionColumns = false
    try {
      const { data } = await supabase.from("participants").select("contest_session").limit(1)
      hasSessionColumns = true
    } catch (error) {
      console.log("Session columns not available, using legacy mode")
      hasSessionColumns = false
    }

    if (!hasSessionColumns) {
      // Legacy mode - check without session
      const { data: existingEntry } = await supabase
        .from("participants")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .eq("entry_date", today)
        .single()

      if (existingEntry) {
        return NextResponse.json({ error: "You have already entered today's contest" }, { status: 400 })
      }

      // Check current participant count
      const { count } = await supabase
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("entry_date", today)

      if (count && count >= 1000000) {
        return NextResponse.json({ error: "Today's contest is full (10 lakh participants reached)" }, { status: 400 })
      }

      // Process payment
      const paymentResult = await processPayment({
        amount: entryFee,
        method: paymentMethod,
        email: email,
        name: name,
      })

      if (!paymentResult.success) {
        return NextResponse.json({ error: "Payment failed. Please try again." }, { status: 400 })
      }

      // Insert participant without session info
      const { data: participant, error: insertError } = await supabase
        .from("participants")
        .insert([
          {
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            entry_date: today,
            entry_time: new Date().toISOString(),
            is_winner: false,
            prize_position: null,
            payment_method: paymentMethod,
            entry_fee: entryFee,
            payment_id: paymentId,
            payment_status: "completed",
            order_id: orderId || null,
          },
        ])
        .select()
        .single()

      if (insertError) {
        console.error("Insert error:", insertError)
        return NextResponse.json({ error: "Failed to register entry. Please try again." }, { status: 500 })
      }

      // Send confirmation email
      try {
        await sendEmail({
          to: email,
          subject: "🎉 Payment Successful - iPhone 15 Contest Entry Confirmed",
          html: generatePaidEntryConfirmationEmail(name, paymentResult.paymentId, entryFee),
        })
      } catch (emailError) {
        console.error("Email sending failed:", emailError)
      }

      return NextResponse.json({
        success: true,
        message: "Payment successful! Contest entry confirmed.",
        participantCount: (count || 0) + 1,
        entryId: participant.id,
        paymentId: paymentResult.paymentId,
        contestSession: 1, // Default session in legacy mode
      })
    }

    // Session-based mode
    const { data: existingEntry } = await supabase
      .from("participants")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .eq("entry_date", today)
      .eq("contest_session", currentContestSession)
      .single()

    if (existingEntry) {
      return NextResponse.json({ error: "You have already entered this contest session today" }, { status: 400 })
    }

    // Check current participant count for this session
    const { count } = await supabase
      .from("participants")
      .select("*", { count: "exact", head: true })
      .eq("entry_date", today)
      .eq("contest_session", currentContestSession)

    if (count && count >= 1000000) {
      return NextResponse.json(
        { error: "This contest session is full (10 lakh participants reached)" },
        { status: 400 },
      )
    }

    // Validate payment method
    if (paymentMethod !== "upi") {
      return NextResponse.json({ error: "Only UPI payments are accepted" }, { status: 400 })
    }

    // Process payment
    const paymentResult = await processPayment({
      amount: entryFee,
      method: paymentMethod,
      email: email,
      name: name,
    })

    if (!paymentResult.success) {
      return NextResponse.json({ error: "Payment failed. Please try again." }, { status: 400 })
    }

    // Insert participant with session info
    const { data: participant, error: insertError } = await supabase
      .from("participants")
      .insert([
        {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          entry_date: today,
          entry_time: new Date().toISOString(),
          contest_session: currentContestSession,
          is_winner: false,
          prize_position: null,
          payment_method: paymentMethod,
          entry_fee: entryFee,
          payment_id: paymentId,
          payment_status: "completed",
          order_id: orderId || null,
        },
      ])
      .select()
      .single()

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "Failed to register entry. Please try again." }, { status: 500 })
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: "🎉 Payment Successful - iPhone 15 Contest Entry Confirmed",
        html: generatePaidEntryConfirmationEmail(name, paymentResult.paymentId, entryFee),
      })
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
    }

    return NextResponse.json({
      success: true,
      message: "Payment successful! Contest entry confirmed.",
      participantCount: (count || 0) + 1,
      entryId: participant.id,
      paymentId: paymentResult.paymentId,
      contestSession: currentContestSession,
    })
  } catch (error) {
    console.error("Contest entry error:", error)
    return NextResponse.json(
      {
        error: "Failed to process entry. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Mock UPI payment processing function
async function processPayment(paymentData: {
  amount: number
  method: string
  email: string
  name: string
}): Promise<{ success: boolean; paymentId?: string; error?: string }> {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // For UPI payments, we assume they are verified when the user provides transaction ID
  if (paymentData.method === "upi") {
    return {
      success: true,
      paymentId: `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  return {
    success: false,
    error: "Invalid payment method. Only UPI payments are accepted.",
  }
}
