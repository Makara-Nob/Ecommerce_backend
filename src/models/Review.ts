import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IReview extends Document<number> {
    id: number;
    product: number;        // Product _id ref
    user: number;           // User _id ref
    userName: string;       // Denormalized for fast reads
    rating: number;         // 1 – 5
    title?: string;
    body: string;
    images: string[];       // Array of image URLs
    helpful: number;        // thumbs-up count
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    _id: Number,
    product: { type: Number, ref: 'Product', required: true, index: true },
    user: { type: Number, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    images: { type: [String], default: [] },
    helpful: { type: Number, default: 0 },
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

reviewSchema.plugin(autoIncrementPlugin, { modelName: 'Review', field: '_id' });

export default mongoose.model<IReview>('Review', reviewSchema);
