// Contest configuration and rules
export const CONTEST_CONFIG = {
  SESSIONS_PER_DAY: 3,
  SESSION_TIMES: [
    { session: 1, time: "08:00", label: "Morning Contest (8:00 AM)" },
    { session: 2, time: "14:00", label: "Afternoon Contest (2:00 PM)" },
    { session: 3, time: "20:00", label: "Evening Contest (8:00 PM)" },
  ],
  PRIZE_TIERS: [
    { minParticipants: 100000, prizes: 10, label: "10 iPhones" },
    { minParticipants: 50000, prizes: 5, label: "5 iPhones" },
    { minParticipants: 25000, prizes: 3, label: "3 iPhones" },
    { minParticipants: 10000, prizes: 1, label: "1 iPhone" },
  ],
  ENTRY_FEE: 10,
  MAX_PARTICIPANTS_PER_SESSION: 100000,
}

export function getCurrentSession(): number {
  const now = new Date()
  const currentHour = now.getHours()

  if (currentHour < 8) return 1
  if (currentHour < 14) return 1
  if (currentHour < 20) return 2
  return 3
}

export function getNextSession(): { session: number; time: string; label: string } {
  const currentSession = getCurrentSession()
  const nextSessionIndex = currentSession % CONTEST_CONFIG.SESSIONS_PER_DAY
  return CONTEST_CONFIG.SESSION_TIMES[nextSessionIndex]
}

export function getPrizesForParticipants(participantCount: number): number {
  for (const tier of CONTEST_CONFIG.PRIZE_TIERS) {
    if (participantCount >= tier.minParticipants) {
      return tier.prizes
    }
  }
  return 0 // No prizes if minimum not met
}

export function getPrizeTierInfo(participantCount: number) {
  for (const tier of CONTEST_CONFIG.PRIZE_TIERS) {
    if (participantCount >= tier.minParticipants) {
      return tier
    }
  }
  return { minParticipants: 10000, prizes: 0, label: "Contest not eligible" }
}
