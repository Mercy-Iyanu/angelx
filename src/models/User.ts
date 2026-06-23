import mongoose, { Schema, Document, Model } from 'mongoose'

export type UserRole = 'proprietor' | 'bursar' | 'admin' | 'head_teacher'

export interface IUser extends Document {
  email: string
  passwordHash: string
  emailVerified: boolean
  schoolId: mongoose.Types.ObjectId | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    emailVerified: { type: Boolean, default: false },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', default: null },
    role: {
      type: String,
      enum: ['proprietor', 'bursar', 'admin', 'head_teacher'],
      default: 'proprietor',
    },
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema)

export default User
