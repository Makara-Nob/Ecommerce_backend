import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IPromotion extends Document<string> {
    id: number;
    name: string;
    description: string;
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
    discountValue: number;
    startDate: Date;
    endDate: Date;
    product: number; // Reference to Product ID
    status: string;
}

const promotionSchema = new Schema<IPromotion>({
    _id: Number,
    name: { type: String, required: true },
    description: { type: String },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT'], required: true },
    discountValue: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    product: { type: Number, ref: 'Product', required: true },
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

promotionSchema.plugin(autoIncrementPlugin, { modelName: 'Promotion', field: '_id' });

export const Promotion = mongoose.model<IPromotion>('Promotion', promotionSchema);
