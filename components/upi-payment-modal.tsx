"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Smartphone,
  IndianRupee,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Copy,
  ExternalLink,
  XCircle,
  QrCode,
  Eye,
  EyeOff,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createUPIPayment, verifyUPIPayment } from "@/lib/payment-service"
import { useAuth } from "@/contexts/auth-context"

interface UPIPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentData: any) => void
  onCancel?: () => void
  customerInfo: {
    name: string
    email: string
    phone: string
  }
  amount: number
}

export default function UPIPaymentModal({
  isOpen,
  onClose,
  onSuccess,
  onCancel,
  customerInfo,
  amount,
}: UPIPaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<
    "details" | "payment" | "confirmation" | "success" | "failed" | "cancelled"
  >("details")
  const [paymentData, setPaymentData] = useState<any>(null)
  const [countdown, setCountdown] = useState(600) // 10 minutes
  const [transactionId, setTransactionId] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showFullUPI, setShowFullUPI] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isOpen && (paymentStep === "payment" || paymentStep === "confirmation") && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1)
      }, 1000)
    }

    // Auto-cancel if timer expires
    if (countdown === 0 && (paymentStep === "payment" || paymentStep === "confirmation")) {
      handleCancelPayment()
    }

    return () => clearInterval(timer)
  }, [isOpen, paymentStep, countdown])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentStep("details")
      setCountdown(600)
      setTransactionId("")
      setPaymentData(null)
      setIsCancelling(false)
      setShowFullUPI(false)
    }
  }, [isOpen])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const maskUPIId = (upiId: string) => {
    if (!upiId) return ""
    const [username, domain] = upiId.split("@")
    if (username.length <= 4) return upiId
    const maskedUsername =
      username.substring(0, 2) + "*".repeat(username.length - 4) + username.substring(username.length - 2)
    return `${maskedUsername}@${domain}`
  }

  const generateQRCode = (upiUrl: string) => {
    // Generate QR code URL using a QR code service
    const qrData = encodeURIComponent(upiUrl)
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${qrData}&bgcolor=FFFFFF&color=000000`
  }

  const handleCreatePayment = async () => {
    try {
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const response = await createUPIPayment({
        amount: amount,
        orderId: orderId,
        customerInfo: customerInfo,
      })

      if (response.success) {
        setPaymentData(response)
        setPaymentStep("payment")

        // Store payment session for tracking
        await fetch("/api/payment/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            orderId: orderId,
            paymentId: response.paymentId,
            amount: amount,
            status: "initiated",
          }),
        })
      } else {
        toast({
          title: "Payment Creation Failed",
          description: response.error || "Unable to create UPI payment",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create payment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUPIPayment = () => {
    if (paymentData?.upiUrl) {
      // Try to open UPI app
      window.location.href = paymentData.upiUrl
      setPaymentStep("confirmation")
    }
  }

  const copyUPIDetails = () => {
    const details = `UPI ID: ${paymentData.merchantUPI}\nAmount: ₹${paymentData.amount}\nNote: ${paymentData.note}`
    navigator.clipboard.writeText(details)
    toast({
      title: "Copied!",
      description: "UPI details copied to clipboard",
    })
  }

  const handleCancelPayment = async () => {
    setIsCancelling(true)

    try {
      // Update payment session as cancelled
      if (paymentData) {
        await fetch("/api/payment/session", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paymentData.orderId,
            status: "cancelled",
          }),
        })
      }

      setPaymentStep("cancelled")

      toast({
        title: "Payment Cancelled",
        description: "Your payment has been cancelled successfully",
      })

      // Call onCancel callback if provided
      if (onCancel) {
        setTimeout(() => {
          onCancel()
        }, 2000)
      }
    } catch (error) {
      console.error("Cancel payment error:", error)
    } finally {
      setIsCancelling(false)
    }
  }

  const handlePaymentConfirmation = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Transaction ID Required",
        description: "Please enter your UPI transaction ID",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const isValid = await verifyUPIPayment(paymentData.paymentId, paymentData.orderId)

      if (isValid) {
        // Update payment session as completed
        await fetch("/api/payment/session", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: paymentData.orderId,
            status: "completed",
            transactionId: transactionId,
          }),
        })

        const successData = {
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          transactionId: transactionId,
          method: "upi",
          amount: amount,
        }
        setPaymentStep("success")
        setTimeout(() => {
          onSuccess(successData)
        }, 2000)
      } else {
        setPaymentStep("failed")
      }
    } catch (error) {
      setPaymentStep("failed")
    } finally {
      setIsVerifying(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-gradient-to-br from-[#2E0C38] to-[#4D0C3E] border-[#C71852]/30 max-h-[90vh] overflow-y-auto">
        {paymentStep === "details" && (
          <>
            <CardHeader className="text-center relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 text-white hover:bg-white/10"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Smartphone className="w-6 h-6 text-[#C71852]" />
                UPI Payment
              </CardTitle>
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[#C71852]">
                <IndianRupee className="w-6 h-6" />
                <span>{amount}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <h3 className="font-semibold mb-2 text-white">Contest Entry Details:</h3>
                <p className="text-sm text-gray-200">Name: {customerInfo.name}</p>
                <p className="text-sm text-gray-200">Email: {customerInfo.email}</p>
                <p className="text-sm text-gray-200">Phone: {customerInfo.phone}</p>
              </div>

              <div className="bg-[#C71852]/20 p-4 rounded-lg border border-[#C71852]/30">
                <h3 className="font-semibold text-[#C71852] mb-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  UPI Payment Details
                </h3>
                <p className="text-sm text-gray-200 mb-2">
                  <strong>Pay to:</strong> Secure UPI Merchant
                </p>
                <p className="text-sm text-gray-200 mb-2">
                  <strong>Amount:</strong> ₹{amount}
                </p>
                <p className="text-sm text-gray-200">
                  <strong>Purpose:</strong> iPhone Contest Entry
                </p>
              </div>

              <div className="space-y-2">
                <Button onClick={handleCreatePayment} className="w-full bg-[#C71852] hover:bg-[#0E1122] h-12">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Proceed to UPI Payment
                  </div>
                </Button>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-10 border-white/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>

              <div className="text-xs text-gray-300 text-center space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Secure UPI payment
                </p>
                <p>📱 Works with all UPI apps</p>
                <p>🔒 Direct bank-to-bank transfer</p>
              </div>
            </CardContent>
          </>
        )}

        {paymentStep === "payment" && (
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Smartphone className="w-16 h-16 text-[#C71852] mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Complete UPI Payment</h3>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-400 mb-4">
                <Clock className="w-4 h-4" />
                <span>Time remaining: {formatTime(countdown)}</span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="bg-white p-4 rounded-lg mb-4 text-center">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center justify-center gap-2">
                <QrCode className="w-5 h-5" />
                Scan QR Code
              </h4>
              <div className="flex justify-center mb-3">
                <img
                  src={generateQRCode(paymentData.upiUrl) || "/placeholder.svg"}
                  alt="UPI Payment QR Code"
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-600">Scan with any UPI app to pay instantly</p>
            </div>

            <div className="bg-[#C71852]/20 p-4 rounded-lg border border-[#C71852]/30 mb-4">
              <h4 className="font-semibold text-[#C71852] mb-3">Payment Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200">UPI ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white">
                      {showFullUPI ? paymentData.merchantUPI : maskUPIId(paymentData.merchantUPI)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFullUPI(!showFullUPI)}
                      className="h-6 w-6 p-0 text-gray-300 hover:text-white"
                    >
                      {showFullUPI ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Amount:</span>
                  <span className="font-semibold text-[#C71852]">₹{paymentData.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-200">Order ID:</span>
                  <span className="font-mono text-xs text-gray-300">{paymentData.orderId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={handleUPIPayment} className="w-full bg-[#C71852] hover:bg-[#0E1122] h-12">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Open UPI App & Pay
                </div>
              </Button>

              <Button
                onClick={copyUPIDetails}
                variant="outline"
                className="w-full h-10 border-white/30 text-white hover:bg-white/10"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy Payment Details
                </div>
              </Button>

              <Button
                onClick={handleCancelPayment}
                variant="destructive"
                className="w-full h-10 bg-red-600 hover:bg-red-700"
                disabled={isCancelling}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {isCancelling ? "Cancelling..." : "Cancel Payment"}
                </div>
              </Button>
            </div>

            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <p className="text-xs text-blue-200">
                <strong>Instructions:</strong>
                <br />
                1. Scan QR code or click "Open UPI App & Pay"
                <br />
                2. Complete payment in your UPI app
                <br />
                3. Return here and enter transaction ID
                <br />
                4. Click "Confirm Payment" to complete entry
              </p>
            </div>
          </CardContent>
        )}

        {paymentStep === "confirmation" && (
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">Payment Completed?</h3>
              <p className="text-gray-200 mb-4">Enter your UPI transaction ID to confirm</p>
              <div className="flex items-center justify-center gap-2 text-sm text-orange-400">
                <Clock className="w-4 h-4" />
                <span>Time remaining: {formatTime(countdown)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">UPI Transaction ID *</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter 12-digit transaction ID"
                  className="w-full px-3 py-2 bg-white/10 border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#C71852] text-white placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Find this in your UPI app's transaction history</p>
              </div>

              <Button
                onClick={handlePaymentConfirmation}
                disabled={isVerifying || !transactionId.trim()}
                className="w-full bg-green-600 hover:bg-green-700 h-12"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Confirm Payment
                  </div>
                )}
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setPaymentStep("payment")}
                  variant="outline"
                  disabled={isVerifying}
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Back to Payment
                </Button>

                <Button
                  onClick={handleCancelPayment}
                  variant="destructive"
                  disabled={isVerifying || isCancelling}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isCancelling ? "Cancelling..." : "Cancel"}
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {paymentStep === "success" && (
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
              <h3 className="text-xl font-semibold text-green-400">Payment Successful!</h3>
              <p className="text-gray-200">Your contest entry has been confirmed</p>
              <div className="bg-green-500/20 p-4 rounded-lg text-left border border-green-500/30">
                <p className="text-sm text-green-200">
                  <strong>Payment ID:</strong> {paymentData?.paymentId}
                </p>
                <p className="text-sm text-green-200">
                  <strong>Transaction ID:</strong> {transactionId}
                </p>
                <p className="text-sm text-green-200">
                  <strong>Amount:</strong> ₹{amount}
                </p>
              </div>
              <p className="text-sm text-gray-400">Redirecting to confirmation...</p>
            </div>
          </CardContent>
        )}

        {paymentStep === "failed" && (
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
              <h3 className="text-xl font-semibold text-red-400">Payment Verification Failed</h3>
              <p className="text-gray-200">Unable to verify your payment</p>
              <div className="space-y-2">
                <Button
                  onClick={() => setPaymentStep("confirmation")}
                  className="w-full bg-[#C71852] hover:bg-[#0E1122]"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full border-white/30 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {paymentStep === "cancelled" && (
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <XCircle className="w-16 h-16 text-orange-400 mx-auto" />
              <h3 className="text-xl font-semibold text-orange-400">Payment Cancelled</h3>
              <p className="text-gray-200">Your payment has been cancelled successfully</p>
              <div className="bg-orange-500/20 p-4 rounded-lg border border-orange-500/30">
                <p className="text-sm text-orange-200">
                  No charges have been made to your account.
                  <br />
                  You can try again anytime.
                </p>
              </div>
              <Button onClick={onClose} className="w-full bg-[#C71852] hover:bg-[#0E1122]">
                Close
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
