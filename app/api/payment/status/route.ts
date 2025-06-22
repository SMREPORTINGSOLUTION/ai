import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get("paymentId")
    const orderId = searchParams.get("orderId")

    if (!paymentId && !orderId) {
      return NextResponse.json({ error: "Payment ID or Order ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find participant by payment details
    let query = supabase.from("participants").select("*")

    if (paymentId) {
      query = query.eq("payment_id", paymentId)
    } else if (orderId) {
      query = query.eq("order_id", orderId)
    }

    const { data: participant, error } = await query.single()

    if (error) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: participant.payment_id,
        orderId: participant.order_id,
        status: participant.payment_status,
        method: participant.payment_method,
        amount: participant.entry_fee,
        participantName: participant.name,
        entryDate: participant.entry_date,
        entryTime: participant.entry_time,
      },
    })
  } catch (error) {
    console.error("Payment status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check payment status",
      },
      { status: 500 },
    )
  }
}
