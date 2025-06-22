import { type NextRequest, NextResponse } from "next/server"

const UPI_CONFIG = {
  merchantUPI: "ramesh333nadar@okhdfcbank",
  merchantName: "iPhone Contest",
}

export async function POST(request: NextRequest) {
  try {
    const { amount, orderId, customerInfo } = await request.json()

    if (!amount || !orderId || !customerInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate amount
    if (amount !== 10) {
      return NextResponse.json({ error: "Invalid amount. Entry fee is ₹10" }, { status: 400 })
    }

    // Generate UPI payment URL
    const note = `iPhone Contest Entry - ${customerInfo.name} - ${orderId}`
    const upiUrl = `upi://pay?pa=${UPI_CONFIG.merchantUPI}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}`

    // Generate payment ID for tracking
    const paymentId = `UPI_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      paymentId: paymentId,
      orderId: orderId,
      upiUrl: upiUrl,
      merchantUPI: UPI_CONFIG.merchantUPI,
      merchantName: UPI_CONFIG.merchantName,
      amount: amount,
      note: note,
    })
  } catch (error) {
    console.error("UPI payment creation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create UPI payment",
      },
      { status: 500 },
    )
  }
}
