import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")
    const paymentId = searchParams.get("paymentId")

    if (!orderId && !paymentId) {
      return NextResponse.json({ error: "Order ID or Payment ID required" }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find participant by order details
    let query = supabase.from("participants").select("*")

    if (orderId) {
      query = query.eq("order_id", orderId)
    } else if (paymentId) {
      query = query.eq("payment_id", paymentId)
    }

    const { data: participant, error } = await query.single()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          status: "not_found",
          error: "Payment not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      status: participant.payment_status,
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
    console.error("UPI payment status check error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check payment status",
      },
      { status: 500 },
    )
  }
}
