import mongoose, { Schema, Document, Model } from 'mongoose'
import { SCHOOL_TYPES, OGUN_LGAS } from '@/lib/school-constants'

export type { SchoolType, OgunLGA } from '@/lib/school-constants'
export { SCHOOL_TYPES, OGUN_LGAS } from '@/lib/school-constants'

export type NappsVerificationStatus = 'pending' | 'verified' | 'rejected'

export interface ISchool extends Document {
  name: string
  nappsRegNumber: string
  schoolType: (typeof SCHOOL_TYPES)[number]
  yearEstablished: number
  studentPopulation: number
  lga: (typeof OGUN_LGAS)[number]
  town: string
  address: string
  phone: string
  proprietorName: string
  proprietorPhone: string
  createdBy: mongoose.Types.ObjectId
  nappsVerificationStatus: NappsVerificationStatus
  createdAt: Date
  updatedAt: Date
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true },
    nappsRegNumber: { type: String, required: true, unique: true, trim: true },
    schoolType: { type: String, enum: SCHOOL_TYPES, required: true },
    yearEstablished: { type: Number, required: true },
    studentPopulation: { type: Number, required: true },
    lga: { type: String, enum: OGUN_LGAS, required: true },
    town: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    proprietorName: { type: String, required: true, trim: true },
    proprietorPhone: { type: String, required: true, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    nappsVerificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
)

const School: Model<ISchool> =
  mongoose.models.School ?? mongoose.model<ISchool>('School', SchoolSchema)

export default School
