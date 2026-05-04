import mongoose, { Schema, Document } from "mongoose";

export enum NotificationType {
  EVENT_ACTIVITY = "EVENT_ACTIVITY",
  SYSTEM_UPDATE = "SYSTEM_UPDATE",
  SECURITY_ALERT = "SECURITY_ALERT",
  REGISTRATION = "REGISTRATION",
  PAYMENT = "PAYMENT",
}

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { 
      type: String, 
      enum: Object.values(NotificationType),
      default: NotificationType.EVENT_ACTIVITY 
    },
    read: { type: Boolean, default: false },
    link: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
