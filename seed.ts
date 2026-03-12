import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User';
import { Product, Category, Brand, Supplier } from './src/models/Product';
import Banner from './src/models/Banner';
import { Promotion } from './src/models/Promotion';

// Helper for real image URLs from Unsplash (curated for e-commerce)
const IMAGES = {
    ELECTRONICS: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800', // MacBook
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800', // iPhone
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800', // Samsung
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', // Headphones
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800', // Monitor
        'https://images.unsplash.com/photo-1527866959612-3993a760e115?auto=format&fit=crop&q=80&w=800', // Mouse
    ],
    CLOTHING: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800', // Red shoes
        'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800', // Hoodie
        'https://images.unsplash.com/photo-1541099649105-f69ad23f324e?auto=format&fit=crop&q=80&w=800', // Jeans
        'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800', // T-shirt
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800', // Dress
    ],
    HOME: [
        'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800', // Sofa
        'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800', // Table
        'https://images.unsplash.com/photo-1507473885765-e6ed657f49af?auto=format&fit=crop&q=80&w=800', // Lamp
        'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800', // Bathroom Essentials
    ],
    SPORTS: [
        'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800', // Dumbbells
        'https://images.unsplash.com/photo-1599058917233-35f694ca978b?auto=format&fit=crop&q=80&w=800', // Fitness
        'https://images.unsplash.com/photo-1518611012118-2969c63d002a?auto=format&fit=crop&q=80&w=800', // Ball
    ],
    BEAUTY: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800', // Skincare
        'https://images.unsplash.com/photo-1512496011212-7da344498308?auto=format&fit=crop&q=80&w=800', // Makeup
        'https://images.unsplash.com/photo-1570172619385-2e69733fee3f?auto=format&fit=crop&q=80&w=800', // Perfume
    ],
    BANNERS: [
        'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200', // Sale
        'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200', // Store
        'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1200', // Shopping
    ]
};

