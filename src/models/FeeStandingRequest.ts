import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFeeStandingSnapshot {
  admissionStatus: string
  currentBalance: number
  exitNotes: string
  classLevel: string
  schoolName: string
  schoolPhone: string
  proprietorName: string
  proprietorPhone: string
  contactEmail: string
}

export interface IFeeStandingRequest extends Document {
  requestingSchoolId: mongoose.Types.ObjectId
  requestingUserId: mongoose.Types.ObjectId
  targetStudentId: mongoose.Types.ObjectId
  targetSchoolId: mongoose.Types.ObjectId
  pupilNameSnapshot: string
  matchScore: number
  resultSnapshot: IFeeStandingSnapshot
  status: 'fulfilled'
  createdAt: Date
  updatedAt: Date
}

const FeeStandingRequestSchema = new Schema<IFeeStandingRequest>(
  {
    requestingSchoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    requestingUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetStudentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    targetSchoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    pupilNameSnapshot: { type: String, required: true, trim: true },
    matchScore: { type: Number, required: true },
    resultSnapshot: {
      admissionStatus: { type: String, required: true },
      currentBalance: { type: Number, required: true },
      exitNotes: { type: String, default: '' },
      classLevel: { type: String, required: true },
      schoolName: { type: String, required: true },
      schoolPhone: { type: String, default: '' },
      proprietorName: { type: String, default: '' },
      proprietorPhone: { type: String, default: '' },
      contactEmail: { type: String, default: '' },
    },
    // Only 'fulfilled' exists today (auto-disclosure MVP) — kept as an enum so an
    // approval-required workflow ('pending'/'approved'/'denied') can be added later
    // without a schema rewrite.
    status: { type: String, enum: ['fulfilled'], default: 'fulfilled' },
  },
  { timestamps: true }
)

// "Recent requests" panel is scoped to the requesting school, newest first
FeeStandingRequestSchema.index({ requestingSchoolId: 1, createdAt: -1 })

const FeeStandingRequest: Model<IFeeStandingRequest> =
  mongoose.models.FeeStandingRequest ??
  mongoose.model<IFeeStandingRequest>('FeeStandingRequest', FeeStandingRequestSchema)

export default FeeStandingRequest
