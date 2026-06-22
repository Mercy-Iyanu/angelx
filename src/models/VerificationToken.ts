import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IVerificationToken extends Document {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
})

// MongoDB TTL index — auto-deletes expired documents
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default (mongoose.models.VerificationToken as mongoose.Model<IVerificationToken>) ||
  mongoose.model<IVerificationToken>('VerificationToken', VerificationTokenSchema)
