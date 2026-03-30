import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: number;
  title: string;
  body: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: Number, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Index for getting user's notifications sorted by date efficiently
NotificationSchema.index({ userId: 1, createdAt: -1 });
// Index for unread count
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
