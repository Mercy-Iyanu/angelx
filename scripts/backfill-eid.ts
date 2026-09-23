// One-off migration: assign an EID to every existing Student created before
// the EID feature shipped. Run with `npm run backfill-eid`.
//
// Mirrors resolveEid() in src/actions/student.ts: before minting a fresh EID
// for a student, it checks for a strong cross-school match (same scoring as
// Phase 3 search) among students who already have one — so a pupil who's
// already enrolled/EID'd at another school gets linked instead of getting a
// second, duplicate identity. Processes oldest-created students first, so the
// earliest record of a pupil is the one whose EID the rest link to.
//
// This file is plain TypeScript run via tsx, not part of the Next.js app —
// it connects to Mongo directly rather than importing src/lib/mongodb.ts, so
// it can load .env.local itself before anything reads process.env.

import { readFileSync } from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import Student from '../src/models/Student'
import { scorePupilMatch } from '../src/lib/match-score'
import { generateEid } from '../src/lib/eid'

// Same threshold as STRONG_EID_MATCH_SCORE in src/actions/student.ts's
// resolveEid() — kept in sync manually since that constant isn't exported
// ('use server' files may only export async actions).
const STRONG_EID_MATCH_SCORE = 70

function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // .env.local not found — assume MONGODB_URI is already set in the shell.
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function run() {
  loadEnvLocal()

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.error('MONGODB_URI is not set (checked .env.local and the environment).')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log('Connected to MongoDB.')

  // Make sure the unique sparse eid index actually exists before we start
  // writing — catches any pre-existing bad data early instead of mid-run.
  await Student.syncIndexes()

  const missing = await Student.find({
    $or: [{ eid: { $exists: false } }, { eid: null }, { eid: '' }],
  })
    .select('firstName lastName dateOfBirth parentPhone schoolId eid')
    .sort({ createdAt: 1 })
    .lean()

  if (missing.length === 0) {
    console.log('No students are missing an EID. Nothing to do.')
    await mongoose.disconnect()
    return
  }

  console.log(`Found ${missing.length} student(s) without an EID.\n`)

  let linked = 0
  let minted = 0

  for (const student of missing) {
    const others = await Student.find({
      _id: { $ne: student._id },
      schoolId: { $ne: student.schoolId },
      lastName: new RegExp(`^${escapeRegExp(student.lastName as string)}`, 'i'),
      eid: { $exists: true, $nin: [null, ''] },
    })
      .select('firstName lastName dateOfBirth parentPhone eid')
      .limit(50)
      .lean()

    const strongMatches = others.filter(
      (o) =>
        scorePupilMatch(
          {
            firstName: student.firstName as string,
            lastName: student.lastName as string,
            dateOfBirth: (student.dateOfBirth as Date).toISOString(),
            parentPhone: student.parentPhone as string | undefined,
          },
          {
            firstName: o.firstName as string,
            lastName: o.lastName as string,
            dateOfBirth: o.dateOfBirth as Date,
            parentPhone: o.parentPhone as string | undefined,
          }
        ) >= STRONG_EID_MATCH_SCORE
    )

    let eid: string
    let wasLinked = false

    if (strongMatches.length === 1) {
      eid = strongMatches[0].eid as string
      wasLinked = true
      linked++
    } else {
      eid = generateEid()
      while (await Student.exists({ eid })) {
        eid = generateEid()
      }
      minted++
    }

    await Student.updateOne({ _id: student._id }, { $set: { eid } })
    console.log(
      `  ${student.firstName} ${student.lastName} -> ${eid}${wasLinked ? ' (linked to existing pupil)' : ''}`
    )
  }

  console.log(`\nDone. Minted ${minted} new EID(s), linked ${linked} to an existing pupil.`)
  await mongoose.disconnect()
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
