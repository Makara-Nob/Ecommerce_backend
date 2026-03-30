import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface ICartItem extends Document<number> {
    id: number;
    cartId: number;
    product: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
    variantId?: number;    // ➕ NEW — track which variant was selected
    variantName?: string;  // ➕ NEW — store display name for UI
}

const cartItemSchema = new Schema<ICartItem>({
    _id: Number,
    cartId: { type: Number, required: true },
    product: { type: Number, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true },
    variantId: { type: Number },            // ➕ NEW
    variantName: { type: String },          // ➕ NEW
}, { timestamps: true });

cartItemSchema.plugin(autoIncrementPlugin, { modelName: 'CartItem', field: '_id' });

export interface ICart extends Document<number> {
    id: number;
    userId: number;
    status: 'ACTIVE' | 'CHECKED_OUT' | 'ABANDONED';
    totalAmount: number;
    items: number[];
}

const cartSchema = new Schema<ICart>({
    _id: Number,
    userId: { type: Number, required: true }, // Using generic int ID reference
    status: { type: String, enum: ['ACTIVE', 'CHECKED_OUT', 'ABANDONED'], default: 'ACTIVE' },
    totalAmount: { type: Number, default: 0 },
    items: [{
        type: Number,
        ref: 'CartItem'
    }]
}, { timestamps: true });

cartSchema.plugin(autoIncrementPlugin, { modelName: 'Cart', field: '_id' });

export const Cart = mongoose.model<ICart>('Cart', cartSchema);
export const CartItem = mongoose.model<ICartItem>('CartItem', cartItemSchema);
