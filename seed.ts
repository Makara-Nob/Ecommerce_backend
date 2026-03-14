import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User";
import { Product, Category, Brand, Supplier } from "./src/models/Product";
import Banner from "./src/models/Banner";
import { Promotion } from "./src/models/Promotion";

// ─── Curated Unsplash Images ────────────────────────────────────────────────
const IMAGES = {
  ELECTRONICS: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800", // MacBook
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800", // iPhone
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800", // Samsung
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", // Headphones
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800", // Monitor
    "https://images.unsplash.com/photo-1527866959612-3993a760e115?auto=format&fit=crop&q=80&w=800", // Mouse
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800", // iPad
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800", // Smartwatch
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800", // Laptop Dell
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800", // Keyboard
    "https://images.unsplash.com/photo-1612830197210-e8f1046f1672?auto=format&fit=crop&q=80&w=800", // AirPods
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800", // Camera
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&q=80&w=800", // Polaroid
    "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=800", // Speaker
    "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800", // TV
  ],
  CLOTHING: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", // Red shoes
    "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800", // Hoodie
    "https://images.unsplash.com/photo-1541099649105-f69ad23f324e?auto=format&fit=crop&q=80&w=800", // Jeans
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800", // T-shirt
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", // Dress
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800", // Jacket
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", // Sneakers white
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800", // Scarf
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800", // Yoga pants
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80&w=800", // Cap
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", // Backpack
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800", // Handbag
    "https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?auto=format&fit=crop&q=80&w=800", // Watch fashion
    "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?auto=format&fit=crop&q=80&w=800", // Socks
  ],
  HOME: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", // Sofa
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", // Table
    "https://images.unsplash.com/photo-1507473885765-e6ed657f49af?auto=format&fit=crop&q=80&w=800", // Lamp
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800", // Bathroom
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800", // Bed
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800", // Kitchen
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800", // Curtains
    "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800", // Coffee maker
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800", // Vacuum
    "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800", // Candles
    "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800", // Plant pot
    "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800", // Pillow
  ],
  SPORTS: [
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800", // Dumbbells
    "https://images.unsplash.com/photo-1599058917233-35f694ca978b?auto=format&fit=crop&q=80&w=800", // Fitness
    "https://images.unsplash.com/photo-1518611012118-2969c63d002a?auto=format&fit=crop&q=80&w=800", // Ball
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=800", // Yoga mat
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800", // Running shoes
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=800", // Protein shake
    "https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&q=80&w=800", // Boxing gloves
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", // Treadmill
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800", // Bicycle
    "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&q=80&w=800", // Tennis racket
  ],
  BEAUTY: [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800", // Skincare
    "https://images.unsplash.com/photo-1512496011212-7da344498308?auto=format&fit=crop&q=80&w=800", // Makeup
    "https://images.unsplash.com/photo-1570172619385-2e69733fee3f?auto=format&fit=crop&q=80&w=800", // Perfume
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800", // Lipstick
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800", // Nail polish
    "https://images.unsplash.com/photo-1631730486784-74757073d5f8?auto=format&fit=crop&q=80&w=800", // Hair dryer
    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800", // Serum
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800", // Face mask
    "https://images.unsplash.com/photo-1526758097130-bab247274f58?auto=format&fit=crop&q=80&w=800", // Sunscreen
  ],
  FOOD: [
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=800", // Coffee beans
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", // Chocolate
    "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&q=80&w=800", // Nuts
    "https://images.unsplash.com/photo-1559181567-c3190bdc8dfe?auto=format&fit=crop&q=80&w=800", // Honey
    "https://images.unsplash.com/photo-1526081347589-7fa4b4916e43?auto=format&fit=crop&q=80&w=800", // Olive oil
    "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&q=80&w=800", // Tea
  ],
  TOYS: [
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800", // Lego
    "https://images.unsplash.com/photo-1604158312298-2b3a695f70b3?auto=format&fit=crop&q=80&w=800", // Board game
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=800", // RC car
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800", // Teddy bear
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800", // Drone
  ],
  BANNERS: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1400", // Sale
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400", // Store
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1400", // Shopping
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400", // Fashion
    "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=1400", // Tech
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=1400", // Food/Kitchen
  ],
};

