import { randomBytes } from 'crypto'

// A pupil's Education ID — minted once at first registration and meant to
// follow them across schools (see resolveEid in src/actions/student.ts, which
// looks for an existing EID before calling this, so a returning pupil is
// linked rather than re-minted). Deliberately simple — no LGA/year encoding —
// mirrors the existing TC certificate number style (`TC-<year>-<hex>` in
// confirmClearance) without adding structure that isn't needed yet.
export function generateEid(): string {
  return `EID-${randomBytes(4).toString('hex').toUpperCase()}`
}
