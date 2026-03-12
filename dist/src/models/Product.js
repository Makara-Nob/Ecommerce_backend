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
exports.Product = exports.ProductVariant = exports.Brand = exports.Supplier = exports.Category = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const autoIncrement_1 = require("../utils/autoIncrement");
const categorySchema = new mongoose_1.Schema({
    _id: Number,
    name: { type: String, required: true },
    description: String,
    code: { type: String, unique: true }
}, { timestamps: true });
categorySchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Category', field: '_id' });
const supplierSchema = new mongoose_1.Schema({
    _id: Number,
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
supplierSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Supplier', field: '_id' });
const brandSchema = new mongoose_1.Schema({
    _id: Number,
    name: { type: String, required: true },
    description: String,
    logoUrl: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
brandSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Brand', field: '_id' });
const productVariantSchema = new mongoose_1.Schema({
    _id: Number,
    variantName: String,
    sku: { type: String, unique: true, sparse: true },
    size: String,
    color: String,
    stockQuantity: { type: Number, default: 0 },
    additionalPrice: { type: Number, default: 0 },
    imageUrl: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
productVariantSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'ProductVariant', field: '_id' });
const productSchema = new mongoose_1.Schema({
    _id: Number,
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: String,
    category: { type: Number, ref: 'Category' },
    supplier: { type: Number, ref: 'Supplier' },
    brand: { type: Number, ref: 'Brand' },
    quantity: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
    costPrice: { type: Number, required: true, default: 0 },
    sellingPrice: { type: Number, required: true, default: 0 },
    status: { type: String, default: 'ACTIVE' },
    viewCount: { type: Number, default: 0 },
    variants: [productVariantSchema]
}, { timestamps: true });
productSchema.plugin(autoIncrement_1.autoIncrementPlugin, { modelName: 'Product', field: '_id' });
exports.Category = mongoose_1.default.model('Category', categorySchema);
exports.Supplier = mongoose_1.default.model('Supplier', supplierSchema);
exports.Brand = mongoose_1.default.model('Brand', brandSchema);
exports.ProductVariant = mongoose_1.default.model('ProductVariant', productVariantSchema);
exports.Product = mongoose_1.default.model('Product', productSchema);
