import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { userId, orderId, paymentId, amount, status } = await request.json()

    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("payment_sessions")
      .insert([
        {
          user_id: userId,
          order_id: orderId,
          payment_id: paymentId,
          amount: amount,
          status: status,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Payment session creation error:", error)
      return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: data })
  } catch (error) {
    console.error("Payment session API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { orderId, status, transactionId } = await request.json()

    const supabase = createServerClient()

    const updateData: any = {
      status: status,
      updated_at: new Date().toISOString(),
    }

    if (transactionId) {
      updateData.transaction_id = transactionId
    }

    const { data, error } = await supabase
      .from("payment_sessions")
      .update(updateData)
      .eq("order_id", orderId)
      .select()
      .single()

    if (error) {
      console.error("Payment session update error:", error)
      return NextResponse.json({ error: "Failed to update payment session" }, { status: 500 })
    }

    return NextResponse.json({ success: true, session: data })
  } catch (error) {
    console.error("Payment session update API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
