import mongoose, { Schema, Document, Model } from 'mongoose'
import { CLASS_LEVELS, ADMISSION_STATUSES } from '@/lib/student-constants'

export interface IStudent extends Document {
  firstName: string
  lastName: string
  dateOfBirth: Date
  gender: 'male' | 'female'
  classLevel: string
  admissionNumber?: string
  parentName?: string
  parentPhone?: string
  parentEmail?: string
  photoUrl?: string
  schoolId: mongoose.Types.ObjectId
  enrollmentDate: Date
  admissionStatus: (typeof ADMISSION_STATUSES)[number]
  currentBalance: number
  tcCertificateNumber?: string
  tcIssuedAt?: Date
  exitNotes?: string
  createdAt: Date
  updatedAt: Date
}

const StudentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    classLevel: { type: String, enum: CLASS_LEVELS, required: true },
    admissionNumber: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    parentEmail: { type: String, trim: true, lowercase: true },
    photoUrl: { type: String, trim: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    enrollmentDate: { type: Date, default: Date.now },
    admissionStatus: {
      type: String,
      enum: ADMISSION_STATUSES,
      default: 'Active',
    },
    currentBalance: { type: Number, default: 0 },
    tcCertificateNumber: { type: String, trim: true },
    tcIssuedAt: { type: Date },
    exitNotes: { type: String, trim: true },
  },
  { timestamps: true }
)

// Admission number must be unique within a school (sparse allows multiple nulls)
StudentSchema.index(
  { schoolId: 1, admissionNumber: 1 },
  { unique: true, sparse: true }
)

const Student: Model<IStudent> =
  mongoose.models.Student ?? mongoose.model<IStudent>('Student', StudentSchema)

export default Student