async function seedData() {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB Connected for Seeding...');

        // Clear all collections
        console.log('Clearing database...');
        await mongoose.connection.db?.dropDatabase();

        // 1. Roles & Users 
        console.log('Seeding Users...');
        const admin = new User({
            username: 'admin@gmail.com', email: 'admin@gmail.com', password: '88889999', fullName: 'Super Administrator', position: 'Manager', status: 'ACTIVE', userPermission: 'APPROVED', roles: ['ADMIN']
        });
        await admin.save();

        const staff = new User({
            username: 'staff', email: 'staff@gmail.com', password: 'staff123', fullName: 'Staff Member', position: 'Sales', status: 'ACTIVE', userPermission: 'APPROVED', roles: ['STAFF']
        });
        await staff.save();

        const customer = new User({
            username: 'customer', email: 'customer@gmail.com', password: 'customer123', fullName: 'John Doe', status: 'ACTIVE', userPermission: 'NORMAL', roles: ['CUSTOMER']
        });
        await customer.save();

        // 2. Suppliers
        console.log('Seeding Suppliers...');
        const suppliersData = [
            { name: 'Global Tech Supplies', contactPerson: 'Alice Smith', email: 'alice@globaltech.com', phone: '+123456789', address: '123 Tech Blvd, Silicon Valley', status: 'ACTIVE' },
            { name: 'Fashion Forward Inc', contactPerson: 'Bob Jones', email: 'bob@fashionforward.com', phone: '+987654321', address: '456 Style Ave, New York', status: 'ACTIVE' },
            { name: 'Daily Essentials Co', contactPerson: 'Charlie Brown', email: 'charlie@daily.com', phone: '+1122334455', address: '789 Grocery Ln, London', status: 'ACTIVE' },
        ];
        const insertedSuppliers: any = {};
        for (const s of suppliersData) {
            const sup = await Supplier.create(s);
            insertedSuppliers[s.name] = sup._id;
        }

        // 3. Brands
        console.log('Seeding Brands...');
        const brandsData = [
            { name: 'Samsung', description: 'Inspire the World', logoUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=100' },
            { name: 'Apple', description: 'Think Different', logoUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=100' },
            { name: 'Nike', description: 'Just Do It', logoUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100' },
            { name: 'Sony', description: 'Be Moved', logoUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100' },
        ];
        const insertedBrands: any = {};
        for (const b of brandsData) {
            const br = await Brand.create(b);
            insertedBrands[b.name] = br._id;
        }

        // 4. Categories
        console.log('Seeding Categories...');
        const categoriesData = [
            { name: 'Electronics', code: 'ELEC', description: 'Gadgets and devices', icon: IMAGES.ELECTRONICS[3] },
            { name: 'Clothing', code: 'CLOTH', description: 'Men and Women apparel', icon: IMAGES.CLOTHING[0] },
            { name: 'Home & Garden', code: 'HOME', description: 'Furniture and decor', icon: IMAGES.HOME[0] },
        ];
        const insertedCats: any = {};
        for (const c of categoriesData) {
            const cat = await Category.create(c);
            insertedCats[c.code] = cat._id;
        }

        // 5. Products
        console.log('Seeding Products...');
        const productsData = [
            // Electronics
            { name: 'MacBook Pro M2', sku: 'SKU-ELEC-001', imageUrl: IMAGES.ELECTRONICS[0], description: 'Supercharged by M2 Pro or M2 Max, MacBook Pro takes its power and efficiency further than ever.', category: insertedCats['ELEC'], supplier: insertedSuppliers['Global Tech Supplies'], brand: insertedBrands['Apple'], quantity: 50, costPrice: 1500, sellingPrice: 1999, variants: [
                { variantName: '16GB/512GB', sku: 'SKU-ELEC-001-V1', size: '512GB', color: 'Space Gray', stockQuantity: 25, imageUrl: IMAGES.ELECTRONICS[0] },
                { variantName: '32GB/1TB', sku: 'SKU-ELEC-001-V2', size: '1TB', color: 'Silver', stockQuantity: 25, additionalPrice: 400, imageUrl: IMAGES.ELECTRONICS[0] }
            ]},
            { name: 'iPhone 14 Pro', sku: 'SKU-ELEC-002', imageUrl: IMAGES.ELECTRONICS[1], description: 'A magical new way to interact with iPhone. A vital safety feature designed to save lives.', category: insertedCats['ELEC'], supplier: insertedSuppliers['Global Tech Supplies'], brand: insertedBrands['Apple'], quantity: 100, costPrice: 800, sellingPrice: 999, variants: [
                { variantName: 'Deep Purple', sku: 'SKU-ELEC-002-V1', size: '128GB', color: 'Purple', stockQuantity: 50, imageUrl: IMAGES.ELECTRONICS[1] },
                { variantName: 'Space Black', sku: 'SKU-ELEC-002-V2', size: '256GB', color: 'Black', stockQuantity: 50, additionalPrice: 100, imageUrl: IMAGES.ELECTRONICS[1] }
            ]},
            { name: 'Sony WH-1000XM5', sku: 'SKU-ELEC-003', imageUrl: IMAGES.ELECTRONICS[3], description: 'Industry leading noise cancellation with two processors controlling 8 microphones.', category: insertedCats['ELEC'], supplier: insertedSuppliers['Global Tech Supplies'], brand: insertedBrands['Sony'], quantity: 75, costPrice: 250, sellingPrice: 349, variants: [
                { variantName: 'Standard', sku: 'SKU-ELEC-003-V1', color: 'Black', stockQuantity: 75, imageUrl: IMAGES.ELECTRONICS[3] }
            ]},
            
            // Clothing
            { name: 'Nike Air Max 270', sku: 'SKU-CLOTH-001', imageUrl: IMAGES.CLOTHING[0], description: 'Nike\'s first lifestyle Air Max brings you style, comfort and big attitude.', category: insertedCats['CLOTH'], supplier: insertedSuppliers['Fashion Forward Inc'], brand: insertedBrands['Nike'], quantity: 200, costPrice: 80, sellingPrice: 120, variants: [
                { variantName: 'Red/Black', sku: 'SKU-CLOTH-001-V1', size: 'US 9', color: 'Red', stockQuantity: 100, imageUrl: IMAGES.CLOTHING[0] },
                { variantName: 'White/Blue', sku: 'SKU-CLOTH-001-V2', size: 'US 10', color: 'White', stockQuantity: 100, imageUrl: IMAGES.CLOTHING[0] }
            ]},
            { name: 'Tech Fleece Hoodie', sku: 'SKU-CLOTH-002', imageUrl: IMAGES.CLOTHING[1], description: 'Soft, lightweight warmth for everyday wear.', category: insertedCats['CLOTH'], supplier: insertedSuppliers['Fashion Forward Inc'], brand: insertedBrands['Nike'], quantity: 150, costPrice: 40, sellingPrice: 65, variants: [
                { variantName: 'Grey', sku: 'SKU-CLOTH-002-V1', size: 'L', color: 'Grey', stockQuantity: 150, imageUrl: IMAGES.CLOTHING[1] }
            ]},

            // Home
            { name: 'Modern Velvet Sofa', sku: 'SKU-HOME-001', imageUrl: IMAGES.HOME[0], description: 'A sleek, modern sofa that provides both comfort and style.', category: insertedCats['HOME'], supplier: insertedSuppliers['Daily Essentials Co'], brand: insertedBrands['Sony'], quantity: 15, costPrice: 400, sellingPrice: 599, variants: [
                { variantName: 'Emerald Green', sku: 'SKU-HOME-001-V1', color: 'Green', stockQuantity: 15, imageUrl: IMAGES.HOME[0] }
            ]},
        ];

        const insertedProducts: any = [];
        for (const p of productsData) {
            const prod = await Product.create(p);
            insertedProducts.push(prod);
        }

        // 6. Promotions
        console.log('Seeding Promotions...');
        const now = new Date();
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);

        const promotionsData = [
            { name: 'Summer Clearance', description: 'Get up to 30% off on all clothing items!', discountType: 'PERCENTAGE', discountValue: 30, startDate: now, endDate: nextMonth, product: insertedProducts.find((p:any) => p.sku === 'SKU-CLOTH-001')._id },
            { name: 'Tech Upgrade', description: '$200 off on MacBook Pro M2', discountType: 'FIXED_AMOUNT', discountValue: 200, startDate: now, endDate: nextMonth, product: insertedProducts.find((p:any) => p.sku === 'SKU-ELEC-001')._id }
        ];

        for (const p of promotionsData) {
            await Promotion.create(p);
        }

        // 7. Banners
        console.log('Seeding Banners...');
        const bannersData = [
            { title: 'New iPhone 14 Pro', description: 'Pro. Beyond.', imageUrl: IMAGES.BANNERS[0], linkUrl: '/products/' + insertedProducts.find((p:any) => p.sku === 'SKU-ELEC-002')._id, displayOrder: 1 },
            { title: 'Home Makeover', description: 'Elevate your living space.', imageUrl: IMAGES.BANNERS[1], linkUrl: '/products/' + insertedProducts.find((p:any) => p.sku === 'SKU-HOME-001')._id, displayOrder: 2 },
            { title: 'Athletic Wear', description: 'Engineered for performance.', imageUrl: IMAGES.BANNERS[2], linkUrl: '/products/' + insertedProducts.find((p:any) => p.sku === 'SKU-CLOTH-001')._id, displayOrder: 3 },
        ];

        for (const b of bannersData) {
            await Banner.create(b);
        }

        console.log('Database Seeding Complete!');
        process.exit(0);
    } catch (e) {
        console.error('Seed Error:', e);
        process.exit(1);
    }
}

seedData();
