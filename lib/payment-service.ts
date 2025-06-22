// UPI-only payment service
export interface UPIPaymentRequest {
  amount: number
  orderId: string
  customerInfo: {
    name: string
    email: string
    phone: string
  }
}

export interface UPIPaymentResponse {
  success: boolean
  paymentId?: string
  orderId?: string
  upiUrl?: string
  error?: string
}

// UPI Configuration
const UPI_CONFIG = {
  merchantUPI: "ramesh333nadar@okhdfcbank",
  merchantName: "iPhone Contest",
}

// Generate UPI payment URL
export function generateUPIUrl(request: UPIPaymentRequest): string {
  const { amount, orderId, customerInfo } = request
  const note = `iPhone Contest Entry - ${customerInfo.name} - ${orderId}`

  // Standard UPI URL format
  const upiUrl = `upi://pay?pa=${UPI_CONFIG.merchantUPI}&pn=${encodeURIComponent(UPI_CONFIG.merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}&tr=${orderId}`

  return upiUrl
}

// Create UPI payment
export async function createUPIPayment(request: UPIPaymentRequest): Promise<UPIPaymentResponse> {
  try {
    const response = await fetch("/api/payment/upi/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("UPI payment creation failed:", error)
    return { success: false, error: "UPI payment creation failed" }
  }
}

// Verify UPI payment
export async function verifyUPIPayment(paymentId: string, orderId: string): Promise<boolean> {
  try {
    const response = await fetch("/api/payment/upi/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId,
        orderId,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("UPI payment verification failed:", error)
    return false
  }
}

// Check payment status
export async function checkUPIPaymentStatus(orderId: string): Promise<any> {
  try {
    const response = await fetch(`/api/payment/upi/status?orderId=${orderId}`)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("UPI payment status check failed:", error)
    return { success: false, error: "Status check failed" }
  }
}
