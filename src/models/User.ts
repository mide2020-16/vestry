import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  EVENT_CREATOR = "EVENT_CREATOR",
  END_USER = "END_USER",
}

export function normalizeRole(role: string): UserRole {
  if (role === "USER" || role === "GUEST") return UserRole.END_USER;
  if (role === "EVENT_ADMIN" || role === "CREATOR") return UserRole.EVENT_CREATOR;
  return role as UserRole;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  managedEvents: mongoose.Types.ObjectId[];
  image?: string;
  isVerified: boolean;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: { type: String }, // Optional for Google OAuth users
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.END_USER,
    },
    isVerified: { type: Boolean, default: false },
    managedEvents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Event",
      },
    ],
    image: { type: String },
    bio: { type: String, maxlength: 200 },
    phone: { type: String },
    preferences: {
      notifications: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    lastLogin: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
