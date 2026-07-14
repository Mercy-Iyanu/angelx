'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'
import User from '@/models/User'
import { getSession } from '@/lib/auth'
import { CLASS_LEVELS, ADMISSION_STATUSES } from '@/lib/student-constants'

export type StudentFormState =
  | {
      success?: boolean
      errors?: {
        firstName?: string[]
        lastName?: string[]
        dateOfBirth?: string[]
        gender?: string[]
        classLevel?: string[]
        admissionNumber?: string[]
        parentPhone?: string[]
        admissionStatus?: string[]
        currentBalance?: string[]
      }
      message?: string
    }
  | undefined

export async function createStudent(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    firstName: (formData.get('firstName') as string)?.trim(),
    lastName: (formData.get('lastName') as string)?.trim(),
    dateOfBirth: (formData.get('dateOfBirth') as string)?.trim(),
    gender: formData.get('gender') as string,
    classLevel: formData.get('classLevel') as string,
    admissionNumber: (formData.get('admissionNumber') as string)?.trim() || undefined,
    parentName: (formData.get('parentName') as string)?.trim() || undefined,
    parentPhone: (formData.get('parentPhone') as string)?.trim() || undefined,
  }

  const admissionStatusRaw = (formData.get('admissionStatus') as string)?.trim()
  const currentBalanceRaw = (formData.get('currentBalance') as string)?.trim()

  const errors: NonNullable<StudentFormState>['errors'] = {}

  if (!raw.firstName) errors.firstName = ['First name is required.']
  if (!raw.lastName) errors.lastName = ['Last name is required.']

  if (!raw.dateOfBirth) {
    errors.dateOfBirth = ['Date of birth is required.']
  } else {
    const dob = new Date(raw.dateOfBirth)
    if (isNaN(dob.getTime()) || dob >= new Date()) {
      errors.dateOfBirth = ['Please enter a valid date of birth.']
    }
  }

  if (!raw.gender || !['male', 'female'].includes(raw.gender)) {
    errors.gender = ['Please select a gender.']
  }

  if (!raw.classLevel || !CLASS_LEVELS.includes(raw.classLevel as never)) {
    errors.classLevel = ['Please select a valid class level.']
  }

  if (raw.parentPhone && !/^\+?[0-9\s\-]{10,15}$/.test(raw.parentPhone)) {
    errors.parentPhone = ['Please enter a valid phone number.']
  }

  let admissionStatus = 'Active'
  if (admissionStatusRaw) {
    if (!ADMISSION_STATUSES.includes(admissionStatusRaw as never)) {
      errors.admissionStatus = ['Please select a valid admission status.']
    } else {
      admissionStatus = admissionStatusRaw
    }
  }

  let currentBalance = 0
  if (currentBalanceRaw) {
    const parsed = Number(currentBalanceRaw)
    if (isNaN(parsed)) {
      errors.currentBalance = ['Please enter a valid balance.']
    } else {
      currentBalance = parsed
    }
  }

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) {
    return { message: 'You must register a school before adding students.' }
  }

  if (raw.admissionNumber) {
    const duplicate = await Student.findOne({
      schoolId: user.schoolId,
      admissionNumber: raw.admissionNumber,
    })
    if (duplicate) {
      return {
        errors: { admissionNumber: ['This admission number is already in use.'] },
      }
    }
  }

  await Student.create({
    ...raw,
    gender: raw.gender as 'male' | 'female',
    dateOfBirth: new Date(raw.dateOfBirth),
    schoolId: user.schoolId,
    admissionStatus: admissionStatus as (typeof ADMISSION_STATUSES)[number],
    currentBalance,
  })

  revalidatePath('/dashboard/students')
  return { success: true, message: 'Student added successfully.' }
}

export type ImportRow = {
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  classLevel: string
  admissionNumber?: string
  parentName?: string
  parentPhone?: string
  admissionStatus?: string
  currentBalance?: string
}

