import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IBanner extends Document<string> {
    id: number;
    title: string;
    description?: string;
    imageUrl: string;
    linkUrl?: string;
    displayOrder: number;
    status: string;
}

const bannerSchema = new Schema<IBanner>({
    _id: Number,
    title: { type: String, required: true },
    description: String,
    imageUrl: { type: String, required: true },
    linkUrl: String,
    displayOrder: { type: Number, default: 0 },
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });

bannerSchema.plugin(autoIncrementPlugin, { modelName: 'Banner', field: '_id' });

export default mongoose.model<IBanner>('Banner', bannerSchema);
