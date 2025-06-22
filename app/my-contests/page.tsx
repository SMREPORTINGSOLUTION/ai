"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Clock, IndianRupee, Search, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

interface ContestEntry {
  id: string
  entry_date: string
  entry_time: string
  contest_session: number
  is_winner: boolean
  prize_position?: number
  payment_method: string
  entry_fee: number
  payment_status: string
  contest_date: string
}

export default function MyContestsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [contests, setContests] = useState<ContestEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "won" | "lost">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    fetchUserContests()
  }, [user, router])

  const fetchUserContests = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/contests?userId=${user.id}`)
      const data = await response.json()

      if (data.success) {
        setContests(data.contests)
      }
    } catch (error) {
      console.error("Failed to fetch user contests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContests = contests.filter((contest) => {
    const matchesFilter =
      filter === "all" || (filter === "won" && contest.is_winner) || (filter === "lost" && !contest.is_winner)

    const matchesSearch =
      searchTerm === "" || contest.contest_date.includes(searchTerm) || contest.entry_date.includes(searchTerm)

    return matchesFilter && matchesSearch
  })

  const stats = {
    total: contests.length,
    won: contests.filter((c) => c.is_winner).length,
    lost: contests.filter((c) => !c.is_winner).length,
    totalSpent: contests.reduce((sum, c) => sum + c.entry_fee, 0),
  }

  const getSessionLabel = (session: number) => {
    const sessionLabels = {
      1: "Morning (8:00 AM)",
      2: "Afternoon (2:00 PM)",
      3: "Evening (8:00 PM)",
    }
    return sessionLabels[session as keyof typeof sessionLabels] || `Session ${session}`
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E0C38] via-[#4D0C3E] to-[#C71852]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Please Login</h2>
          <Button onClick={() => router.push("/")} className="bg-[#C71852] hover:bg-[#0E1122]">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E0C38] via-[#4D0C3E] to-[#C71852] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push("/profile")}
              className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">My Contest History</h1>
          <p className="text-gray-200">Track all your contest entries and wins</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-[#C71852] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-gray-200">Total Entries</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.won}</div>
              <div className="text-sm text-gray-200">Contests Won</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.lost}</div>
              <div className="text-sm text-gray-200">Contests Lost</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <IndianRupee className="w-8 h-8 text-[#C71852] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">₹{stats.totalSpent}</div>
              <div className="text-sm text-gray-200">Total Spent</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                <Button
                  onClick={() => setFilter("all")}
                  variant={filter === "all" ? "default" : "outline"}
                  size="sm"
                  className={
                    filter === "all"
                      ? "bg-[#C71852] hover:bg-[#0E1122]"
                      : "bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                  }
                >
                  All ({stats.total})
                </Button>
                <Button
                  onClick={() => setFilter("won")}
                  variant={filter === "won" ? "default" : "outline"}
                  size="sm"
                  className={
                    filter === "won"
                      ? "bg-[#C71852] hover:bg-[#0E1122]"
                      : "bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                  }
                >
                  Won ({stats.won})
                </Button>
                <Button
                  onClick={() => setFilter("lost")}
                  variant={filter === "lost" ? "default" : "outline"}
                  size="sm"
                  className={
                    filter === "lost"
                      ? "bg-[#C71852] hover:bg-[#0E1122]"
                      : "bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
                  }
                >
                  Lost ({stats.lost})
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/10 border-white/30 text-white placeholder-gray-400 focus:ring-[#C71852]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contest List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C71852] mx-auto"></div>
            <p className="mt-4 text-gray-200">Loading your contests...</p>
          </div>
        ) : filteredContests.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No Contests Found</h3>
              <p className="text-gray-300 mb-6">
                {contests.length === 0
                  ? "You haven't entered any contests yet."
                  : "No contests match your current filter."}
              </p>
              <Button onClick={() => router.push("/")} className="bg-[#C71852] hover:bg-[#0E1122]">
                Enter Your First Contest
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredContests.map((contest) => (
              <Card
                key={contest.id}
                className={
                  contest.is_winner
                    ? "bg-[#C71852]/20 backdrop-blur-sm border-[#C71852]/30"
                    : "bg-white/10 backdrop-blur-sm border-white/20"
                }
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{new Date(contest.contest_date).getDate()}</div>
                        <div className="text-sm text-gray-200">
                          {new Date(contest.contest_date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg text-white">iPhone 15 Contest</h3>
                        <p className="text-yellow-400 font-medium">{getSessionLabel(contest.contest_session)}</p>
                        <p className="text-gray-200">
                          Entered on {new Date(contest.entry_time).toLocaleDateString()} at{" "}
                          {new Date(contest.entry_time).toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="border-[#C71852]/50 text-[#C71852]">
                            ₹{contest.entry_fee}
                          </Badge>
                          <Badge variant="outline" className="border-white/30 text-white">
                            {contest.payment_method.toUpperCase()}
                          </Badge>
                          <Badge
                            variant={contest.payment_status === "completed" ? "default" : "destructive"}
                            className={contest.payment_status === "completed" ? "bg-green-600" : ""}
                          >
                            {contest.payment_status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {contest.is_winner ? (
                        <div>
                          <Badge className="bg-[#C71852] text-white mb-2 hover:bg-[#C71852]">
                            <Trophy className="w-4 h-4 mr-1" />
                            WINNER!
                          </Badge>
                          <p className="text-sm text-[#C71852] font-semibold">Position #{contest.prize_position}</p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-600 text-white">
                          Not Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination could be added here for large datasets */}
        {filteredContests.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-200">
              Showing {filteredContests.length} of {contests.length} contests
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