export type ImportResult = {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

export async function importStudents(rows: ImportRow[]): Promise<ImportResult> {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: ['Register a school first.'],
    }
  }

  const docs: object[] = []
  const errors: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2 // +2 because row 1 is the CSV header
    const rowErrors: string[] = []

    if (!row.firstName?.trim()) rowErrors.push('first name')
    if (!row.lastName?.trim()) rowErrors.push('last name')

    const dob = row.dateOfBirth ? new Date(row.dateOfBirth) : null
    if (!dob || isNaN(dob.getTime()) || dob >= new Date()) {
      rowErrors.push('date of birth (use YYYY-MM-DD, must be in the past)')
    }

    const gender = row.gender?.toLowerCase()
    if (!['male', 'female'].includes(gender ?? '')) {
      rowErrors.push('gender (must be "male" or "female")')
    }

    if (!CLASS_LEVELS.includes(row.classLevel as never)) {
      rowErrors.push(`class level (got "${row.classLevel}")`)
    }

    let admissionStatus: (typeof ADMISSION_STATUSES)[number] = 'Active'
    const admissionStatusRaw = row.admissionStatus?.trim()
    if (admissionStatusRaw) {
      const match = ADMISSION_STATUSES.find(
        (s) => s.toLowerCase() === admissionStatusRaw.toLowerCase()
      )
      if (!match) {
        rowErrors.push(`admission status (got "${admissionStatusRaw}")`)
      } else {
        admissionStatus = match
      }
    }

    let currentBalance = 0
    const currentBalanceRaw = row.currentBalance?.trim()
    if (currentBalanceRaw) {
      const parsed = Number(currentBalanceRaw)
      if (isNaN(parsed)) {
        rowErrors.push('current balance (must be a number)')
      } else {
        currentBalance = parsed
      }
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${rowNum}: invalid ${rowErrors.join(', ')}`)
      continue
    }

    docs.push({
      firstName: row.firstName.trim(),
      lastName: row.lastName.trim(),
      dateOfBirth: dob,
      gender: gender as 'male' | 'female',
      classLevel: row.classLevel,
      admissionNumber: row.admissionNumber?.trim() || undefined,
      parentName: row.parentName?.trim() || undefined,
      parentPhone: row.parentPhone?.trim() || undefined,
      schoolId: user.schoolId,
      enrollmentDate: new Date(),
      admissionStatus,
      currentBalance,
    })
  }

  let imported = 0
  let skipped = 0

  if (docs.length > 0) {
    try {
      const inserted = await Student.insertMany(docs, { ordered: false })
      imported = inserted.length
    } catch (e: unknown) {
      // With ordered:false, a BulkWriteError is thrown but partial inserts succeed
      const bulk = e as { result?: { nInserted?: number } }
      imported = bulk.result?.nInserted ?? 0
      skipped = docs.length - imported
    }
  }

  revalidatePath('/dashboard/students')
  return { success: true, imported, skipped, errors }
}

export type UpdateStudentStatusState =
  | {
      success?: boolean
      errors?: {
        admissionStatus?: string[]
        currentBalance?: string[]
      }
      message?: string
    }
  | undefined

export async function updateStudentStatus(
  studentId: string,
  _prevState: UpdateStudentStatusState,
  formData: FormData
): Promise<UpdateStudentStatusState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const admissionStatus = formData.get('admissionStatus') as string
  const currentBalanceRaw = (formData.get('currentBalance') as string)?.trim()

  const errors: NonNullable<UpdateStudentStatusState>['errors'] = {}

  if (!admissionStatus || !ADMISSION_STATUSES.includes(admissionStatus as never)) {
    errors.admissionStatus = ['Please select a valid admission status.']
  }

  const currentBalance = Number(currentBalanceRaw)
  if (!currentBalanceRaw || isNaN(currentBalance)) {
    errors.currentBalance = ['Please enter a valid balance.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) redirect('/dashboard/students')

  const student = await Student.findOneAndUpdate(
    { _id: studentId, schoolId: user.schoolId },
    { admissionStatus, currentBalance }
  )

  if (!student) {
    return { message: 'Student not found.' }
  }

  revalidatePath(`/dashboard/students/${studentId}`)
  revalidatePath('/dashboard/students')
  return { success: true, message: 'Student updated successfully.' }
}
