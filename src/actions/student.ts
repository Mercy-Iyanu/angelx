'use server'

import { randomBytes } from 'crypto'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import Student from '@/models/Student'
import User from '@/models/User'
import School from '@/models/School'
import { getSession } from '@/lib/auth'
import { sendBalanceInvoiceEmail } from '@/lib/email'
import { CLASS_LEVELS, ADMISSION_STATUSES } from '@/lib/student-constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}

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
        parentEmail?: string[]
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
    parentEmail: (formData.get('parentEmail') as string)?.trim().toLowerCase() || undefined,
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

  if (raw.parentEmail && !EMAIL_RE.test(raw.parentEmail)) {
    errors.parentEmail = ['Please enter a valid email address.']
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
  parentEmail?: string
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

    const parentEmailRaw = row.parentEmail?.trim().toLowerCase()
    if (parentEmailRaw && !EMAIL_RE.test(parentEmailRaw)) {
      rowErrors.push(`parent email (got "${parentEmailRaw}")`)
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
      parentEmail: parentEmailRaw || undefined,
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

export type UpdateStudentState =
  | {
      success?: boolean
      errors?: {
        admissionStatus?: string[]
        currentBalance?: string[]
        parentEmail?: string[]
      }
      message?: string
    }
  | undefined

export async function updateStudent(
  studentId: string,
  _prevState: UpdateStudentState,
  formData: FormData
): Promise<UpdateStudentState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const admissionStatus = formData.get('admissionStatus') as string
  const currentBalanceRaw = (formData.get('currentBalance') as string)?.trim()
  const parentEmailRaw = (formData.get('parentEmail') as string)?.trim().toLowerCase()

  const errors: NonNullable<UpdateStudentState>['errors'] = {}

  if (!admissionStatus || !ADMISSION_STATUSES.includes(admissionStatus as never)) {
    errors.admissionStatus = ['Please select a valid admission status.']
  }

  const currentBalance = Number(currentBalanceRaw)
  if (!currentBalanceRaw || isNaN(currentBalance)) {
    errors.currentBalance = ['Please enter a valid balance.']
  }

  if (parentEmailRaw && !EMAIL_RE.test(parentEmailRaw)) {
    errors.parentEmail = ['Please enter a valid email address.']
  }

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) redirect('/dashboard/students')

  const student = await Student.findOneAndUpdate(
    { _id: studentId, schoolId: user.schoolId },
    parentEmailRaw
      ? { $set: { admissionStatus, currentBalance, parentEmail: parentEmailRaw } }
      : { $set: { admissionStatus, currentBalance }, $unset: { parentEmail: '' } }
  )

  if (!student) {
    return { message: 'Student not found.' }
  }

  revalidatePath(`/dashboard/students/${studentId}`)
  revalidatePath('/dashboard/students')
  return { success: true, message: 'Student updated successfully.' }
}

export type EmailInvoiceState =
  | { success?: boolean; message?: string }
  | undefined

export async function emailBalanceInvoice(
  studentId: string,
  _prevState: EmailInvoiceState,
  formData: FormData
): Promise<EmailInvoiceState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const parentEmailRaw = (formData.get('parentEmail') as string)?.trim().toLowerCase()
  if (!parentEmailRaw || !EMAIL_RE.test(parentEmailRaw)) {
    return { message: 'Please enter a valid parent email address.' }
  }

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) redirect('/dashboard/students')

  const student = await Student.findOne({ _id: studentId, schoolId: user.schoolId })
  if (!student) return { message: 'Student not found.' }

  if (student.currentBalance <= 0) {
    return { message: 'This student has no outstanding balance.' }
  }

  if (student.parentEmail !== parentEmailRaw) {
    student.parentEmail = parentEmailRaw
    await student.save()
  }

  const school = await School.findById(user.schoolId).select('name').lean()

  try {
    await sendBalanceInvoiceEmail(parentEmailRaw, {
      studentName: `${student.firstName} ${student.lastName}`,
      schoolName: (school?.name as string) ?? 'your school',
      balance: formatNaira(student.currentBalance),
    })
  } catch {
    return { message: 'Could not send the invoice email. Please try again.' }
  }

  revalidatePath(`/dashboard/students/${studentId}`)
  return { success: true, message: `Invoice emailed to ${parentEmailRaw}.` }
}

export type ClearanceState =
  | { success?: boolean; message?: string }
  | undefined

export async function confirmClearance(
  studentId: string,
  _prevState: ClearanceState,
  _formData: FormData
): Promise<ClearanceState> {
  const session = await getSession()
  if (!session) redirect('/login')

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) redirect('/dashboard/students')

  const certificateNumber = `TC-${new Date().getFullYear()}-${randomBytes(4).toString('hex').toUpperCase()}`

  const student = await Student.findOneAndUpdate(
    { _id: studentId, schoolId: user.schoolId },
    {
      currentBalance: 0,
      admissionStatus: 'Exited-Cleared',
      tcCertificateNumber: certificateNumber,
      tcIssuedAt: new Date(),
    }
  )

  if (!student) return { message: 'Student not found.' }

  revalidatePath(`/dashboard/students/${studentId}`)
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true, message: 'Clearance approved. Transfer Certificate issued.' }
}

export async function withdrawWithoutClearance(
  studentId: string,
  _prevState: ClearanceState,
  formData: FormData
): Promise<ClearanceState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const reason = (formData.get('reason') as string)?.trim()
  if (!reason) {
    return { message: 'Please provide a reason for withdrawing without clearance.' }
  }

  await connectDB()

  const user = await User.findById(session.userId).select('schoolId').lean()
  if (!user?.schoolId) redirect('/dashboard/students')

  const student = await Student.findOneAndUpdate(
    { _id: studentId, schoolId: user.schoolId },
    { admissionStatus: 'Exited-Unresolved', exitNotes: reason }
  )

  if (!student) return { message: 'Student not found.' }

  revalidatePath(`/dashboard/students/${studentId}`)
  revalidatePath('/dashboard/students')
  revalidatePath('/dashboard')
  return { success: true, message: 'Student marked as exited without clearance.' }
}
