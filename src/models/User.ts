import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  email: string
  passwordHash: string
  emailVerified: Date | null
  createdAt: Date
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
})

export default (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema)
