'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { connectDB } from '@/lib/mongodb'
import School, { SCHOOL_TYPES, OGUN_LGAS, type SchoolType, type OgunLGA } from '@/models/School'
import User from '@/models/User'
import { getSession } from '@/lib/auth'

export type SchoolFormState =
  | {
      success?: boolean
      errors?: {
        name?: string[]
        nappsRegNumber?: string[]
        schoolType?: string[]
        yearEstablished?: string[]
        studentPopulation?: string[]
        lga?: string[]
        town?: string[]
        address?: string[]
        phone?: string[]
        proprietorName?: string[]
        proprietorPhone?: string[]
      }
      message?: string
    }
  | undefined

export async function createSchool(
  prevState: SchoolFormState,
  formData: FormData
): Promise<SchoolFormState> {
  const session = await getSession()
  if (!session) redirect('/login')

  const currentYear = new Date().getFullYear()

  const raw = {
    name: (formData.get('name') as string)?.trim(),
    nappsRegNumber: (formData.get('nappsRegNumber') as string)?.trim(),
    schoolType: formData.get('schoolType') as string,
    yearEstablished: Number(formData.get('yearEstablished')),
    studentPopulation: Number(formData.get('studentPopulation')),
    lga: formData.get('lga') as string,
    town: (formData.get('town') as string)?.trim(),
    address: (formData.get('address') as string)?.trim(),
    phone: (formData.get('phone') as string)?.trim(),
    proprietorName: (formData.get('proprietorName') as string)?.trim(),
    proprietorPhone: (formData.get('proprietorPhone') as string)?.trim(),
  }

  const errors: NonNullable<SchoolFormState>['errors'] = {}

  if (!raw.name) errors.name = ['School name is required.']

  if (!raw.nappsRegNumber)
    errors.nappsRegNumber = ['NAPPS registration number is required.']

  if (!raw.schoolType || !SCHOOL_TYPES.includes(raw.schoolType as never))
    errors.schoolType = ['Please select a valid school type.']

  if (!raw.yearEstablished || raw.yearEstablished < 1800 || raw.yearEstablished > currentYear)
    errors.yearEstablished = [`Year must be between 1800 and ${currentYear}.`]

  if (!raw.studentPopulation || raw.studentPopulation < 1)
    errors.studentPopulation = ['Please enter a valid student population.']

  if (!raw.lga || !OGUN_LGAS.includes(raw.lga as never))
    errors.lga = ['Please select a valid LGA.']

  if (!raw.town) errors.town = ['Town is required.']

  if (!raw.address) errors.address = ['Address is required.']

  if (!raw.phone || !/^\+?[0-9\s\-]{10,15}$/.test(raw.phone))
    errors.phone = ['Please enter a valid phone number.']

  if (!raw.proprietorName)
    errors.proprietorName = ["Proprietor's full name is required."]

  if (!raw.proprietorPhone || !/^\+?[0-9\s\-]{10,15}$/.test(raw.proprietorPhone))
    errors.proprietorPhone = ["Please enter a valid proprietor's phone number."]

  if (Object.keys(errors).length > 0) return { errors }

  await connectDB()

  const user = await User.findById(session.userId)
  if (!user) redirect('/login')

  if (user.schoolId) {
    return { message: 'Your school registration is already complete.' }
  }

  const duplicate = await School.findOne({ nappsRegNumber: raw.nappsRegNumber })
  if (duplicate) {
    return {
      errors: {
        nappsRegNumber: [
          'A school with this NAPPS registration number already exists.',
        ],
      },
    }
  }

  const school = await School.create({
    ...raw,
    schoolType: raw.schoolType as SchoolType,
    lga: raw.lga as OgunLGA,
    createdBy: user._id,
  })

  await User.findByIdAndUpdate(user._id, { schoolId: school._id })

  revalidatePath('/dashboard')
  return { success: true, message: 'Your school has been registered successfully. Welcome to AngelX!' }
}
