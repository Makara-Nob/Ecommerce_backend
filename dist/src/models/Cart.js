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
exports.CartItem = exports.Cart = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const autoIncrement_1 = require("../utils/autoIncrement");
const cartItemSchema = new mongoose_1.Schema({
    _id: Number,
    cartId: { type: Number, required: true }, // Using generic int ID reference due to schema requirements
    product: { type: Number, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
    unitPrice: { type: Number, required: true },
    subTotal: { type: Number, required: true }
}, { timestamps: true });
cartItemSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'CartItem', field: '_id' });
const cartSchema = new mongoose_1.Schema({
    _id: Number,
    userId: { type: Number, required: true }, // Using generic int ID reference
    status: { type: String, enum: ['ACTIVE', 'CHECKED_OUT', 'ABANDONED'], default: 'ACTIVE' },
    totalAmount: { type: Number, default: 0 },
    items: [{
            type: Number,
            ref: 'CartItem'
        }]
}, { timestamps: true });
cartSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Cart', field: '_id' });
exports.Cart = mongoose_1.default.model('Cart', cartSchema);
exports.CartItem = mongoose_1.default.model('CartItem', cartItemSchema);
