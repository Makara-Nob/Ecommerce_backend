import mongoose, { Schema, Document } from 'mongoose';
import { autoIncrementPlugin } from '../utils/autoIncrement';

export interface ICategory extends Document<number> {
    id: number;
    name: string;
    description?: string;
    code?: string;
    imageUrl?: string;
}

const categorySchema = new Schema<ICategory>({
    _id: Number,
    name: { type: String, required: true },
    description: String,
    code: { type: String, unique: true },
    imageUrl: { type: String }
}, { timestamps: true });
categorySchema.plugin(autoIncrementPlugin, { modelName: 'Category', field: '_id' });

export interface ISupplier extends Document<number> {
    id: number;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    status: string;
}

const supplierSchema = new Schema<ISupplier>({
    _id: Number,
    name: { type: String, required: true },
    contactPerson: String,
    phone: String,
    email: String,
    address: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
supplierSchema.plugin(autoIncrementPlugin, { modelName: 'Supplier', field: '_id' });

export interface IBrand extends Document<number> {
    id: number;
    name: string;
    description?: string;
    logoUrl?: string;
    imageUrl?: string;
    status: string;
}

const brandSchema = new Schema<IBrand>({
    _id: Number,
    name: { type: String, required: true },
    description: String,
    logoUrl: { type: String },
    imageUrl: { type: String },
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
brandSchema.plugin(autoIncrementPlugin, { modelName: 'Brand', field: '_id' });

export interface IProductVariant extends Document<number> {
    id: number;
    variantName?: string;
    sku?: string;
    optionValues: string[];
    stockQuantity: number;
    additionalPrice: number;
    imageUrl?: string;
    status: string;
}

const productVariantSchema = new Schema<IProductVariant>({
    _id: Number,
    variantName: String,
    sku: { type: String, unique: true, sparse: true },
    optionValues: { type: [String], default: [] },
    stockQuantity: { type: Number, default: 0 },
    additionalPrice: { type: Number, default: 0 },
    imageUrl: String,
    status: { type: String, default: 'ACTIVE' }
}, { timestamps: true });
productVariantSchema.plugin(autoIncrementPlugin, { modelName: 'ProductVariant', field: '_id' });

export interface IProductOption {
    name: string;
    values: string[];
}

const productOptionSchema = new Schema<IProductOption>({
    name: { type: String, required: true },
    values: { type: [String], required: true }
}, { _id: false });

export interface IProduct extends Document<number> {
    id: number;
    name: string;
    sku: string;
    description?: string;
    category?: number;
    supplier?: number;
    brand?: number;
    quantity: number;
    minStock: number;
    costPrice: number;
    sellingPrice: number;
    status: string;
    viewCount: number;
    imageUrl?: string;
    images: string[];
    options: IProductOption[];
    variants: IProductVariant[];
    relatedProducts: number[];
    discountType: 'PERCENTAGE' | 'FIXED';
    discountValue: number;
}

const productSchema = new Schema<IProduct>({
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
    imageUrl: String,
    images: { type: [String], default: [] },
    options: [productOptionSchema],
    variants: [productVariantSchema],
    relatedProducts: [{ type: Number, ref: 'Product' }],
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], default: 'PERCENTAGE' },
    discountValue: { type: Number, default: 0 }
}, { timestamps: true });
productSchema.plugin(autoIncrementPlugin, { modelName: 'Product', field: '_id' });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
export const Supplier = mongoose.model<ISupplier>('Supplier', supplierSchema);
export const Brand = mongoose.model<IBrand>('Brand', brandSchema);
export const ProductVariant = mongoose.model<IProductVariant>('ProductVariant', productVariantSchema);
export const Product = mongoose.model<IProduct>('Product', productSchema);
