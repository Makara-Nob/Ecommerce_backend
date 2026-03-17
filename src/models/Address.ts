import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IAddress extends Document<number> {
    id: number;
    user: number;
    title: string;
    recipientName: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    state?: string;
    zipCode?: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const addressSchema = new Schema<IAddress>({
    _id: Number,
    user: { type: Number, ref: 'User', required: true },
    title: { type: String, required: true }, // e.g., Home, Work, Office
    recipientName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    zipCode: { type: String },
    isDefault: { type: Boolean, default: false }
}, {
    timestamps: true
});

addressSchema.plugin(autoIncrementPlugin, { modelName: 'Address', field: '_id' });

export const Address = mongoose.model<IAddress>('Address', addressSchema);
