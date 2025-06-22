"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Smartphone, Trophy, Users, Clock, Gift, Zap, IndianRupee, User, LogOut, FileText, Crown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import UPIPaymentModal from "@/components/upi-payment-modal"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { CONTEST_CONFIG, getCurrentSession } from "@/lib/contest-config"

interface ContestStats {
  currentSession: number
  currentSessionParticipants: number
  todayTotalParticipants: number
  totalParticipants: number
  currentSessionWinners: number
  availablePrizes: number
  remainingSlots: number
  winnersSelected: boolean
  sessionsData: Array<{
    session: number
    time: string
    label: string
    participants: number
    winners: number
    availablePrizes: number
    remainingSlots: number
  }>
}

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [stats, setStats] = useState<ContestStats>({
    currentSession: 1,
    currentSessionParticipants: 0,
    todayTotalParticipants: 0,
    totalParticipants: 0,
    currentSessionWinners: 0,
    availablePrizes: 0,
    remainingSlots: 1000000, // Updated to 10 lakh
    winnersSelected: false,
    sessionsData: [],
  })
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const router = useRouter()

  // Add a loading state
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/contest-stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          console.error("Failed to fetch stats:", response.statusText)
          // Set default values on error
          setStats({
            currentSession: 1,
            currentSessionParticipants: 0,
            todayTotalParticipants: 0,
            totalParticipants: 0,
            currentSessionWinners: 0,
            availablePrizes: 0,
            remainingSlots: 1000000, // Updated to 10 lakh
            winnersSelected: false,
            sessionsData: [],
          })
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error)
        // Set default values on error
        setStats({
          currentSession: 1,
          currentSessionParticipants: 0,
          todayTotalParticipants: 0,
          totalParticipants: 0,
          currentSessionWinners: 0,
          availablePrizes: 0,
          remainingSlots: 1000000, // Updated to 10 lakh
          winnersSelected: false,
          sessionsData: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if user is logged in
    if (!user) {
      setAuthMode("login")
      setShowAuth(true)
      toast({
        title: "Login Required",
        description: "Please login or create an account to enter the contest",
      })
      return
    }

    // Validate form first
    if (!formData.name || !formData.email || !formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    // Show payment modal
    setShowPayment(true)
  }

  const handleAuthSuccess = () => {
    setShowAuth(false)
    toast({
      title: "Welcome! 🎉",
      description: "You can now enter the contest",
    })
  }

  const handlePaymentSuccess = async (paymentData: any) => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/enter-contest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user?.id,
          paymentMethod: paymentData.method,
          paymentId: paymentData.paymentId,
          orderId: paymentData.orderId,
          entryFee: paymentData.amount,
          contestSession: getCurrentSession(),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Entry Confirmed! 🎉",
          description: "Your contest entry has been successfully registered!",
        })
        setShowPayment(false)

        // Refresh stats
        const statsResponse = await fetch("/api/contest-stats")
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } else {
        toast({
          title: "Registration Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please contact support.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
    toast({
      title: "Payment Cancelled",
      description: "You can try again anytime",
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogout = () => {
    logout()
    setFormData({ name: "", email: "", phone: "" })
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
  }

  const currentSessionInfo = CONTEST_CONFIG.SESSION_TIMES.find((s) => s.session === stats.currentSession)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C71852] via-[#4D0C3E] to-[#2E0C38]">
      {/* Header */}
      <header className="relative z-10 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">iPhone Contest</div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => router.push("/profile")}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  {user.name}
                </Button>
                <Button
                  onClick={() => router.push("/my-contests")}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  My Contests
                </Button>
                <Button
                  onClick={() => router.push("/winners")}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Winners
                </Button>
                <Button onClick={handleLogout} className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push("/winners")}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Winners
                </Button>
                <Button
                  onClick={() => {
                    setAuthMode("login")
                    setShowAuth(true)
                  }}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setAuthMode("register")
                    setShowAuth(true)
                  }}
                  className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Smartphone className="w-20 h-20 text-white animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-red-500 text-white animate-bounce">₹10 ONLY</Badge>
                </div>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
              Win iPhone 15
              <span className="block text-yellow-400">Every Day!</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-4 max-w-3xl mx-auto">
              Join up to 10 lakh participants in 3 daily sessions for a chance to win iPhone 15 devices!
            </p>
            <div className="flex items-center justify-center gap-2 mb-4">
              <IndianRupee className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold text-green-400">Only ₹10 Entry Fee</span>
              <Badge className="bg-green-500 text-white">Best Value!</Badge>
            </div>

            {/* Current Session Info */}
            {currentSessionInfo && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto mb-8">
                <h3 className="text-lg font-semibold text-white mb-2">Current Session</h3>
                <p className="text-yellow-400 font-bold">{currentSessionInfo.label}</p>
                <p className="text-gray-200 text-sm">
                  {stats.availablePrizes > 0
                    ? `${stats.availablePrizes} iPhone${stats.availablePrizes > 1 ? "s" : ""} available`
                    : "Need more participants for prizes"}
                </p>
              </div>
            )}

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      (stats.currentSessionParticipants || 0).toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Current Session</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      stats.availablePrizes || 0
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Prizes Available</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      (stats.todayTotalParticipants || 0).toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Today's Total</div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">
                    {isLoading ? (
                      <div className="animate-pulse bg-white/20 h-8 w-16 mx-auto rounded"></div>
                    ) : (
                      (stats.remainingSlots || 0).toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-gray-300">Slots Left</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Entry Form */}
          <div className="max-w-md mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Zap className="w-6 h-6 text-yellow-500" />
                  Enter Contest Now!
                </CardTitle>
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <IndianRupee className="w-5 h-5" />
                  <span className="text-lg font-bold">₹10 Entry Fee</span>
                </div>
                <p className="text-gray-600">Secure payment • Instant confirmation</p>
                {user && <p className="text-sm text-blue-600">Welcome back, {user.name}! 👋</p>}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-700 font-medium">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                      className="mt-1"
                      disabled={!!user}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="mt-1"
                      disabled={!!user}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-gray-700 font-medium">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      required
                      className="mt-1"
                      disabled={!!user}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#C71852] to-[#4D0C3E] hover:from-[#0E1122] hover:to-[#2E0C38] text-white font-bold py-3 text-lg"
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      {user ? "Pay ₹10 via UPI" : "Login & Pay ₹10"}
                    </div>
                  </Button>
                </form>

                <div className="mt-4 text-center text-sm text-gray-600">
                  <p>✅ Secure payment processing</p>
                  <p>✅ Instant email confirmation</p>
                  <p>✅ 3 daily contest sessions</p>
                  <p>✅ Free worldwide shipping</p>
                </div>

                <div className="mt-4 text-center">
                  <Button
                    onClick={() => router.push("/terms")}
                    variant="link"
                    className="text-[#C71852] hover:text-[#0E1122] p-0 h-auto text-sm"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Read Terms & Conditions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
        defaultMode={authMode}
      />

      {/* UPI Payment Modal */}
      <UPIPaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        onCancel={handlePaymentCancel}
        customerInfo={formData}
        amount={10}
      />

      {/* Contest Sessions Info */}
      <div className="py-16 bg-[#0E1122]/20 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Daily Contest Sessions</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {CONTEST_CONFIG.SESSION_TIMES.map((session, index) => {
              const sessionData = stats.sessionsData.find((s) => s.session === session.session)
              const isCurrentSession = stats.currentSession === session.session

              return (
                <Card
                  key={session.session}
                  className={`${
                    isCurrentSession ? "bg-[#C71852]/20 border-[#C71852]/30" : "bg-white/10 border-white/20"
                  } backdrop-blur-sm text-center`}
                >
                  <CardContent className="p-8">
                    <Clock
                      className={`w-16 h-16 mx-auto mb-4 ${isCurrentSession ? "text-[#C71852]" : "text-blue-400"}`}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">{session.label}</h3>
                    <p className="text-gray-300 mb-4">Session {session.session}</p>

                    {sessionData && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-200">
                          Participants: {sessionData.participants.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-200">Prizes: {sessionData.availablePrizes}</p>
                        {sessionData.winners > 0 && (
                          <Badge className="bg-green-600 text-white">{sessionData.winners} Winners!</Badge>
                        )}
                      </div>
                    )}

                    {isCurrentSession && <Badge className="bg-[#C71852] text-white mt-4">ACTIVE NOW</Badge>}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Prize Structure - Updated Style */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-4xl mx-auto">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-6">Contest Prize Structure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200 mb-6">
                {CONTEST_CONFIG.PRIZE_TIERS.map((tier, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span>{tier.minParticipants.toLocaleString()}+ participants</span>
                    <Badge className="bg-yellow-600 text-white">{tier.label}</Badge>
                  </div>
                ))}
              </div>
              <p className="text-gray-300 text-sm">
                * Minimum 50,000 participants required per session to distribute prizes
                <br />* Maximum 10 lakh participants per session
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gradient-to-r from-[#4D0C3E]/30 to-[#2E0C38]/30">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">Why Choose Our Contest?</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-8">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Multiple Daily Chances</h3>
                <p className="text-gray-300">
                  Three contest sessions daily means three chances to win! Morning, afternoon, and evening sessions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-8">
                <IndianRupee className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Just ₹10 Entry</h3>
                <p className="text-gray-300">
                  Incredibly affordable entry fee of just ₹10 per session. Win an iPhone 15 worth ₹80,000+ for the price
                  of a tea!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
              <CardContent className="p-8">
                <Gift className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-4">Dynamic Prizes</h3>
                <p className="text-gray-300">
                  More participants means more prizes! From 1 to 10 iPhone 15 devices per session based on
                  participation.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-[#0E1122]/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 iPhone Contest. All rights reserved.
            <span className="block mt-2 text-sm">
              3 daily contest sessions • Dynamic prize distribution • Fair &amp; transparent
            </span>
            <span className="block mt-1 text-sm">
              Entry fee: ₹10 per session • Secure payments • Participant risk acknowledged
            </span>
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push("/terms")} variant="link" className="text-gray-400 hover:text-white">
              <FileText className="w-4 h-4 mr-1" />
              Terms & Conditions
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