// ─── Seed Entry Point ────────────────────────────────────────────────────────
async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected for Seeding...");

    console.log("🗑️  Clearing database...");
    await mongoose.connection.db?.dropDatabase();

    // ── 1. Users ─────────────────────────────────────────────────────────
    console.log("👤 Seeding Users...");
    const users = [
      {
        username: "admin@gmail.com",
        email: "admin@gmail.com",
        password: "88889999",
        fullName: "Super Administrator",
        position: "Manager",
        status: "ACTIVE",
        userPermission: "APPROVED",
        roles: ["ADMIN"],
      },
      {
        username: "staff",
        email: "staff@gmail.com",
        password: "staff123",
        fullName: "Staff Member",
        position: "Sales",
        status: "ACTIVE",
        userPermission: "APPROVED",
        roles: ["STAFF"],
      },
      {
        username: "manager",
        email: "manager@gmail.com",
        password: "manager123",
        fullName: "Lisa Manager",
        position: "Operations Manager",
        status: "ACTIVE",
        userPermission: "APPROVED",
        roles: ["STAFF"],
      },
      {
        username: "customer",
        email: "customer@gmail.com",
        password: "customer123",
        fullName: "John Doe",
        status: "ACTIVE",
        userPermission: "NORMAL",
        roles: ["CUSTOMER"],
      },
      {
        username: "jane",
        email: "jane@gmail.com",
        password: "jane123",
        fullName: "Jane Smith",
        status: "ACTIVE",
        userPermission: "NORMAL",
        roles: ["CUSTOMER"],
      },
      {
        username: "david",
        email: "david@gmail.com",
        password: "david123",
        fullName: "David Chen",
        status: "ACTIVE",
        userPermission: "NORMAL",
        roles: ["CUSTOMER"],
      },
    ];
    for (const u of users) {
      await new User(u).save();
    }

    // ── 2. Suppliers ──────────────────────────────────────────────────────
    console.log("🏭 Seeding Suppliers...");
    const suppliersData = [
      {
        name: "Global Tech Supplies",
        contactPerson: "Alice Smith",
        email: "alice@globaltech.com",
        phone: "+1-800-555-0101",
        address: "123 Tech Blvd, Silicon Valley, CA",
        status: "ACTIVE",
      },
      {
        name: "Fashion Forward Inc",
        contactPerson: "Bob Jones",
        email: "bob@fashionforward.com",
        phone: "+1-800-555-0202",
        address: "456 Style Ave, New York, NY",
        status: "ACTIVE",
      },
      {
        name: "Daily Essentials Co",
        contactPerson: "Charlie Brown",
        email: "charlie@daily.com",
        phone: "+44-800-555-0303",
        address: "789 Grocery Ln, London, UK",
        status: "ACTIVE",
      },
      {
        name: "ActiveLife Distributors",
        contactPerson: "Diana Prince",
        email: "diana@activelife.com",
        phone: "+1-800-555-0404",
        address: "321 Sport Ave, Portland, OR",
        status: "ACTIVE",
      },
      {
        name: "Beauty World Imports",
        contactPerson: "Emma Wilson",
        email: "emma@beautyworld.com",
        phone: "+33-800-555-0505",
        address: "55 Rue de la Paix, Paris, France",
        status: "ACTIVE",
      },
      {
        name: "FreshFarm Foods",
        contactPerson: "Frank Green",
        email: "frank@freshfarm.com",
        phone: "+1-800-555-0606",
        address: "900 Farm Road, Austin, TX",
        status: "ACTIVE",
      },
      {
        name: "KidZone Wholesale",
        contactPerson: "Grace Lee",
        email: "grace@kidzone.com",
        phone: "+1-800-555-0707",
        address: "12 Toy Street, Chicago, IL",
        status: "ACTIVE",
      },
    ];
    const sup: Record<string, any> = {};
    for (const s of suppliersData) {
      sup[s.name] = (await Supplier.create(s))._id;
    }

    // ── 3. Brands ─────────────────────────────────────────────────────────
    console.log("🏷️  Seeding Brands...");
    const brandsData = [
      {
        name: "Apple",
        description: "Think Different",
        logoUrl:
          "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Samsung",
        description: "Inspire the World",
        logoUrl:
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Sony",
        description: "Be Moved",
        logoUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Nike",
        description: "Just Do It",
        logoUrl:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Adidas",
        description: "Impossible is Nothing",
        logoUrl:
          "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "IKEA",
        description: "The Wonderful Everyday",
        logoUrl:
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Dyson",
        description: "Solving Real Problems",
        logoUrl:
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "L'Oréal",
        description: "Because You're Worth It",
        logoUrl:
          "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "LEGO",
        description: "Play On",
        logoUrl:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Nescafé",
        description: "It All Starts with a Cup",
        logoUrl:
          "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "DJI",
        description: "The Future of Possible",
        logoUrl:
          "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=100",
      },
      {
        name: "Canon",
        description: "Delighting You Always",
        logoUrl:
          "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=100",
      },
    ];
    const brand: Record<string, any> = {};
    for (const b of brandsData) {
      brand[b.name] = (await Brand.create(b))._id;
    }

    // ── 4. Categories ─────────────────────────────────────────────────────
    console.log("📂 Seeding Categories...");
    const categoriesData = [
      {
        name: "Electronics",
        code: "ELEC",
        description: "Gadgets, devices & accessories",
        icon: IMAGES.ELECTRONICS[3],
      },
      {
        name: "Clothing",
        code: "CLOTH",
        description: "Men, Women & Kids apparel",
        icon: IMAGES.CLOTHING[0],
      },
      {
        name: "Home & Garden",
        code: "HOME",
        description: "Furniture, decor & appliances",
        icon: IMAGES.HOME[0],
      },
      {
        name: "Sports & Gym",
        code: "SPORT",
        description: "Equipment, gear & supplements",
        icon: IMAGES.SPORTS[0],
      },
      {
        name: "Beauty & Care",
        code: "BEAUTY",
        description: "Skincare, makeup & fragrance",
        icon: IMAGES.BEAUTY[0],
      },
      {
        name: "Food & Drinks",
        code: "FOOD",
        description: "Gourmet, organic & specialty foods",
        icon: IMAGES.FOOD[0],
      },
      {
        name: "Toys & Games",
        code: "TOYS",
        description: "Educational & fun for all ages",
        icon: IMAGES.TOYS[0],
      },
    ];
    const cat: Record<string, any> = {};
    for (const c of categoriesData) {
      cat[c.code] = (await Category.create(c))._id;
    }

    // ── 5. Products ───────────────────────────────────────────────────────
    console.log("📦 Seeding Products...");

    const productsData = [
      // ── ELECTRONICS ──────────────────────────────────────────────────
      {
        name: "MacBook Pro M2",
        sku: "SKU-ELEC-001",
        imageUrl: IMAGES.ELECTRONICS[0],
        description:
          "Supercharged by M2 Pro or M2 Max, MacBook Pro delivers extraordinary performance, an astonishing battery life of up to 22 hours, and a brilliant Liquid Retina XDR display.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 50,
        costPrice: 1500,
        sellingPrice: 1999,
        variants: [
          {
            variantName: "16GB / 512GB – Space Gray",
            sku: "SKU-ELEC-001-V1",
            size: "512GB",
            color: "Space Gray",
            stockQuantity: 25,
            imageUrl: IMAGES.ELECTRONICS[0],
          },
          {
            variantName: "32GB / 1TB – Silver",
            sku: "SKU-ELEC-001-V2",
            size: "1TB",
            color: "Silver",
            stockQuantity: 25,
            additionalPrice: 400,
            imageUrl: IMAGES.ELECTRONICS[0],
          },
        ],
      },
      {
        name: "iPhone 15 Pro",
        sku: "SKU-ELEC-002",
        imageUrl: IMAGES.ELECTRONICS[1],
        description:
          "Titanium design with Action Button, the most powerful iPhone ever. Features the A17 Pro chip with hardware-accelerated ray tracing and a 48MP main camera.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 120,
        costPrice: 850,
        sellingPrice: 1099,
        variants: [
          {
            variantName: "Natural Titanium – 128GB",
            sku: "SKU-ELEC-002-V1",
            size: "128GB",
            color: "Titanium",
            stockQuantity: 40,
            imageUrl: IMAGES.ELECTRONICS[1],
          },
          {
            variantName: "Black Titanium – 256GB",
            sku: "SKU-ELEC-002-V2",
            size: "256GB",
            color: "Black",
            stockQuantity: 40,
            additionalPrice: 100,
            imageUrl: IMAGES.ELECTRONICS[1],
          },
          {
            variantName: "White Titanium – 512GB",
            sku: "SKU-ELEC-002-V3",
            size: "512GB",
            color: "White",
            stockQuantity: 40,
            additionalPrice: 300,
            imageUrl: IMAGES.ELECTRONICS[1],
          },
        ],
      },
      {
        name: "Apple AirPods Pro (2nd Gen)",
        sku: "SKU-ELEC-003",
        imageUrl: IMAGES.ELECTRONICS[10],
        description:
          "AirPods Pro feature up to 2x more Active Noise Cancellation than the previous generation, plus Adaptive Transparency, and Personalized Spatial Audio.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 200,
        costPrice: 150,
        sellingPrice: 249,
        variants: [
          {
            variantName: "White – MagSafe Case",
            sku: "SKU-ELEC-003-V1",
            color: "White",
            stockQuantity: 200,
            imageUrl: IMAGES.ELECTRONICS[10],
          },
        ],
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        sku: "SKU-ELEC-004",
        imageUrl: IMAGES.ELECTRONICS[2],
        description:
          "Galaxy AI is here. Titanium frame with built-in S Pen, 200MP camera, and the first Galaxy smartphone with Galaxy AI capabilities built-in.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Samsung"],
        quantity: 80,
        costPrice: 900,
        sellingPrice: 1299,
        variants: [
          {
            variantName: "Titanium Gray – 256GB",
            sku: "SKU-ELEC-004-V1",
            size: "256GB",
            color: "Gray",
            stockQuantity: 40,
            imageUrl: IMAGES.ELECTRONICS[2],
          },
          {
            variantName: "Titanium Black – 512GB",
            sku: "SKU-ELEC-004-V2",
            size: "512GB",
            color: "Black",
            stockQuantity: 40,
            additionalPrice: 120,
            imageUrl: IMAGES.ELECTRONICS[2],
          },
        ],
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        sku: "SKU-ELEC-005",
        imageUrl: IMAGES.ELECTRONICS[3],
        description:
          "Industry-leading noise cancellation with two processors controlling 8 microphones. Up to 30 hours battery life with quick charging.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Sony"],
        quantity: 75,
        costPrice: 250,
        sellingPrice: 349,
        variants: [
          {
            variantName: "Black",
            sku: "SKU-ELEC-005-V1",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.ELECTRONICS[3],
          },
          {
            variantName: "Silver",
            sku: "SKU-ELEC-005-V2",
            color: "Silver",
            stockQuantity: 35,
            imageUrl: IMAGES.ELECTRONICS[3],
          },
        ],
      },
      {
        name: 'Samsung 27" 4K Monitor',
        sku: "SKU-ELEC-006",
        imageUrl: IMAGES.ELECTRONICS[4],
        description:
          "Experience crystal-clear 4K UHD visuals with HDR600, 144Hz refresh rate, and AMD FreeSync Premium for an immersive viewing experience.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Samsung"],
        quantity: 40,
        costPrice: 300,
        sellingPrice: 499,
        variants: [
          {
            variantName: "Black – 27 inch",
            sku: "SKU-ELEC-006-V1",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.ELECTRONICS[4],
          },
        ],
      },
      {
        name: 'Apple iPad Pro 12.9"',
        sku: "SKU-ELEC-007",
        imageUrl: IMAGES.ELECTRONICS[6],
        description:
          "The ultimate iPad experience. M2 chip, Liquid Retina XDR display with ProMotion, and support for Apple Pencil (2nd generation) and Magic Keyboard.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 60,
        costPrice: 700,
        sellingPrice: 1099,
        variants: [
          {
            variantName: "Space Gray – 128GB Wi-Fi",
            sku: "SKU-ELEC-007-V1",
            size: "128GB",
            color: "Space Gray",
            stockQuantity: 30,
            imageUrl: IMAGES.ELECTRONICS[6],
          },
          {
            variantName: "Silver – 256GB Wi-Fi",
            sku: "SKU-ELEC-007-V2",
            size: "256GB",
            color: "Silver",
            stockQuantity: 30,
            additionalPrice: 200,
            imageUrl: IMAGES.ELECTRONICS[6],
          },
        ],
      },
      {
        name: "Apple Watch Series 9",
        sku: "SKU-ELEC-008",
        imageUrl: IMAGES.ELECTRONICS[7],
        description:
          "The most powerful Apple Watch yet. S9 chip, brighter display, Double Tap gesture, and carbon neutral options. Advanced health features including crash detection.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 90,
        costPrice: 320,
        sellingPrice: 499,
        variants: [
          {
            variantName: "Midnight – 41mm",
            sku: "SKU-ELEC-008-V1",
            size: "41mm",
            color: "Midnight",
            stockQuantity: 45,
            imageUrl: IMAGES.ELECTRONICS[7],
          },
          {
            variantName: "Starlight – 45mm",
            sku: "SKU-ELEC-008-V2",
            size: "45mm",
            color: "Starlight",
            stockQuantity: 45,
            additionalPrice: 30,
            imageUrl: IMAGES.ELECTRONICS[7],
          },
        ],
      },
      {
        name: "Canon EOS R50 Camera",
        sku: "SKU-ELEC-009",
        imageUrl: IMAGES.ELECTRONICS[11],
        description:
          "A compact, lightweight mirrorless camera with 24.2MP APS-C sensor, 4K video, subject tracking AF, and built-in Wi-Fi. Perfect for content creators.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Canon"],
        quantity: 35,
        costPrice: 500,
        sellingPrice: 799,
        variants: [
          {
            variantName: "Black – Body Only",
            sku: "SKU-ELEC-009-V1",
            color: "Black",
            stockQuantity: 20,
            imageUrl: IMAGES.ELECTRONICS[11],
          },
          {
            variantName: "White – 18-45mm Kit Lens",
            sku: "SKU-ELEC-009-V2",
            color: "White",
            stockQuantity: 15,
            additionalPrice: 150,
            imageUrl: IMAGES.ELECTRONICS[11],
          },
        ],
      },
      {
        name: "Sony Bluetooth Speaker (SRS-XB43)",
        sku: "SKU-ELEC-010",
        imageUrl: IMAGES.ELECTRONICS[13],
        description:
          "Extra Bass wireless speaker with 24-hour battery life, IP67 waterproof & dustproof. Powerful audio with Live Sound mode and party-ready light effects.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Sony"],
        quantity: 100,
        costPrice: 100,
        sellingPrice: 149,
        variants: [
          {
            variantName: "Black",
            sku: "SKU-ELEC-010-V1",
            color: "Black",
            stockQuantity: 50,
            imageUrl: IMAGES.ELECTRONICS[13],
          },
          {
            variantName: "Blue",
            sku: "SKU-ELEC-010-V2",
            color: "Blue",
            stockQuantity: 30,
            imageUrl: IMAGES.ELECTRONICS[13],
          },
          {
            variantName: "Red",
            sku: "SKU-ELEC-010-V3",
            color: "Red",
            stockQuantity: 20,
            imageUrl: IMAGES.ELECTRONICS[13],
          },
        ],
      },
      {
        name: 'Samsung 65" QLED 4K Smart TV',
        sku: "SKU-ELEC-011",
        imageUrl: IMAGES.ELECTRONICS[14],
        description:
          "Quantum Dot technology delivers stunning 4K picture quality. Built-in Tizen OS with access to streaming services, gaming hub, and smart home integration.",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Samsung"],
        quantity: 20,
        costPrice: 900,
        sellingPrice: 1499,
        variants: [
          {
            variantName: "55 inch",
            sku: "SKU-ELEC-011-V1",
            color: "Black",
            stockQuantity: 10,
            imageUrl: IMAGES.ELECTRONICS[14],
          },
          {
            variantName: "65 inch",
            sku: "SKU-ELEC-011-V2",
            color: "Black",
            stockQuantity: 10,
            additionalPrice: 500,
            imageUrl: IMAGES.ELECTRONICS[14],
          },
        ],
      },

      // ── CLOTHING ─────────────────────────────────────────────────────
      {
        name: "Nike Air Max 270",
        sku: "SKU-CLOTH-001",
        imageUrl: IMAGES.CLOTHING[0],
        description:
          "Nike's first lifestyle Air Max brings you style, comfort, and big attitude in the Nike Air Max 270. The design draws inspiration from Air Max icons, and its large window Air unit is the largest Max Air unit yet.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 200,
        costPrice: 80,
        sellingPrice: 120,
        variants: [
          {
            variantName: "Red/Black – US 8",
            sku: "SKU-CLOTH-001-V1",
            size: "US 8",
            color: "Red",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[0],
          },
          {
            variantName: "Red/Black – US 9",
            sku: "SKU-CLOTH-001-V2",
            size: "US 9",
            color: "Red",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[0],
          },
          {
            variantName: "White/Blue – US 9",
            sku: "SKU-CLOTH-001-V3",
            size: "US 9",
            color: "White",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[0],
          },
          {
            variantName: "White/Blue – US 10",
            sku: "SKU-CLOTH-001-V4",
            size: "US 10",
            color: "White",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[0],
          },
        ],
      },
      {
        name: "Nike Tech Fleece Hoodie",
        sku: "SKU-CLOTH-002",
        imageUrl: IMAGES.CLOTHING[1],
        description:
          "Soft, lightweight warmth for everyday wear. Nike Tech Fleece fabric provides exceptional warmth while remaining lightweight and breathable.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 150,
        costPrice: 40,
        sellingPrice: 65,
        variants: [
          {
            variantName: "Carbon Heather – S",
            sku: "SKU-CLOTH-002-V1",
            size: "S",
            color: "Grey",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[1],
          },
          {
            variantName: "Carbon Heather – M",
            sku: "SKU-CLOTH-002-V2",
            size: "M",
            color: "Grey",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[1],
          },
          {
            variantName: "Black – L",
            sku: "SKU-CLOTH-002-V3",
            size: "L",
            color: "Black",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[1],
          },
        ],
      },
      {
        name: "Levi's 501 Original Jeans",
        sku: "SKU-CLOTH-003",
        imageUrl: IMAGES.CLOTHING[2],
        description:
          "The original jean since 1873. Straight fit, sits at waist. A button fly, slight taper below the knee, and rigid fabric give this style an authentic look.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 180,
        costPrice: 35,
        sellingPrice: 69,
        variants: [
          {
            variantName: "Dark Wash – 30x30",
            sku: "SKU-CLOTH-003-V1",
            size: "30x30",
            color: "Dark Blue",
            stockQuantity: 60,
            imageUrl: IMAGES.CLOTHING[2],
          },
          {
            variantName: "Dark Wash – 32x32",
            sku: "SKU-CLOTH-003-V2",
            size: "32x32",
            color: "Dark Blue",
            stockQuantity: 60,
            imageUrl: IMAGES.CLOTHING[2],
          },
          {
            variantName: "Light Wash – 34x32",
            sku: "SKU-CLOTH-003-V3",
            size: "34x32",
            color: "Light Blue",
            stockQuantity: 60,
            imageUrl: IMAGES.CLOTHING[2],
          },
        ],
      },
      {
        name: "Adidas Ultraboost 22",
        sku: "SKU-CLOTH-004",
        imageUrl: IMAGES.CLOTHING[6],
        description:
          "Our most technically advanced running shoes with Boost midsole, Primeknit+ upper, and Continental rubber outsole. Return energy with every step.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 120,
        costPrice: 90,
        sellingPrice: 180,
        variants: [
          {
            variantName: "Core Black – US 8",
            sku: "SKU-CLOTH-004-V1",
            size: "US 8",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.CLOTHING[6],
          },
          {
            variantName: "Core Black – US 10",
            sku: "SKU-CLOTH-004-V2",
            size: "US 10",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.CLOTHING[6],
          },
          {
            variantName: "Cloud White – US 9",
            sku: "SKU-CLOTH-004-V3",
            size: "US 9",
            color: "White",
            stockQuantity: 40,
            imageUrl: IMAGES.CLOTHING[6],
          },
        ],
      },
      {
        name: "Adidas Tiro Track Jacket",
        sku: "SKU-CLOTH-005",
        imageUrl: IMAGES.CLOTHING[5],
        description:
          "A classic football-inspired track jacket with an updated cut and feel. Features iconic 3-Stripes and Adidas logo on the chest.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 100,
        costPrice: 30,
        sellingPrice: 55,
        variants: [
          {
            variantName: "Black – M",
            sku: "SKU-CLOTH-005-V1",
            size: "M",
            color: "Black",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[5],
          },
          {
            variantName: "Navy – L",
            sku: "SKU-CLOTH-005-V2",
            size: "L",
            color: "Navy",
            stockQuantity: 50,
            imageUrl: IMAGES.CLOTHING[5],
          },
        ],
      },
      {
        name: "Premium Leather Handbag",
        sku: "SKU-CLOTH-006",
        imageUrl: IMAGES.CLOTHING[11],
        description:
          "Handcrafted from genuine full-grain leather. Spacious interior with multiple compartments, adjustable strap, and polished gold hardware.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 60,
        costPrice: 80,
        sellingPrice: 159,
        variants: [
          {
            variantName: "Tan Brown",
            sku: "SKU-CLOTH-006-V1",
            color: "Brown",
            stockQuantity: 30,
            imageUrl: IMAGES.CLOTHING[11],
          },
          {
            variantName: "Jet Black",
            sku: "SKU-CLOTH-006-V2",
            color: "Black",
            stockQuantity: 30,
            imageUrl: IMAGES.CLOTHING[11],
          },
        ],
      },
      {
        name: "Classic Canvas Backpack",
        sku: "SKU-CLOTH-007",
        imageUrl: IMAGES.CLOTHING[10],
        description:
          'Durable 600D polyester canvas with padded laptop sleeve (fits up to 15.6"), ergonomic shoulder straps, and USB charging port built-in.',
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 90,
        costPrice: 25,
        sellingPrice: 49,
        variants: [
          {
            variantName: "Olive Green",
            sku: "SKU-CLOTH-007-V1",
            color: "Olive",
            stockQuantity: 30,
            imageUrl: IMAGES.CLOTHING[10],
          },
          {
            variantName: "Navy Blue",
            sku: "SKU-CLOTH-007-V2",
            color: "Navy",
            stockQuantity: 30,
            imageUrl: IMAGES.CLOTHING[10],
          },
          {
            variantName: "Charcoal",
            sku: "SKU-CLOTH-007-V3",
            color: "Gray",
            stockQuantity: 30,
            imageUrl: IMAGES.CLOTHING[10],
          },
        ],
      },

      // ── HOME & GARDEN ─────────────────────────────────────────────────
      {
        name: "Modern Velvet Sofa",
        sku: "SKU-HOME-001",
        imageUrl: IMAGES.HOME[0],
        description:
          "A sleek, modern 3-seater sofa upholstered in premium velvet fabric. Features solid wood legs, high-density foam cushions, and a timeless silhouette.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["IKEA"],
        quantity: 15,
        costPrice: 400,
        sellingPrice: 599,
        variants: [
          {
            variantName: "Emerald Green",
            sku: "SKU-HOME-001-V1",
            color: "Green",
            stockQuantity: 5,
            imageUrl: IMAGES.HOME[0],
          },
          {
            variantName: "Dusty Rose",
            sku: "SKU-HOME-001-V2",
            color: "Pink",
            stockQuantity: 5,
            imageUrl: IMAGES.HOME[0],
          },
          {
            variantName: "Midnight Blue",
            sku: "SKU-HOME-001-V3",
            color: "Blue",
            stockQuantity: 5,
            imageUrl: IMAGES.HOME[0],
          },
        ],
      },
      {
        name: "Oak Dining Table Set (6-Person)",
        sku: "SKU-HOME-002",
        imageUrl: IMAGES.HOME[1],
        description:
          "Solid oak dining table with six matching upholstered chairs. Seats six comfortably with a 180cm tabletop. Assembly required.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["IKEA"],
        quantity: 10,
        costPrice: 600,
        sellingPrice: 999,
        variants: [
          {
            variantName: "Natural Oak",
            sku: "SKU-HOME-002-V1",
            color: "Oak",
            stockQuantity: 5,
            imageUrl: IMAGES.HOME[1],
          },
          {
            variantName: "Walnut",
            sku: "SKU-HOME-002-V2",
            color: "Brown",
            stockQuantity: 5,
            additionalPrice: 100,
            imageUrl: IMAGES.HOME[1],
          },
        ],
      },
      {
        name: "Dyson V15 Detect Vacuum",
        sku: "SKU-HOME-003",
        imageUrl: IMAGES.HOME[8],
        description:
          "Laser reveals hidden dust on hard floors. Acoustic piezo sensor detects and counts microscopic particles. 60-minute run time with up to 230 AW suction.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["Dyson"],
        quantity: 30,
        costPrice: 350,
        sellingPrice: 749,
        variants: [
          {
            variantName: "Yellow/Nickel",
            sku: "SKU-HOME-003-V1",
            color: "Yellow",
            stockQuantity: 30,
            imageUrl: IMAGES.HOME[8],
          },
        ],
      },
      {
        name: "Nespresso Vertuo Coffee Maker",
        sku: "SKU-HOME-004",
        imageUrl: IMAGES.HOME[7],
        description:
          "Brews five cup sizes from espresso to alto. Centrifusion technology spins capsules up to 7,000 RPM, blending ground coffee with water for a smooth crema.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["Nescafé"],
        quantity: 45,
        costPrice: 120,
        sellingPrice: 199,
        variants: [
          {
            variantName: "Black",
            sku: "SKU-HOME-004-V1",
            color: "Black",
            stockQuantity: 25,
            imageUrl: IMAGES.HOME[7],
          },
          {
            variantName: "Chrome",
            sku: "SKU-HOME-004-V2",
            color: "Silver",
            stockQuantity: 20,
            additionalPrice: 30,
            imageUrl: IMAGES.HOME[7],
          },
        ],
      },
      {
        name: "Scandinavian Floor Lamp",
        sku: "SKU-HOME-005",
        imageUrl: IMAGES.HOME[2],
        description:
          "Minimalist arc floor lamp with adjustable head, linen shade, and marble base. Perfect for reading corners and living rooms. Height: 155cm.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["IKEA"],
        quantity: 55,
        costPrice: 60,
        sellingPrice: 129,
        variants: [
          {
            variantName: "White Shade",
            sku: "SKU-HOME-005-V1",
            color: "White",
            stockQuantity: 30,
            imageUrl: IMAGES.HOME[2],
          },
          {
            variantName: "Linen Shade",
            sku: "SKU-HOME-005-V2",
            color: "Beige",
            stockQuantity: 25,
            imageUrl: IMAGES.HOME[2],
          },
        ],
      },
      {
        name: "Luxury Scented Candle Set",
        sku: "SKU-HOME-006",
        imageUrl: IMAGES.HOME[9],
        description:
          "Set of 3 hand-poured soy wax candles in glass jars. Scents: Cedarwood & Vanilla, Fresh Linen, and Rose & Jasmine. Up to 50 hours burn time each.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["IKEA"],
        quantity: 100,
        costPrice: 20,
        sellingPrice: 45,
        variants: [
          {
            variantName: "Set of 3",
            sku: "SKU-HOME-006-V1",
            color: "Mixed",
            stockQuantity: 100,
            imageUrl: IMAGES.HOME[9],
          },
        ],
      },
      {
        name: "Indoor Plant Bundle (3 Pots)",
        sku: "SKU-HOME-007",
        imageUrl: IMAGES.HOME[10],
        description:
          "Curated trio of low-maintenance indoor plants: Monstera Deliciosa, Snake Plant, and Pothos Ivy. Comes in matching matte ceramic pots. Great for any room.",
        category: cat["HOME"],
        supplier: sup["Daily Essentials Co"],
        brand: brand["IKEA"],
        quantity: 40,
        costPrice: 35,
        sellingPrice: 79,
        variants: [
          {
            variantName: "White Pots",
            sku: "SKU-HOME-007-V1",
            color: "White",
            stockQuantity: 20,
            imageUrl: IMAGES.HOME[10],
          },
          {
            variantName: "Black Pots",
            sku: "SKU-HOME-007-V2",
            color: "Black",
            stockQuantity: 20,
            imageUrl: IMAGES.HOME[10],
          },
        ],
      },

      // ── SPORTS & GYM ──────────────────────────────────────────────────
      {
        name: "Adjustable Dumbbell Set (5–52.5 lbs)",
        sku: "SKU-SPORT-001",
        imageUrl: IMAGES.SPORTS[0],
        description:
          "Replace 15 sets of weights with one compact dumbbell. Dial to select weight from 5 to 52.5 lbs in 2.5 lb increments. Ideal for home gyms.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Nike"],
        quantity: 25,
        costPrice: 200,
        sellingPrice: 399,
        variants: [
          {
            variantName: "Single",
            sku: "SKU-SPORT-001-V1",
            color: "Gray",
            stockQuantity: 10,
            imageUrl: IMAGES.SPORTS[0],
          },
          {
            variantName: "Pair Set",
            sku: "SKU-SPORT-001-V2",
            color: "Gray",
            stockQuantity: 15,
            additionalPrice: 380,
            imageUrl: IMAGES.SPORTS[0],
          },
        ],
      },
      {
        name: "Yoga Mat (6mm Thick)",
        sku: "SKU-SPORT-002",
        imageUrl: IMAGES.SPORTS[3],
        description:
          "Premium non-slip yoga mat made from eco-friendly TPE material. 6mm thickness provides excellent joint support. Includes carrying strap. 183cm × 61cm.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Adidas"],
        quantity: 150,
        costPrice: 20,
        sellingPrice: 39,
        variants: [
          {
            variantName: "Lavender",
            sku: "SKU-SPORT-002-V1",
            color: "Purple",
            stockQuantity: 50,
            imageUrl: IMAGES.SPORTS[3],
          },
          {
            variantName: "Sage Green",
            sku: "SKU-SPORT-002-V2",
            color: "Green",
            stockQuantity: 50,
            imageUrl: IMAGES.SPORTS[3],
          },
          {
            variantName: "Charcoal Gray",
            sku: "SKU-SPORT-002-V3",
            color: "Gray",
            stockQuantity: 50,
            imageUrl: IMAGES.SPORTS[3],
          },
        ],
      },
      {
        name: "DJI Mini 4 Pro Drone",
        sku: "SKU-SPORT-003",
        imageUrl: IMAGES.TOYS[4],
        description:
          "Under 249g, no registration needed in most countries. 4K/60fps video, omnidirectional obstacle sensing, ActiveTrack 360°, and 34-minute max flight time.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["DJI"],
        quantity: 20,
        costPrice: 550,
        sellingPrice: 759,
        variants: [
          {
            variantName: "Standard Combo",
            sku: "SKU-SPORT-003-V1",
            color: "Gray",
            stockQuantity: 10,
            imageUrl: IMAGES.TOYS[4],
          },
          {
            variantName: "Fly More Combo+",
            sku: "SKU-SPORT-003-V2",
            color: "Gray",
            stockQuantity: 10,
            additionalPrice: 250,
            imageUrl: IMAGES.TOYS[4],
          },
        ],
      },
      {
        name: "Nike Road Runner Shoes",
        sku: "SKU-SPORT-004",
        imageUrl: IMAGES.SPORTS[4],
        description:
          "Engineered for road running with React foam midsole for responsive cushioning, Flyknit upper for breathability, and rubber outsole for traction on pavement.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Nike"],
        quantity: 80,
        costPrice: 75,
        sellingPrice: 130,
        variants: [
          {
            variantName: "Black/White – US 8",
            sku: "SKU-SPORT-004-V1",
            size: "US 8",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.SPORTS[4],
          },
          {
            variantName: "Black/White – US 10",
            sku: "SKU-SPORT-004-V2",
            size: "US 10",
            color: "Black",
            stockQuantity: 40,
            imageUrl: IMAGES.SPORTS[4],
          },
        ],
      },
      {
        name: "Pro Boxing Gloves",
        sku: "SKU-SPORT-005",
        imageUrl: IMAGES.SPORTS[6],
        description:
          "Genuine leather boxing gloves with multi-layered foam padding for superior protection. Velcro wrist closure for secure fit. Available in 10oz, 12oz, 14oz.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Nike"],
        quantity: 60,
        costPrice: 40,
        sellingPrice: 79,
        variants: [
          {
            variantName: "Red – 10oz",
            sku: "SKU-SPORT-005-V1",
            size: "10oz",
            color: "Red",
            stockQuantity: 20,
            imageUrl: IMAGES.SPORTS[6],
          },
          {
            variantName: "Red – 12oz",
            sku: "SKU-SPORT-005-V2",
            size: "12oz",
            color: "Red",
            stockQuantity: 20,
            imageUrl: IMAGES.SPORTS[6],
          },
          {
            variantName: "Black – 14oz",
            sku: "SKU-SPORT-005-V3",
            size: "14oz",
            color: "Black",
            stockQuantity: 20,
            imageUrl: IMAGES.SPORTS[6],
          },
        ],
      },

      // ── BEAUTY & CARE ─────────────────────────────────────────────────
      {
        name: "Hydrating Vitamin C Serum",
        sku: "SKU-BEAUTY-001",
        imageUrl: IMAGES.BEAUTY[6],
        description:
          "20% Vitamin C + Hyaluronic Acid + Vitamin E brightening serum. Visibly reduces dark spots, fine lines, and uneven skin tone in 4 weeks.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["L'Oréal"],
        quantity: 200,
        costPrice: 18,
        sellingPrice: 45,
        variants: [
          {
            variantName: "30ml",
            sku: "SKU-BEAUTY-001-V1",
            color: "Clear",
            stockQuantity: 200,
            imageUrl: IMAGES.BEAUTY[6],
          },
        ],
      },
      {
        name: "L'Oréal Paris Lipstick Collection",
        sku: "SKU-BEAUTY-002",
        imageUrl: IMAGES.BEAUTY[3],
        description:
          "Long-lasting, high-pigment lipstick with moisturizing argan oil. 24-hour staying power with comfortable satin finish. 50+ shades available.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["L'Oréal"],
        quantity: 300,
        costPrice: 8,
        sellingPrice: 18,
        variants: [
          {
            variantName: "Pure Red",
            sku: "SKU-BEAUTY-002-V1",
            color: "Red",
            stockQuantity: 100,
            imageUrl: IMAGES.BEAUTY[3],
          },
          {
            variantName: "Nude Rose",
            sku: "SKU-BEAUTY-002-V2",
            color: "Nude",
            stockQuantity: 100,
            imageUrl: IMAGES.BEAUTY[3],
          },
          {
            variantName: "Berry Mauve",
            sku: "SKU-BEAUTY-002-V3",
            color: "Mauve",
            stockQuantity: 100,
            imageUrl: IMAGES.BEAUTY[3],
          },
        ],
      },
      {
        name: "Dyson Supersonic Hair Dryer",
        sku: "SKU-BEAUTY-003",
        imageUrl: IMAGES.BEAUTY[5],
        description:
          "Engineered to protect hair from extreme heat damage. Uses intelligent heat control measured 40 times per second. Fast drying, no extreme heat.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["Dyson"],
        quantity: 40,
        costPrice: 250,
        sellingPrice: 429,
        variants: [
          {
            variantName: "Fuchsia/Iron",
            sku: "SKU-BEAUTY-003-V1",
            color: "Pink",
            stockQuantity: 20,
            imageUrl: IMAGES.BEAUTY[5],
          },
          {
            variantName: "Prussian Blue",
            sku: "SKU-BEAUTY-003-V2",
            color: "Blue",
            stockQuantity: 20,
            additionalPrice: 20,
            imageUrl: IMAGES.BEAUTY[5],
          },
        ],
      },
      {
        name: "SPF 50+ Daily Sunscreen",
        sku: "SKU-BEAUTY-004",
        imageUrl: IMAGES.BEAUTY[8],
        description:
          "Broad-spectrum SPF 50+ sunscreen with lightweight, invisible finish. Water-resistant for 80 minutes. Dermatologist-tested and non-comedogenic.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["L'Oréal"],
        quantity: 250,
        costPrice: 10,
        sellingPrice: 24,
        variants: [
          {
            variantName: "50ml Travel",
            sku: "SKU-BEAUTY-004-V1",
            color: "White",
            stockQuantity: 125,
            imageUrl: IMAGES.BEAUTY[8],
          },
          {
            variantName: "100ml Regular",
            sku: "SKU-BEAUTY-004-V2",
            color: "White",
            stockQuantity: 125,
            additionalPrice: 8,
            imageUrl: IMAGES.BEAUTY[8],
          },
        ],
      },
      {
        name: "Luxury Perfume – Midnight Oud",
        sku: "SKU-BEAUTY-005",
        imageUrl: IMAGES.BEAUTY[2],
        description:
          "A rich, oriental fragrance with notes of oud wood, black amber, and rose. Long-lasting Eau de Parfum concentration. Presented in an elegant glass bottle.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["L'Oréal"],
        quantity: 70,
        costPrice: 60,
        sellingPrice: 129,
        variants: [
          {
            variantName: "50ml EDP",
            sku: "SKU-BEAUTY-005-V1",
            color: "Gold",
            stockQuantity: 40,
            imageUrl: IMAGES.BEAUTY[2],
          },
          {
            variantName: "100ml EDP",
            sku: "SKU-BEAUTY-005-V2",
            color: "Gold",
            stockQuantity: 30,
            additionalPrice: 50,
            imageUrl: IMAGES.BEAUTY[2],
          },
        ],
      },

      // ── FOOD & DRINKS ─────────────────────────────────────────────────
      {
        name: "Nescafé Gold Blend Coffee (500g)",
        sku: "SKU-FOOD-001",
        imageUrl: IMAGES.FOOD[0],
        description:
          "Smooth, full-flavored instant coffee made from carefully selected Arabica and Robusta beans. Perfect for any time of day. Rich aroma, velvety taste.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafé"],
        quantity: 300,
        costPrice: 8,
        sellingPrice: 16,
        variants: [
          {
            variantName: "200g",
            sku: "SKU-FOOD-001-V1",
            stockQuantity: 150,
            imageUrl: IMAGES.FOOD[0],
          },
          {
            variantName: "500g",
            sku: "SKU-FOOD-001-V2",
            stockQuantity: 150,
            additionalPrice: 10,
            imageUrl: IMAGES.FOOD[0],
          },
        ],
      },
      {
        name: "Lindt Excellence Dark Chocolate",
        sku: "SKU-FOOD-002",
        imageUrl: IMAGES.FOOD[1],
        description:
          "Swiss dark chocolate made by Lindt Master Chocolatiers. Available in 70%, 85%, and 90% cocoa. Intense, rich flavor with smooth texture.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafé"],
        quantity: 500,
        costPrice: 4,
        sellingPrice: 8,
        variants: [
          {
            variantName: "70% Cocoa",
            sku: "SKU-FOOD-002-V1",
            stockQuantity: 200,
            imageUrl: IMAGES.FOOD[1],
          },
          {
            variantName: "85% Cocoa",
            sku: "SKU-FOOD-002-V2",
            stockQuantity: 200,
            imageUrl: IMAGES.FOOD[1],
          },
          {
            variantName: "90% Cocoa",
            sku: "SKU-FOOD-002-V3",
            stockQuantity: 100,
            additionalPrice: 1,
            imageUrl: IMAGES.FOOD[1],
          },
        ],
      },
      {
        name: "Organic Raw Honey (500g)",
        sku: "SKU-FOOD-003",
        imageUrl: IMAGES.FOOD[3],
        description:
          "Cold-pressed, unfiltered raw honey from free-range bees. Rich in antioxidants and enzymes. No added sugar or preservatives.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafé"],
        quantity: 200,
        costPrice: 6,
        sellingPrice: 14,
        variants: [
          {
            variantName: "Wildflower",
            sku: "SKU-FOOD-003-V1",
            stockQuantity: 100,
            imageUrl: IMAGES.FOOD[3],
          },
          {
            variantName: "Manuka",
            sku: "SKU-FOOD-003-V2",
            stockQuantity: 100,
            additionalPrice: 10,
            imageUrl: IMAGES.FOOD[3],
          },
        ],
      },

      // ── TOYS & GAMES ─────────────────────────────────────────────────
      {
        name: "LEGO Architecture Skyline – Paris",
        sku: "SKU-TOYS-001",
        imageUrl: IMAGES.TOYS[0],
        description:
          "Build iconic Paris landmarks including the Eiffel Tower, Notre-Dame, and Louvre. 649 pieces, suitable for ages 12+. Perfect display model.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 50,
        costPrice: 40,
        sellingPrice: 79,
        variants: [
          {
            variantName: "Standard Box",
            sku: "SKU-TOYS-001-V1",
            stockQuantity: 50,
            imageUrl: IMAGES.TOYS[0],
          },
        ],
      },
      {
        name: "Catan Board Game",
        sku: "SKU-TOYS-002",
        imageUrl: IMAGES.TOYS[1],
        description:
          "The world's best-selling strategy board game. Trade, build, and settle the island of Catan. For 3-4 players, ages 10+. Average play time 75 minutes.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 80,
        costPrice: 25,
        sellingPrice: 49,
        variants: [
          {
            variantName: "Standard Edition",
            sku: "SKU-TOYS-002-V1",
            stockQuantity: 60,
            imageUrl: IMAGES.TOYS[1],
          },
          {
            variantName: "Travel Edition",
            sku: "SKU-TOYS-002-V2",
            stockQuantity: 20,
            additionalPrice: 10,
            imageUrl: IMAGES.TOYS[1],
          },
        ],
      },
      {
        name: "Remote Control Racing Car",
        sku: "SKU-TOYS-003",
        imageUrl: IMAGES.TOYS[2],
        description:
          "1:16 scale RC car with 4WD, 30+ mph top speed, 2.4GHz interference-free remote. Rechargeable Li-ion battery with 30-min run time. Ages 8+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 60,
        costPrice: 30,
        sellingPrice: 59,
        variants: [
          {
            variantName: "Red",
            sku: "SKU-TOYS-003-V1",
            color: "Red",
            stockQuantity: 30,
            imageUrl: IMAGES.TOYS[2],
          },
          {
            variantName: "Blue",
            sku: "SKU-TOYS-003-V2",
            color: "Blue",
            stockQuantity: 30,
            imageUrl: IMAGES.TOYS[2],
          },
        ],
      },
    ];

    const insertedProducts: any[] = [];
    for (const p of productsData) {
      insertedProducts.push(await Product.create(p));
    }

    const find = (sku: string) =>
      insertedProducts.find((p) => p.sku === sku)._id;

    // ── 6. Promotions ─────────────────────────────────────────────────────
    console.log("🎉 Seeding Promotions...");
    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    const twoMonths = new Date(now);
    twoMonths.setMonth(now.getMonth() + 2);

    const promotionsData = [
      {
        name: "Summer Tech Sale",
        description: "15% off all Apple products this summer",
        discountType: "PERCENTAGE",
        discountValue: 15,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-ELEC-001"),
      },
      {
        name: "iPhone Launch Deal",
        description: "$100 off iPhone 15 Pro – Limited time",
        discountType: "FIXED_AMOUNT",
        discountValue: 100,
        startDate: now,
        endDate: nextWeek,
        product: find("SKU-ELEC-002"),
      },
      {
        name: "AirPods Flash Sale",
        description: "10% off AirPods Pro this weekend only",
        discountType: "PERCENTAGE",
        discountValue: 10,
        startDate: now,
        endDate: nextWeek,
        product: find("SKU-ELEC-003"),
      },
      {
        name: "Galaxy Upgrade Promo",
        description: "$120 off Samsung Galaxy S24 Ultra",
        discountType: "FIXED_AMOUNT",
        discountValue: 120,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-ELEC-004"),
      },
      {
        name: "Summer Clearance",
        description: "30% off Nike Air Max 270 – selected sizes",
        discountType: "PERCENTAGE",
        discountValue: 30,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-CLOTH-001"),
      },
      {
        name: "Gym Starter Deal",
        description: "$50 off Adjustable Dumbbell Set",
        discountType: "FIXED_AMOUNT",
        discountValue: 50,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-SPORT-001"),
      },
      {
        name: "Beauty Glow Package",
        description: "20% off Vitamin C Serum – Glow up for less!",
        discountType: "PERCENTAGE",
        discountValue: 20,
        startDate: now,
        endDate: twoMonths,
        product: find("SKU-BEAUTY-001"),
      },
      {
        name: "Home Refresh Sale",
        description: "10% off Modern Velvet Sofa",
        discountType: "PERCENTAGE",
        discountValue: 10,
        startDate: now,
        endDate: twoMonths,
        product: find("SKU-HOME-001"),
      },
      {
        name: "Coffee Lover Deal",
        description: "Buy 2 get 15% off Nescafé Gold",
        discountType: "PERCENTAGE",
        discountValue: 15,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-FOOD-001"),
      },
      {
        name: "Toy Box Bonanza",
        description: "25% off all LEGO sets this month",
        discountType: "PERCENTAGE",
        discountValue: 25,
        startDate: now,
        endDate: nextMonth,
        product: find("SKU-TOYS-001"),
      },
    ];
    for (const p of promotionsData) await Promotion.create(p);

    // ── 7. Banners ────────────────────────────────────────────────────────
    console.log("🖼️  Seeding Banners...");
    const bannersData = [
      {
        title: "iPhone 15 Pro – Titanium.",
        description: "A total powerhouse. Now $100 off.",
        imageUrl: IMAGES.BANNERS[4],
        linkUrl: "/products/" + find("SKU-ELEC-002"),
        displayOrder: 1,
        status: "ACTIVE",
      },
      {
        title: "Summer Fashion Sale",
        description: "Up to 30% off Nike, Adidas & more.",
        imageUrl: IMAGES.BANNERS[3],
        linkUrl: "/products/" + find("SKU-CLOTH-001"),
        displayOrder: 2,
        status: "ACTIVE",
      },
      {
        title: "Elevate Your Home",
        description: "Modern furniture & décor – up to 10% off.",
        imageUrl: IMAGES.BANNERS[1],
        linkUrl: "/products/" + find("SKU-HOME-001"),
        displayOrder: 3,
        status: "ACTIVE",
      },
      {
        title: "Glow Up This Season",
        description: "Top skincare & beauty picks from L'Oréal.",
        imageUrl: IMAGES.BANNERS[0],
        linkUrl: "/products/" + find("SKU-BEAUTY-001"),
        displayOrder: 4,
        status: "ACTIVE",
      },
      {
        title: "Fuel Your Fitness",
        description: "Equipment, gear & shoes for every athlete.",
        imageUrl: IMAGES.BANNERS[2],
        linkUrl: "/products/" + find("SKU-SPORT-001"),
        displayOrder: 5,
        status: "ACTIVE",
      },
      {
        title: "Taste the Difference",
        description: "Organic & gourmet foods delivered to you.",
        imageUrl: IMAGES.BANNERS[5],
        linkUrl: "/products/" + find("SKU-FOOD-003"),
        displayOrder: 6,
        status: "ACTIVE",
      },
    ];
    for (const b of bannersData) await Banner.create(b);

    console.log("\n🎊 Database Seeding Complete!");
    console.log(`   👤 Users:      ${users.length}`);
    console.log(`   🏭 Suppliers:  ${suppliersData.length}`);
    console.log(`   🏷️  Brands:     ${brandsData.length}`);
    console.log(`   📂 Categories: ${categoriesData.length}`);
    console.log(`   📦 Products:   ${productsData.length}`);
    console.log(`   🎉 Promotions: ${promotionsData.length}`);
    console.log(`   🖼️  Banners:    ${bannersData.length}`);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  }
}

seedData();
