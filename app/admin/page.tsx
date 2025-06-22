"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Trophy, Calendar, Download, Mail, Database, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminStats {
  todayParticipants: number
  totalParticipants: number
  todayWinners: number
  remainingSlots: number
  winnersSelected: boolean
  recentEntries: Array<{ name: string; entry_time: string }>
  lastUpdated: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    todayParticipants: 0,
    totalParticipants: 0,
    todayWinners: 0,
    remainingSlots: 100000,
    winnersSelected: false,
    recentEntries: [],
    lastUpdated: new Date().toISOString(),
  })
  const [isSelectingWinners, setIsSelectingWinners] = useState(false)
  const [isTestingDb, setIsTestingDb] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/contest-stats")
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const testDatabase = async () => {
    setIsTestingDb(true)
    try {
      const response = await fetch("/api/test-db")
      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Database Test Successful! ✅",
          description: `Connected to tables: ${data.tables.join(", ")}`,
        })
      } else {
        toast({
          title: "Database Test Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Database Test Error",
        description: "Failed to test database connection",
        variant: "destructive",
      })
    } finally {
      setIsTestingDb(false)
    }
  }

  const selectWinners = async () => {
    setIsSelectingWinners(true)
    try {
      const response = await fetch("/api/select-winners", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Winners Selected! 🎉",
          description: data.message,
        })
        fetchStats()
      } else {
        toast({
          title: "Selection Failed",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to select winners",
        variant: "destructive",
      })
    } finally {
      setIsSelectingWinners(false)
    }
  }

  const exportData = async (type: "participants" | "winners") => {
    try {
      const today = new Date().toISOString().split("T")[0]
      const response = await fetch(`/api/export-data?type=${type}&date=${today}`)

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${type}-${today}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Export Successful! 📊",
          description: `${type} data downloaded as CSV`,
        })
      } else {
        throw new Error("Export failed")
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: `Failed to export ${type} data`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contest Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage daily iPhone 15 contests • Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        {/* Database Test */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Database Connection</span>
              </div>
              <Button onClick={testDatabase} disabled={isTestingDb} variant="outline" size="sm">
                {isTestingDb ? "Testing..." : "Test Connection"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats.remainingSlots.toLocaleString()} slots remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParticipants.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All-time entries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Winners</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayWinners}</div>
              <p className="text-xs text-muted-foreground">Out of 100 prizes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contest Status</CardTitle>
              <Badge variant={stats.winnersSelected ? "default" : "secondary"}>
                {stats.winnersSelected ? "Completed" : "Active"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winnersSelected ? "✅" : "🔄"}</div>
              <p className="text-xs text-muted-foreground">
                {stats.winnersSelected ? "Winners selected" : "In progress"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Winner Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Select 100 random winners from today's participants and send notification emails.
              </p>
              <Button onClick={selectWinners} disabled={isSelectingWinners || stats.winnersSelected} className="w-full">
                {isSelectingWinners ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Selecting Winners...
                  </div>
                ) : stats.winnersSelected ? (
                  "Winners Already Selected"
                ) : (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Select Today's Winners
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Download participant data and winner lists for record keeping.</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" onClick={() => exportData("participants")}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Today's Participants
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => exportData("winners")}
                  disabled={!stats.winnersSelected}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Export Winner List
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Live Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Live Entries: {stats.todayParticipants.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Updates every 3 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentEntries.length > 0 ? (
                  stats.recentEntries.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{entry.name}</span>
                      <span className="text-sm text-gray-500">{new Date(entry.entry_time).toLocaleTimeString()}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent entries</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
