"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trophy, Calendar, Search, ArrowLeft, Crown, Gift, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { CONTEST_CONFIG } from "@/lib/contest-config"

interface Winner {
  id: string
  name: string
  prize_position: number
  contest_date: string
  contest_session: number
  created_at: string
}

interface DailyWinners {
  date: string
  sessions: {
    session: number
    time: string
    label: string
    winners: Winner[]
    totalPrizes: number
  }[]
}

export default function WinnersPage() {
  const router = useRouter()
  const [winners, setWinners] = useState<DailyWinners[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("")

  useEffect(() => {
    fetchWinners()
  }, [])

  const fetchWinners = async () => {
    try {
      const response = await fetch("/api/winners/list")
      const data = await response.json()

      if (data.success) {
        setWinners(data.winners)
      }
    } catch (error) {
      console.error("Failed to fetch winners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredWinners = winners.filter((day) => {
    const matchesDate = selectedDate === "" || day.date === selectedDate
    const matchesSearch =
      searchTerm === "" ||
      day.sessions.some((session) =>
        session.winners.some((winner) => winner.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    return matchesDate && matchesSearch
  })

  const totalWinners = winners.reduce(
    (total, day) => total + day.sessions.reduce((dayTotal, session) => dayTotal + session.winners.length, 0),
    0,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E0C38] via-[#4D0C3E] to-[#C71852] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-white text-[#C71852] hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Contest
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Crown className="w-8 h-8 text-yellow-400" />
            Contest Winners
          </h1>
          <p className="text-gray-200">Celebrating our daily iPhone 15 winners across all contest sessions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{totalWinners}</div>
              <div className="text-sm text-gray-200">Total Winners</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 text-[#C71852] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{winners.length}</div>
              <div className="text-sm text-gray-200">Contest Days</div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Gift className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{CONTEST_CONFIG.SESSIONS_PER_DAY}</div>
              <div className="text-sm text-gray-200">Daily Sessions</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-1">Filter by Date</label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-white/10 border-white/30 text-white focus:ring-[#C71852]"
                  />
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search winner names..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-white/10 border-white/30 text-white placeholder-gray-400 focus:ring-[#C71852]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Winners List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C71852] mx-auto"></div>
            <p className="mt-4 text-gray-200">Loading winners...</p>
          </div>
        ) : filteredWinners.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-200 mb-2">No Winners Found</h3>
              <p className="text-gray-300 mb-6">No winners match your current search criteria.</p>
              <Button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedDate("")
                }}
                className="bg-[#C71852] hover:bg-[#0E1122]"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredWinners.map((day) => (
              <Card key={day.date} className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-6 h-6 text-[#C71852]" />
                      <span>
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <Badge className="bg-[#C71852] text-white">
                      {day.sessions.reduce((total, session) => total + session.winners.length, 0)} Winners
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {day.sessions.map((session) => (
                      <div key={session.session} className="border-l-4 border-[#C71852] pl-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            {session.label}
                          </h4>
                          <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                            {session.winners.length} of {session.totalPrizes} Prizes
                          </Badge>
                        </div>

                        {session.winners.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {session.winners.map((winner) => (
                              <div
                                key={winner.id}
                                className="bg-gradient-to-r from-yellow-400/20 to-[#C71852]/20 p-3 rounded-lg border border-yellow-400/30"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-white">{winner.name}</p>
                                    <p className="text-sm text-gray-200">Position #{winner.prize_position}</p>
                                  </div>
                                  <Crown className="w-6 h-6 text-yellow-400" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-300">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No winners for this session</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Contest Rules Info */}
        <Card className="mt-8 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <Gift className="w-16 h-16 text-[#C71852] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-6">Contest Prize Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200 mb-6">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>10 lakh+ participants</span>
                <Badge className="bg-yellow-600 text-white">10 iPhones</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>5 lakh+ participants</span>
                <Badge className="bg-yellow-600 text-white">5 iPhones</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>2.5 lakh+ participants</span>
                <Badge className="bg-yellow-600 text-white">3 iPhones</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span>1 lakh+ participants</span>
                <Badge className="bg-yellow-600 text-white">2 iPhones</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg md:col-span-2">
                <span>50,000+ participants</span>
                <Badge className="bg-yellow-600 text-white">1 iPhone</Badge>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              * Winners are selected randomly from eligible participants. Minimum 50,000 participants required per
              session to distribute prizes.
              <br />* Maximum 10 lakh participants per session across 3 daily sessions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
