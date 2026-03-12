import mongoose, { Schema, Document, CallbackWithoutResultAndOptionalError } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface IOrderItem extends Document<string> {
    id: number;
    product: number;
    quantity: number;
    unitPrice: number;
    subTotal: number;
}

const orderItemSchema = new Schema<IOrderItem>({
    _id: Number,
    product: { type: Number, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true }
}, { timestamps: true });

orderItemSchema.plugin(autoIncrementPlugin, { modelName: 'OrderItem', field: '_id' });

export interface IOrder extends Document<string> {
    id: number;
    invoiceNumber: string;
    userId: number;
    totalAmount: number;
    discountAmount: number;
    netAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
    paymentMethod: 'CASH' | 'CARD';
    shippingAddress: string;
    note?: string;
    items: IOrderItem[];
}

const orderSchema = new Schema<IOrder>({
    _id: Number,
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: Number, ref: 'User', required: true },
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    paymentMethod: { type: String, enum: ['CASH', 'CARD'], default: 'CASH' },
    shippingAddress: { type: String, required: true },
    note: String,
    items: [orderItemSchema]
}, { timestamps: true });

orderSchema.plugin(autoIncrementPlugin, { modelName: 'Order', field: '_id' });

// Hook to automatically generate an invoice number
orderSchema.pre('validate', async function() {
    const doc = this as any;
    if (doc.isNew && !doc.invoiceNumber) {
        const date = new Date();
        const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        // Generate a random 4 digit string for simplicity. For production, query last order of the month.
        const random = Math.floor(1000 + Math.random() * 9000); 
        doc.invoiceNumber = `INV-${yearMonth}-${random}`;
    }
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
export const OrderItem = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);
