import mongoose, { Schema, Document } from 'mongoose';

export interface IDeviceToken extends Document<string> {
    userId: number; // User reference via AutoIncrement
    token: string;
    deviceType: string;
}

const deviceTokenSchema = new Schema<IDeviceToken>({
    userId: { type: Number, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    deviceType: { type: String, default: 'android' }
}, { timestamps: true });

// We do NOT attach auto-increment here because the ID can be standard MongoDB ObjectId
// Only token needs to be unique.

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);
