// Lightweight cross-school pupil match scoring (Phase 3). No fuzzy-matching
// library is installed, so this is a small weighted heuristic rather than a
// true string-distance algorithm — good enough to rank candidates for a human
// to review, not meant to be a silent auto-match.

export const MIN_MATCH_SCORE = 40

export function normalizeName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

export function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(-10)
}

function nameScore(a: string, b: string, weight: number) {
  const na = normalizeName(a)
  const nb = normalizeName(b)
  if (!na || !nb) return 0
  if (na === nb) return weight
  if (na.startsWith(nb) || nb.startsWith(na)) return Math.round(weight * 0.5)
  return 0
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function scorePupilMatch(
  query: {
    firstName: string
    lastName: string
    dateOfBirth?: string
    parentPhone?: string
  },
  candidate: {
    firstName: string
    lastName: string
    dateOfBirth: Date
    parentPhone?: string
  }
): number {
  let score = 0

  score += nameScore(query.firstName, candidate.firstName, 30)
  score += nameScore(query.lastName, candidate.lastName, 30)

  if (query.dateOfBirth) {
    const dob = new Date(query.dateOfBirth)
    if (!isNaN(dob.getTime()) && sameDay(dob, candidate.dateOfBirth)) {
      score += 25
    }
  }

  if (query.parentPhone && candidate.parentPhone) {
    const a = normalizePhone(query.parentPhone)
    const b = normalizePhone(candidate.parentPhone)
    if (a.length === 10 && a === b) score += 15
  }

  return score
}
