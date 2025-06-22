// Direct database operations using the connection string
const DB_URL = "postgresql://postgres:Ramesh123Mani123Selvi123@db.ojtwtbodxamejkzfycpl.supabase.co:5432/postgres"

interface QueryResult {
  rows: any[]
  rowCount: number
}

export async function executeQuery(query: string, params: any[] = []): Promise<QueryResult> {
  // For now, we'll simulate the database operations
  // In a real implementation, you'd use a PostgreSQL client like 'pg'

  console.log("Executing query:", query, "with params:", params)

  // Mock data for development
  const today = new Date().toISOString().split("T")[0]

  if (query.includes("COUNT(*) FROM participants")) {
    if (query.includes(`entry_date = '${today}'`)) {
      return { rows: [{ count: Math.floor(Math.random() * 1000) + 100 }], rowCount: 1 }
    } else {
      return { rows: [{ count: Math.floor(Math.random() * 10000) + 5000 }], rowCount: 1 }
    }
  }

  if (query.includes("COUNT(*) FROM winners")) {
    return { rows: [{ count: Math.floor(Math.random() * 100) }], rowCount: 1 }
  }

  return { rows: [], rowCount: 0 }
}

export async function getContestStats() {
  const today = new Date().toISOString().split("T")[0]

  try {
    // Get today's participants
    const todayResult = await executeQuery(`SELECT COUNT(*) as count FROM participants WHERE entry_date = $1`, [today])

    // Get total participants
    const totalResult = await executeQuery(`SELECT COUNT(*) as count FROM participants`)

    // Get today's winners
    const winnersResult = await executeQuery(`SELECT COUNT(*) as count FROM winners WHERE contest_date = $1`, [today])

    const todayCount = todayResult.rows[0]?.count || 0
    const totalCount = totalResult.rows[0]?.count || 0
    const winnersCount = winnersResult.rows[0]?.count || 0

    return {
      todayParticipants: Number(todayCount),
      totalParticipants: Number(totalCount),
      todayWinners: Number(winnersCount),
      remainingSlots: Math.max(0, 100000 - Number(todayCount)),
    }
  } catch (error) {
    console.error("Database query error:", error)
    // Return default values on error
    return {
      todayParticipants: 0,
      totalParticipants: 0,
      todayWinners: 0,
      remainingSlots: 100000,
    }
  }
}
