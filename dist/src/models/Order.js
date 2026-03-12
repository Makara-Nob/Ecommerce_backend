"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItem = exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const autoIncrement_1 = require("../utils/autoIncrement");
const orderItemSchema = new mongoose_1.Schema({
    _id: Number,
    product: { type: Number, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true }
}, { timestamps: true });
orderItemSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'OrderItem', field: '_id' });
const orderSchema = new mongoose_1.Schema({
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
orderSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Order', field: '_id' });
// Hook to automatically generate an invoice number
orderSchema.pre('validate', async function () {
    const doc = this;
    if (doc.isNew && !doc.invoiceNumber) {
        const date = new Date();
        const yearMonth = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        // Generate a random 4 digit string for simplicity. For production, query last order of the month.
        const random = Math.floor(1000 + Math.random() * 9000);
        doc.invoiceNumber = `INV-${yearMonth}-${random}`;
    }
});
exports.Order = mongoose_1.default.model('Order', orderSchema);
exports.OrderItem = mongoose_1.default.model('OrderItem', orderItemSchema);
