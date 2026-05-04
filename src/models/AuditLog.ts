import mongoose, { Schema, Document } from "mongoose";

export enum LogAction {
  // Admin Actions
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  LOGIN = "LOGIN",
  APPROVE_PAYMENT = "APPROVE_PAYMENT",
  DECLINE_PAYMENT = "DECLINE_PAYMENT",
  ROLE_CHANGE = "ROLE_CHANGE",
  
  // Consumer Actions
  VIEW_EVENT = "VIEW_EVENT",
  START_REGISTRATION = "START_REGISTRATION",
  SUBMIT_REGISTRATION = "SUBMIT_REGISTRATION",
  COMPLETE_PAYMENT = "COMPLETE_PAYMENT",
  DOWNLOAD_TICKET = "DOWNLOAD_TICKET",
  VIEW_SUCCESS_PAGE = "VIEW_SUCCESS_PAGE",
}

export enum UserType {
  ADMIN = "ADMIN",
  CONSUMER = "CONSUMER",
  SYSTEM = "SYSTEM",
}

export interface IActivityLog extends Document {
  userId?: mongoose.Types.ObjectId; // User ID if logged in (admin)
  sessionId?: string; // For tracking anonymous consumers
  userType: UserType;
  userName?: string; // Name for display
  userEmail?: string; // Email for display
  action: LogAction;
  resource: string; // e.g. "Event", "Registration", "User"
  resourceId?: mongoose.Types.ObjectId;
  details: string;
  metadata?: any; // Extra info like IP, User Agent, etc.
  createdAt: Date;
}

const ActivityLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, index: true },
    userType: { type: String, enum: Object.values(UserType), required: true },
    userName: { type: String },
    userEmail: { type: String },
    action: { type: String, enum: Object.values(LogAction), required: true },
    resource: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Unified model for both admins and consumers
export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", ActivityLogSchema);
