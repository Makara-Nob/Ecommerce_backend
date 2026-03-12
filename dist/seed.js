"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./src/models/User"));
const Product_1 = require("./src/models/Product");
const Banner_1 = __importDefault(require("./src/models/Banner"));
async function seedData() {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');
        // Clear all collections
        console.log('Clearing database...');
        await mongoose_1.default.connection.db?.dropDatabase();
        // 1. Roles & Users 
        console.log('Seeding Users...');
        // Customer User
        const customer = new User_1.default({
            username: 'customer_user',
            email: 'customer@example.com',
            password: 'password', // Will be hashed by pre-save
            fullName: 'John Doe',
            userPermission: 'NORMAL',
            roles: ['CUSTOMER']
        });
        await customer.save();
        // Admin User
        const admin = new User_1.default({
            username: 'admin_user',
            email: 'admin@example.com',
            password: 'password',
            fullName: 'Super Administrator',
            position: 'Manager',
            userPermission: 'APPROVED',
            roles: ['ADMIN']
        });
        await admin.save();
        // 2. Suppliers
        console.log('Seeding Suppliers...');
        const globalTechSup = new Product_1.Supplier({
            name: 'Global Tech Supplies',
            contactPerson: 'Alice Smith',
            email: 'alice@globaltech.com',
            phone: '+123456789',
            address: '123 Tech Blvd, Silicon Valley',
        });
        await globalTechSup.save();
        const styleSup = new Product_1.Supplier({
            name: 'Fashion Forward Inc',
            contactPerson: 'Bob Jones',
            email: 'bob@fashionforward.com',
            phone: '+987654321',
            address: '456 Style Ave, New York',
        });
        await styleSup.save();
        // 3. Brands
        console.log('Seeding Brands...');
        const samsungBrand = new Product_1.Brand({
            name: 'Samsung',
            description: 'Inspire the World',
            logoUrl: 'https://example.com/samsung.png'
        });
        await samsungBrand.save();
        const appleBrand = new Product_1.Brand({
            name: 'Apple',
            description: 'Think Different',
            logoUrl: 'https://example.com/apple.png'
        });
        await appleBrand.save();
        const nikeBrand = new Product_1.Brand({
            name: 'Nike',
            description: 'Just Do It',
            logoUrl: 'https://example.com/nike.png'
        });
        await nikeBrand.save();
        // 4. Categories
        console.log('Seeding Categories...');
        const elecCategory = new Product_1.Category({
            name: 'Electronics',
            code: 'ELEC',
            description: 'Gadgets and devices'
        });
        await elecCategory.save();
        const clothCategory = new Product_1.Category({
            name: 'Clothing',
            code: 'CLOTH',
            description: 'Men and Women apparel'
        });
        await clothCategory.save();
        // 5. Products & Variants
        console.log('Seeding Products...');
        const galaxyS23 = new Product_1.Product({
            name: 'Samsung Galaxy S23',
            sku: 'SKU-ELEC-001',
            description: 'Latest android flagship',
            category: elecCategory.id,
            supplier: globalTechSup.id,
            brand: samsungBrand.id,
            quantity: 50,
            minStock: 5,
            costPrice: 600.00,
            sellingPrice: 999.99,
            variants: [
                { variantName: '128GB - Phantom Black', sku: 'SKU-ELEC-001-128-BLK', size: '128GB', color: 'Phantom Black', stockQuantity: 20 },
                { variantName: '256GB - Phantom Black', sku: 'SKU-ELEC-001-256-BLK', size: '256GB', color: 'Phantom Black', stockQuantity: 15, additionalPrice: 50.00 }
            ]
        });
        await galaxyS23.save();
        const iphone14 = new Product_1.Product({
            name: 'Iphone 14 Pro',
            sku: 'SKU-ELEC-002',
            description: 'Apple latest smartphone',
            category: elecCategory.id,
            supplier: globalTechSup.id,
            brand: appleBrand.id,
            quantity: 40,
            minStock: 5,
            costPrice: 800.00,
            sellingPrice: 1199.99,
            variants: [
                { variantName: '128GB - Black', sku: 'SKU-ELEC-002-128-BLK', size: '128GB', color: 'Black', stockQuantity: 15 },
                { variantName: '256GB - Silver', sku: 'SKU-ELEC-002-256-SLV', size: '256GB', color: 'Silver', stockQuantity: 8, additionalPrice: 100 }
            ]
        });
        await iphone14.save();
        const airMax = new Product_1.Product({
            name: 'Nike Air Max',
            sku: 'SKU-CLOTH-001',
            description: 'Running shoes',
            category: clothCategory.id,
            supplier: styleSup.id,
            brand: nikeBrand.id,
            quantity: 100,
            minStock: 20,
            costPrice: 60.00,
            sellingPrice: 129.99,
            variants: [
                { variantName: 'Size 9 - Black/White', sku: 'SKU-CLOTH-001-9-BLK', size: 'US 9', color: 'Black/White', stockQuantity: 25 },
                { variantName: 'Size 10 - Red/White', sku: 'SKU-CLOTH-001-10-RED', size: 'US 10', color: 'Red/White', stockQuantity: 15, additionalPrice: 10 }
            ]
        });
        await airMax.save();
        // 6. Banners
        console.log('Seeding Banners...');
        const banners = [
            { title: 'Summer Sale', imageUrl: 'https://example.com/summer-sale.jpg', linkUrl: '/products?category=summer', description: 'Up to 50% off on Summer items', displayOrder: 1 },
            { title: 'New Arrivals', imageUrl: 'https://example.com/new-arrivals.jpg', linkUrl: '/products?sort=new', description: 'Check out the latest gadgets', displayOrder: 2 },
            { title: 'Black Friday', imageUrl: 'https://example.com/black-friday.jpg', linkUrl: '/products', description: 'Biggest sale of the year', displayOrder: 3 }
        ];
        for (const bannerData of banners) {
            const banner = new Banner_1.default(bannerData);
            await banner.save();
        }
        console.log('Database Seeding Complete!');
        process.exit();
    }
    catch (error) {
        console.error('Seeder Error:', error);
        process.exit(1);
    }
}
seedData();
