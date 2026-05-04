import mongoose, { Schema, Document } from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  EVENT_ADMIN = "EVENT_ADMIN",
  USER = "USER",
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  managedEvents: mongoose.Types.ObjectId[];
  image?: string;
  createdAt: Date;
  updatedAt: Date;
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
      default: UserRole.USER,
    },
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
