import "dotenv/config";
import mongoose from "mongoose";
import User from "./src/models/User";
import { Product, Category, Brand, Supplier } from "./src/models/Product";
import Banner from "./src/models/Banner";
import { Promotion } from "./src/models/Promotion";
import Review from "./src/models/Review";

// ─── Curated Unsplash Images ─────────────────────────────────────────────────
const IMAGES = {
  ELECTRONICS: [
    "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800", // MacBook
    "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800", // iPhone side
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800", // iPhone flat
    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&q=80&w=800", // Samsung Galaxy
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800", // Headphones
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800", // Monitor
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800", // iPad
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=800", // Smartwatch
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800", // Laptop
    "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&q=80&w=800", // Keyboard
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800", // Sunglasses/AirPods style
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=800", // Camera
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800", // Mouse
    "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&q=80&w=800", // Speaker
    "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800", // TV
    "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&q=80&w=800", // PS5 controller
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800", // Tech flat lay
  ],
  CLOTHING: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800", // Nike red shoes
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800", // White sneakers
    "https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=800", // Hoodie
    "https://images.unsplash.com/photo-1541099649105-f69ad23f324e?auto=format&fit=crop&q=80&w=800", // Jeans
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=800", // T-shirt
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800", // Jacket
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800", // Adidas shoes
    "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800", // Scarf/accessories
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800", // Leggings
    "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?auto=format&fit=crop&q=80&w=800", // Cap
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", // Backpack
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800", // Handbag
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800", // Running shoes
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&q=80&w=800", // Sweatshirt
    "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&q=80&w=800", // Rain jacket
  ],
  HOME: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800", // Sofa
    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&q=80&w=800", // Table
    "https://images.unsplash.com/photo-1507473885765-e6ed657f49af?auto=format&fit=crop&q=80&w=800", // Lamp
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800", // Kitchen
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?auto=format&fit=crop&q=80&w=800", // Bed
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&q=80&w=800", // Vacuum
    "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?auto=format&fit=crop&q=80&w=800", // Coffee maker
    "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800", // Candles
    "https://images.unsplash.com/photo-1581539250439-c96689b516dd?auto=format&fit=crop&q=80&w=800", // Plant pot
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800", // Bedding
    "https://images.unsplash.com/photo-1556912998-c57cc6b63cd7?auto=format&fit=crop&q=80&w=800", // Kitchen mixer
    "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&q=80&w=800", // Smart bulb
    "https://images.unsplash.com/photo-1504274066651-8d31a536b11a?auto=format&fit=crop&q=80&w=800", // Drill
    "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?auto=format&fit=crop&q=80&w=800", // Pillow
    "https://images.unsplash.com/photo-1574739782594-db4ead022697?auto=format&fit=crop&q=80&w=800", // Instant pot
  ],
  SPORTS: [
    "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=800", // Dumbbells
    "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=800", // Yoga mat
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800", // Running shoes
    "https://images.unsplash.com/photo-1547941126-3d5322b218b0?auto=format&fit=crop&q=80&w=800", // Boxing gloves
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&q=80&w=800", // Drone
    "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800", // GPS watch
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800", // Treadmill
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800", // Gym weights
    "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&q=80&w=800", // Bicycle
    "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?auto=format&fit=crop&q=80&w=800", // Tennis racket
    "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&q=80&w=800", // Massage gun
    "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&q=80&w=800", // Protein shaker
  ],
  BEAUTY: [
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800", // Skincare set
    "https://images.unsplash.com/photo-1570172619385-2e69733fee3f?auto=format&fit=crop&q=80&w=800", // Perfume
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&q=80&w=800", // Lipstick
    "https://images.unsplash.com/photo-1631730486784-74757073d5f8?auto=format&fit=crop&q=80&w=800", // Hair dryer
    "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800", // Serum
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&q=80&w=800", // Face mask
    "https://images.unsplash.com/photo-1526758097130-bab247274f58?auto=format&fit=crop&q=80&w=800", // Sunscreen
    "https://images.unsplash.com/photo-1512496011212-7da344498308?auto=format&fit=crop&q=80&w=800", // Makeup
    "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800", // Nail polish
    "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&q=80&w=800", // Foundation
    "https://images.unsplash.com/photo-1583241800698-e8ab01830a66?auto=format&fit=crop&q=80&w=800", // Moisturizer
    "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800", // Hair treatment
  ],
  FOOD: [
    "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=800", // Coffee beans
    "https://images.unsplash.com/photo-1481391319762-47dff72954d9?auto=format&fit=crop&q=80&w=800", // Chocolate bar
    "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800", // Honey jar
    "https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=800", // Sparkling water
    "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?auto=format&fit=crop&q=80&w=800", // Nuts
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=800", // Olive oil
    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=800", // Tea
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=800", // Energy bar
    "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&q=80&w=800", // Protein powder
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800", // Food spread
  ],
  TOYS: [
    "https://picsum.photos/seed/lego-set/800/800",
    "https://picsum.photos/seed/boardgame/800/800",
    "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=800", // RC car
    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=800", // Teddy bear
    "https://picsum.photos/seed/nintendo/800/800",
    "https://picsum.photos/seed/nerf/800/800",
    "https://picsum.photos/seed/puzzle/800/800",
    "https://picsum.photos/seed/playdoh/800/800",
    "https://picsum.photos/seed/hasbro/800/800",
  ],
  BANNERS: [
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&q=80&w=1400",
    "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=1400",
  ],
};

// ─── Seed Entry Point ─────────────────────────────────────────────────────────
async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ MongoDB Connected for Seeding...");

    console.log("🗑️  Clearing database...");
    await mongoose.connection.db?.dropDatabase();

    // ── 1. Users ──────────────────────────────────────────────────────────
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
    const insertedUsers: any[] = [];
    for (const u of users) insertedUsers.push(await new User(u).save());

    // ── 2. Suppliers ───────────────────────────────────────────────────────
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
      {
        name: "Home & Living Hub",
        contactPerson: "Henry Park",
        email: "henry@homelivinghub.com",
        phone: "+1-800-555-0808",
        address: "77 Living Way, Seattle, WA",
        status: "ACTIVE",
      },
    ];
    const sup: Record<string, any> = {};
    for (const s of suppliersData) {
      sup[s.name] = (await Supplier.create(s))._id;
    }

    // ── 3. Brands ──────────────────────────────────────────────────────────
    console.log("🏷️  Seeding Brands...");
    const brandsData = [
      // Electronics
      { name: "Apple", description: "Think Different", logoUrl: "https://ui-avatars.com/api/?name=Apple&size=128&background=1d1d1f&color=ffffff&bold=true&format=png" },
      { name: "Samsung", description: "Inspire the World", logoUrl: "https://ui-avatars.com/api/?name=Samsung&size=128&background=1428A0&color=ffffff&bold=true&format=png" },
      { name: "Sony", description: "Be Moved", logoUrl: "https://ui-avatars.com/api/?name=Sony&size=128&background=000000&color=ffffff&bold=true&format=png" },
      { name: "Dell", description: "The Power to Do More", logoUrl: "https://ui-avatars.com/api/?name=Dell&size=128&background=007DB8&color=ffffff&bold=true&format=png" },
      { name: "Logitech", description: "Designed for Doing", logoUrl: "https://ui-avatars.com/api/?name=Logitech&size=128&background=00B5E2&color=ffffff&bold=true&format=png" },
      { name: "Bose", description: "Better Sound Through Research", logoUrl: "https://ui-avatars.com/api/?name=Bose&size=128&background=000000&color=ffffff&bold=true&format=png" },
      { name: "LG", description: "Life's Good", logoUrl: "https://ui-avatars.com/api/?name=LG&size=128&background=A50034&color=ffffff&bold=true&format=png" },
      { name: "GoPro", description: "Be a Hero", logoUrl: "https://ui-avatars.com/api/?name=GoPro&size=128&background=00AFD8&color=ffffff&bold=true&format=png" },
      { name: "Canon", description: "Delighting You Always", logoUrl: "https://ui-avatars.com/api/?name=Canon&size=128&background=CC0000&color=ffffff&bold=true&format=png" },
      // Clothing
      { name: "Nike", description: "Just Do It", logoUrl: "https://ui-avatars.com/api/?name=Nike&size=128&background=111111&color=ffffff&bold=true&format=png" },
      { name: "Adidas", description: "Impossible is Nothing", logoUrl: "https://ui-avatars.com/api/?name=Adidas&size=128&background=000000&color=ffffff&bold=true&format=png" },
      { name: "Levis", description: "Quality Never Goes Out of Style", logoUrl: "https://ui-avatars.com/api/?name=Levi%27s&size=128&background=CC0000&color=ffffff&bold=true&format=png" },
      { name: "New Balance", description: "Fearlessly Independent", logoUrl: "https://ui-avatars.com/api/?name=NB&size=128&background=CC0000&color=ffffff&bold=true&format=png" },
      { name: "Under Armour", description: "Protect This House", logoUrl: "https://ui-avatars.com/api/?name=UA&size=128&background=1C1C1E&color=ffffff&bold=true&format=png" },
      { name: "Columbia", description: "Beyond the Ordinary", logoUrl: "https://ui-avatars.com/api/?name=Columbia&size=128&background=003087&color=ffffff&bold=true&format=png" },
      // Home
      { name: "IKEA", description: "The Wonderful Everyday", logoUrl: "https://ui-avatars.com/api/?name=IKEA&size=128&background=0058A3&color=FFDA1A&bold=true&format=png" },
      { name: "Dyson", description: "Solving Real Problems", logoUrl: "https://ui-avatars.com/api/?name=Dyson&size=128&background=C41230&color=ffffff&bold=true&format=png" },
      { name: "KitchenAid", description: "For the Love of Cooking", logoUrl: "https://ui-avatars.com/api/?name=KA&size=128&background=C8102E&color=ffffff&bold=true&format=png" },
      { name: "Philips", description: "Innovation and You", logoUrl: "https://ui-avatars.com/api/?name=Philips&size=128&background=0B2D8F&color=ffffff&bold=true&format=png" },
      { name: "Instant Pot", description: "Reinventing Cooking", logoUrl: "https://ui-avatars.com/api/?name=IP&size=128&background=E8282E&color=ffffff&bold=true&format=png" },
      // Sports
      { name: "DJI", description: "The Future of Possible", logoUrl: "https://ui-avatars.com/api/?name=DJI&size=128&background=2196F3&color=ffffff&bold=true&format=png" },
      { name: "Garmin", description: "Beat Yesterday", logoUrl: "https://ui-avatars.com/api/?name=Garmin&size=128&background=007CC3&color=ffffff&bold=true&format=png" },
      { name: "Theragun", description: "Recover Like the Pros", logoUrl: "https://ui-avatars.com/api/?name=Theragun&size=128&background=1A1A2E&color=ffffff&bold=true&format=png" },
      { name: "Wilson", description: "Sports Equipment Leaders", logoUrl: "https://ui-avatars.com/api/?name=Wilson&size=128&background=CC0000&color=ffffff&bold=true&format=png" },
      // Beauty
      { name: "LOreal", description: "Because You're Worth It", logoUrl: "https://ui-avatars.com/api/?name=LOreal&size=128&background=8B0000&color=ffffff&bold=true&format=png" },
      { name: "CeraVe", description: "Developed with Dermatologists", logoUrl: "https://ui-avatars.com/api/?name=CeraVe&size=128&background=005B94&color=ffffff&bold=true&format=png" },
      { name: "Olaplex", description: "Bond Building Innovation", logoUrl: "https://ui-avatars.com/api/?name=Olaplex&size=128&background=1A1A1A&color=ffffff&bold=true&format=png" },
      { name: "La Roche-Posay", description: "Respect Your Skin", logoUrl: "https://ui-avatars.com/api/?name=LRP&size=128&background=003057&color=ffffff&bold=true&format=png" },
      { name: "MAC", description: "All Ages, All Races, All Sexes", logoUrl: "https://ui-avatars.com/api/?name=MAC&size=128&background=111111&color=ffffff&bold=true&format=png" },
      // Food
      { name: "Nescafe", description: "It All Starts with a Cup", logoUrl: "https://ui-avatars.com/api/?name=Nescafe&size=128&background=CC0000&color=ffffff&bold=true&format=png" },
      { name: "Lindt", description: "Excellence in Chocolate", logoUrl: "https://ui-avatars.com/api/?name=Lindt&size=128&background=8B0000&color=ffffff&bold=true&format=png" },
      { name: "Optimum Nutrition", description: "The World's Best Selling Protein", logoUrl: "https://ui-avatars.com/api/?name=ON&size=128&background=003087&color=ffffff&bold=true&format=png" },
      { name: "KIND", description: "Do the Kind Thing", logoUrl: "https://ui-avatars.com/api/?name=KIND&size=128&background=F7941D&color=ffffff&bold=true&format=png" },
      // Toys
      { name: "LEGO", description: "Play On", logoUrl: "https://ui-avatars.com/api/?name=LEGO&size=128&background=E3000B&color=FFD700&bold=true&format=png" },
      { name: "Hasbro", description: "Making the World Smile", logoUrl: "https://ui-avatars.com/api/?name=Hasbro&size=128&background=E6311A&color=ffffff&bold=true&format=png" },
      { name: "Nintendo", description: "Play. Laugh. Grow.", logoUrl: "https://ui-avatars.com/api/?name=Nintendo&size=128&background=E4000F&color=ffffff&bold=true&format=png" },
    ];
    const brand: Record<string, any> = {};
    for (const b of brandsData) {
      brand[b.name] = (await Brand.create(b))._id;
    }

    // ── 4. Categories ──────────────────────────────────────────────────────
    console.log("📂 Seeding Categories...");
    const categoriesData = [
      { name: "Electronics", code: "ELEC", description: "Gadgets, devices & accessories", icon: IMAGES.ELECTRONICS[0] },
      { name: "Clothing", code: "CLOTH", description: "Men, Women & Kids apparel", icon: IMAGES.CLOTHING[0] },
      { name: "Home & Garden", code: "HOME", description: "Furniture, decor & appliances", icon: IMAGES.HOME[0] },
      { name: "Sports & Gym", code: "SPORT", description: "Equipment, gear & supplements", icon: IMAGES.SPORTS[0] },
      { name: "Beauty & Care", code: "BEAUTY", description: "Skincare, makeup & fragrance", icon: IMAGES.BEAUTY[0] },
      { name: "Food & Drinks", code: "FOOD", description: "Gourmet, organic & specialty foods", icon: IMAGES.FOOD[0] },
      { name: "Toys & Games", code: "TOYS", description: "Educational & fun for all ages", icon: IMAGES.TOYS[0] },
    ];
    const cat: Record<string, any> = {};
    for (const c of categoriesData) {
      cat[c.code] = (await Category.create(c))._id;
    }

    // ── 5. Products ────────────────────────────────────────────────────────
    console.log("📦 Seeding Products...");

    const productsData = [

      // ════════════════════════════════════════════════════════════════════
      //  ELECTRONICS  (12 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "Apple MacBook Pro 14\" M3",
        sku: "SKU-ELEC-001",
        imageUrl: IMAGES.ELECTRONICS[0],
        images: [IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[8], IMAGES.ELECTRONICS[9]],
        description: "Professional performance meets all-day portability.\n• Apple M3 chip — up to 2× faster CPU than M1\n• 14.2\" Liquid Retina XDR display, 1,000 nits sustained brightness\n• Up to 22 hours battery life on a single charge\n• 3× Thunderbolt 4 ports + HDMI 2.1 + SD card slot\n• MagSafe 3 charging, available in Space Black & Silver",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 50,
        costPrice: 1300,
        sellingPrice: 1599,
        options: [
          { name: "RAM", values: ["8GB", "16GB", "24GB"] },
          { name: "Storage", values: ["512GB SSD", "1TB SSD"] },
          { name: "Color", values: ["Space Black", "Silver"] },
        ],
        variants: [
          { variantName: "8GB / 512GB SSD – Space Black", sku: "SKU-ELEC-001-V1", size: "512GB SSD", color: "Space Black", stockQuantity: 15, imageUrl: IMAGES.ELECTRONICS[0], images: [IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[8]] },
          { variantName: "16GB / 512GB SSD – Silver", sku: "SKU-ELEC-001-V2", size: "512GB SSD", color: "Silver", stockQuantity: 15, additionalPrice: 200, imageUrl: IMAGES.ELECTRONICS[0], images: [IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[8]] },
          { variantName: "24GB / 1TB SSD – Space Black", sku: "SKU-ELEC-001-V3", size: "1TB SSD", color: "Space Black", stockQuantity: 10, additionalPrice: 400, imageUrl: IMAGES.ELECTRONICS[0], images: [IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[8]] },
          { variantName: "24GB / 1TB SSD – Silver", sku: "SKU-ELEC-001-V4", size: "1TB SSD", color: "Silver", stockQuantity: 10, additionalPrice: 400, imageUrl: IMAGES.ELECTRONICS[0], images: [IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[8]] },
        ],
      },
      {
        name: "Apple iPhone 15 Pro Max",
        sku: "SKU-ELEC-002",
        imageUrl: IMAGES.ELECTRONICS[1],
        images: [IMAGES.ELECTRONICS[1], IMAGES.ELECTRONICS[2], IMAGES.ELECTRONICS[16]],
        description: "The ultimate iPhone, reengineered in titanium.\n• Grade 5 titanium frame — lighter than stainless steel\n• A17 Pro chip with hardware ray-tracing\n• 48MP Main | 12MP Ultra Wide | 12MP 5× Telephoto camera system\n• USB 3 speeds via USB-C connector\n• Up to 29 hours video playback on a single charge",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 120,
        costPrice: 880,
        sellingPrice: 1199,
        options: [
          { name: "Storage", values: ["256GB", "512GB", "1TB"] },
          { name: "Color", values: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"] },
        ],
        variants: [
          { variantName: "Natural Titanium – 256GB", sku: "SKU-ELEC-002-V1", size: "256GB", color: "Natural Titanium", stockQuantity: 30, imageUrl: IMAGES.ELECTRONICS[1], images: [IMAGES.ELECTRONICS[1], IMAGES.ELECTRONICS[2]] },
          { variantName: "Blue Titanium – 256GB", sku: "SKU-ELEC-002-V2", size: "256GB", color: "Blue Titanium", stockQuantity: 30, imageUrl: IMAGES.ELECTRONICS[1], images: [IMAGES.ELECTRONICS[1], IMAGES.ELECTRONICS[2]] },
          { variantName: "Natural Titanium – 512GB", sku: "SKU-ELEC-002-V3", size: "512GB", color: "Natural Titanium", stockQuantity: 30, additionalPrice: 100, imageUrl: IMAGES.ELECTRONICS[1], images: [IMAGES.ELECTRONICS[1], IMAGES.ELECTRONICS[2]] },
          { variantName: "Black Titanium – 1TB", sku: "SKU-ELEC-002-V4", size: "1TB", color: "Black Titanium", stockQuantity: 30, additionalPrice: 300, imageUrl: IMAGES.ELECTRONICS[1], images: [IMAGES.ELECTRONICS[1], IMAGES.ELECTRONICS[2]] },
        ],
      },
      {
        name: "Apple AirPods Pro (2nd Generation)",
        sku: "SKU-ELEC-003",
        imageUrl: IMAGES.ELECTRONICS[10],
        images: [IMAGES.ELECTRONICS[10], IMAGES.ELECTRONICS[16]],
        description: "Silence the world. Hear what matters.\n• 2× more Active Noise Cancellation than 1st generation\n• Adaptive Audio — intelligently blends Noise Cancellation with Transparency\n• Personalized Spatial Audio with dynamic head tracking\n• Up to 6 hours listening time per charge (30 hrs with case)\n• Sweat and water resistant (IPX4 rated)",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 200,
        costPrice: 155,
        sellingPrice: 249,
        options: [{ name: "Case", values: ["MagSafe Charging Case", "MagSafe Charging Case (USB-C)"] }],
        variants: [
          { variantName: "MagSafe Charging Case", sku: "SKU-ELEC-003-V1", color: "White", stockQuantity: 100, imageUrl: IMAGES.ELECTRONICS[10], images: [IMAGES.ELECTRONICS[10]] },
          { variantName: "MagSafe Charging Case (USB-C)", sku: "SKU-ELEC-003-V2", color: "White", stockQuantity: 100, additionalPrice: 30, imageUrl: IMAGES.ELECTRONICS[10], images: [IMAGES.ELECTRONICS[10]] },
        ],
      },
      {
        name: "Samsung Galaxy S24 Ultra",
        sku: "SKU-ELEC-004",
        imageUrl: IMAGES.ELECTRONICS[3],
        images: [IMAGES.ELECTRONICS[3], IMAGES.ELECTRONICS[16]],
        description: "Galaxy AI is here — built for those who demand the extraordinary.\n• Snapdragon 8 Gen 3 for Galaxy — fastest mobile chip ever\n• 200MP main camera with 100× Space Zoom\n• Built-in titanium S Pen for seamless productivity\n• 6.8\" Dynamic AMOLED 2X display at 1–120Hz adaptive refresh\n• 5,000mAh battery with 45W wired and 15W wireless charging",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Samsung"],
        quantity: 80,
        costPrice: 900,
        sellingPrice: 1299,
        options: [
          { name: "Storage", values: ["256GB", "512GB", "1TB"] },
          { name: "Color", values: ["Titanium Gray", "Titanium Black", "Titanium Violet"] },
        ],
        variants: [
          { variantName: "Titanium Gray – 256GB", sku: "SKU-ELEC-004-V1", size: "256GB", color: "Titanium Gray", stockQuantity: 30, imageUrl: IMAGES.ELECTRONICS[3], images: [IMAGES.ELECTRONICS[3]] },
          { variantName: "Titanium Black – 256GB", sku: "SKU-ELEC-004-V2", size: "256GB", color: "Titanium Black", stockQuantity: 20, imageUrl: IMAGES.ELECTRONICS[3], images: [IMAGES.ELECTRONICS[3]] },
          { variantName: "Titanium Violet – 512GB", sku: "SKU-ELEC-004-V3", size: "512GB", color: "Titanium Violet", stockQuantity: 20, additionalPrice: 120, imageUrl: IMAGES.ELECTRONICS[3], images: [IMAGES.ELECTRONICS[3]] },
          { variantName: "Titanium Black – 1TB", sku: "SKU-ELEC-004-V4", size: "1TB", color: "Titanium Black", stockQuantity: 10, additionalPrice: 240, imageUrl: IMAGES.ELECTRONICS[3], images: [IMAGES.ELECTRONICS[3]] },
        ],
      },
      {
        name: "Sony WH-1000XM5 Wireless Headphones",
        sku: "SKU-ELEC-005",
        imageUrl: IMAGES.ELECTRONICS[4],
        images: [IMAGES.ELECTRONICS[4], IMAGES.ELECTRONICS[16]],
        description: "The gold standard of wireless noise cancellation.\n• Industry-leading ANC powered by 2 processors & 8 microphones\n• Four beamforming mics for crystal-clear call quality\n• 30 hours battery — 3-min quick charge gives 3 hours of playback\n• Ultra-comfortable over-ear design at just 250g\n• Multipoint Bluetooth — connect two devices simultaneously",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Sony"],
        quantity: 90,
        costPrice: 248,
        sellingPrice: 349,
        options: [{ name: "Color", values: ["Black", "Platinum Silver"] }],
        variants: [
          { variantName: "Black", sku: "SKU-ELEC-005-V1", color: "Black", stockQuantity: 50, imageUrl: IMAGES.ELECTRONICS[4], images: [IMAGES.ELECTRONICS[4]] },
          { variantName: "Platinum Silver", sku: "SKU-ELEC-005-V2", color: "Platinum Silver", stockQuantity: 40, imageUrl: IMAGES.ELECTRONICS[4], images: [IMAGES.ELECTRONICS[4]] },
        ],
      },
      {
        name: "Bose QuietComfort 45 Headphones",
        sku: "SKU-ELEC-006",
        imageUrl: IMAGES.ELECTRONICS[4],
        images: [IMAGES.ELECTRONICS[4], IMAGES.ELECTRONICS[16]],
        description: "Bose QuietComfort 45 — engineered for the quietest listening experience.\n• Bose-exclusive Quiet Mode & Aware Mode for total control\n• TriPort acoustic architecture for balanced, immersive sound\n• Up to 24 hours wireless battery life\n• Lightweight, foldable design with plush, cushioned ear cups\n• USB-C charging — 15 minutes gives 3 hours of playback",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Bose"],
        quantity: 60,
        costPrice: 215,
        sellingPrice: 279,
        options: [{ name: "Color", values: ["Triple Black", "White Smoke"] }],
        variants: [
          { variantName: "Triple Black", sku: "SKU-ELEC-006-V1", color: "Black", stockQuantity: 35, imageUrl: IMAGES.ELECTRONICS[4], images: [IMAGES.ELECTRONICS[4]] },
          { variantName: "White Smoke", sku: "SKU-ELEC-006-V2", color: "White", stockQuantity: 25, imageUrl: IMAGES.ELECTRONICS[4], images: [IMAGES.ELECTRONICS[4]] },
        ],
      },
      {
        name: "Dell XPS 15 (9530) Laptop",
        sku: "SKU-ELEC-007",
        imageUrl: IMAGES.ELECTRONICS[8],
        images: [IMAGES.ELECTRONICS[8], IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[9]],
        description: "Power meets portability in the ultimate creator laptop.\n• Intel Core i7-13700H with NVIDIA GeForce RTX 4060 GPU\n• 15.6\" OLED InfinityEdge display — 3.5K resolution, 60Hz\n• 32GB DDR5 RAM + 1TB PCIe NVMe SSD\n• Machined aluminium chassis with CNC-milled palm rest\n• Thunderbolt 4, 86Whr battery with ExpressCharge",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Dell"],
        quantity: 35,
        costPrice: 1350,
        sellingPrice: 1799,
        options: [
          { name: "RAM", values: ["16GB", "32GB"] },
          { name: "Storage", values: ["512GB SSD", "1TB SSD", "2TB SSD"] },
        ],
        variants: [
          { variantName: "i7 / 16GB / 512GB SSD", sku: "SKU-ELEC-007-V1", size: "512GB SSD", color: "Platinum Silver", stockQuantity: 10, imageUrl: IMAGES.ELECTRONICS[8], images: [IMAGES.ELECTRONICS[8]] },
          { variantName: "i7 / 32GB / 1TB SSD", sku: "SKU-ELEC-007-V2", size: "1TB SSD", color: "Platinum Silver", stockQuantity: 15, additionalPrice: 300, imageUrl: IMAGES.ELECTRONICS[8], images: [IMAGES.ELECTRONICS[8]] },
          { variantName: "i9 / 32GB / 2TB SSD", sku: "SKU-ELEC-007-V3", size: "2TB SSD", color: "Platinum Silver", stockQuantity: 10, additionalPrice: 700, imageUrl: IMAGES.ELECTRONICS[8], images: [IMAGES.ELECTRONICS[8]] },
        ],
      },
      {
        name: "Apple iPad Pro 12.9\" M2",
        sku: "SKU-ELEC-008",
        imageUrl: IMAGES.ELECTRONICS[6],
        images: [IMAGES.ELECTRONICS[6], IMAGES.ELECTRONICS[0], IMAGES.ELECTRONICS[16]],
        description: "The thinnest, most powerful iPad ever made.\n• Apple M2 chip — next-level performance for pro apps\n• 12.9\" Liquid Retina XDR display with ProMotion (10–120Hz)\n• 12MP Wide + 10MP Ultra Wide cameras + LiDAR Scanner\n• Wi-Fi 6E, optional 5G Cellular connectivity\n• Compatible with Apple Pencil 2nd Gen and Magic Keyboard",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 60,
        costPrice: 720,
        sellingPrice: 1099,
        options: [
          { name: "Storage", values: ["128GB", "256GB", "512GB", "1TB"] },
          { name: "Connectivity", values: ["Wi-Fi", "Wi-Fi + Cellular"] },
        ],
        variants: [
          { variantName: "128GB – Wi-Fi – Space Gray", sku: "SKU-ELEC-008-V1", size: "128GB", color: "Space Gray", stockQuantity: 20, imageUrl: IMAGES.ELECTRONICS[6], images: [IMAGES.ELECTRONICS[6]] },
          { variantName: "256GB – Wi-Fi – Silver", sku: "SKU-ELEC-008-V2", size: "256GB", color: "Silver", stockQuantity: 20, additionalPrice: 100, imageUrl: IMAGES.ELECTRONICS[6], images: [IMAGES.ELECTRONICS[6]] },
          { variantName: "512GB – Wi-Fi + Cellular – Space Gray", sku: "SKU-ELEC-008-V3", size: "512GB", color: "Space Gray", stockQuantity: 20, additionalPrice: 350, imageUrl: IMAGES.ELECTRONICS[6], images: [IMAGES.ELECTRONICS[6]] },
        ],
      },
      {
        name: "Apple Watch Series 9 (GPS)",
        sku: "SKU-ELEC-009",
        imageUrl: IMAGES.ELECTRONICS[7],
        images: [IMAGES.ELECTRONICS[7], IMAGES.ELECTRONICS[16]],
        description: "Your most powerful health companion yet.\n• S9 SiP chip — 60% faster on-device machine learning\n• Double Tap gesture for one-handed control\n• Blood Oxygen + ECG + temperature sensing for cycle tracking\n• Crash Detection & Emergency SOS with satellite\n• Up to 18 hours battery life (36 hrs in Low Power Mode)",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Apple"],
        quantity: 100,
        costPrice: 318,
        sellingPrice: 399,
        options: [
          { name: "Size", values: ["41mm", "45mm"] },
          { name: "Color", values: ["Midnight", "Starlight", "Pink", "Product Red"] },
        ],
        variants: [
          { variantName: "Midnight – 41mm", sku: "SKU-ELEC-009-V1", size: "41mm", color: "Midnight", stockQuantity: 25, imageUrl: IMAGES.ELECTRONICS[7], images: [IMAGES.ELECTRONICS[7]] },
          { variantName: "Starlight – 41mm", sku: "SKU-ELEC-009-V2", size: "41mm", color: "Starlight", stockQuantity: 25, imageUrl: IMAGES.ELECTRONICS[7], images: [IMAGES.ELECTRONICS[7]] },
          { variantName: "Midnight – 45mm", sku: "SKU-ELEC-009-V3", size: "45mm", color: "Midnight", stockQuantity: 25, additionalPrice: 30, imageUrl: IMAGES.ELECTRONICS[7], images: [IMAGES.ELECTRONICS[7]] },
          { variantName: "Product Red – 45mm", sku: "SKU-ELEC-009-V4", size: "45mm", color: "Product Red", stockQuantity: 25, additionalPrice: 30, imageUrl: IMAGES.ELECTRONICS[7], images: [IMAGES.ELECTRONICS[7]] },
        ],
      },
      {
        name: "LG OLED C3 65\" 4K Smart TV",
        sku: "SKU-ELEC-010",
        imageUrl: IMAGES.ELECTRONICS[14],
        images: [IMAGES.ELECTRONICS[14], IMAGES.ELECTRONICS[16]],
        description: "Perfect picture. Zero compromises.\n• OLED evo panel — 8 million self-lit pixels for perfect blacks\n• α9 AI Processor Gen6 for cinema-quality upscaling\n• 120Hz native refresh rate for buttery-smooth gaming\n• HDMI 2.1 with G-Sync & FreeSync Premium Pro support\n• webOS 23 smart platform with ThinQ AI voice control",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["LG"],
        quantity: 25,
        costPrice: 1000,
        sellingPrice: 1499,
        options: [{ name: "Screen Size", values: ["55\"", "65\"", "77\""] }],
        variants: [
          { variantName: "55 inch", sku: "SKU-ELEC-010-V1", color: "Black", stockQuantity: 10, imageUrl: IMAGES.ELECTRONICS[14], images: [IMAGES.ELECTRONICS[14]] },
          { variantName: "65 inch", sku: "SKU-ELEC-010-V2", color: "Black", stockQuantity: 10, additionalPrice: 500, imageUrl: IMAGES.ELECTRONICS[14], images: [IMAGES.ELECTRONICS[14]] },
          { variantName: "77 inch", sku: "SKU-ELEC-010-V3", color: "Black", stockQuantity: 5, additionalPrice: 1200, imageUrl: IMAGES.ELECTRONICS[14], images: [IMAGES.ELECTRONICS[14]] },
        ],
      },
      {
        name: "Logitech MX Master 3S Mouse",
        sku: "SKU-ELEC-011",
        imageUrl: IMAGES.ELECTRONICS[12],
        images: [IMAGES.ELECTRONICS[12], IMAGES.ELECTRONICS[9], IMAGES.ELECTRONICS[16]],
        description: "The master of all mice — built for creators and power users.\n• 8,000 DPI high-precision sensor — works on any surface, even glass\n• MagSpeed electromagnetic scroll wheel — 1,000 lines/second\n• Silent clicking — 70% less noise than standard mice\n• App-specific customization with Logi Options+\n• Connect up to 3 devices via Bluetooth or Logi Bolt USB receiver",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["Logitech"],
        quantity: 120,
        costPrice: 75,
        sellingPrice: 99,
        options: [{ name: "Color", values: ["Graphite", "Pale Gray"] }],
        variants: [
          { variantName: "Graphite", sku: "SKU-ELEC-011-V1", color: "Graphite", stockQuantity: 70, imageUrl: IMAGES.ELECTRONICS[12], images: [IMAGES.ELECTRONICS[12]] },
          { variantName: "Pale Gray", sku: "SKU-ELEC-011-V2", color: "White", stockQuantity: 50, imageUrl: IMAGES.ELECTRONICS[12], images: [IMAGES.ELECTRONICS[12]] },
        ],
      },
      {
        name: "GoPro HERO12 Black",
        sku: "SKU-ELEC-012",
        imageUrl: IMAGES.ELECTRONICS[11],
        images: [IMAGES.ELECTRONICS[11], IMAGES.ELECTRONICS[16]],
        description: "Go further. Capture everything. Fear nothing.\n• 5.3K60 video + 27MP photos with 10× linear zoom\n• HyperSmooth 6.0 — smoothest stabilization ever in a GoPro\n• 360° Horizon Lock — perfectly level footage at any angle\n• Waterproof to 10m without a case — ideal for any adventure\n• Up to 70 min battery life with the Enduro Battery included",
        category: cat["ELEC"],
        supplier: sup["Global Tech Supplies"],
        brand: brand["GoPro"],
        quantity: 55,
        costPrice: 320,
        sellingPrice: 399,
        options: [{ name: "Bundle", values: ["Camera Only", "Camera + 64GB SD + Mounting Kit"] }],
        variants: [
          { variantName: "Camera Only", sku: "SKU-ELEC-012-V1", color: "Black", stockQuantity: 30, imageUrl: IMAGES.ELECTRONICS[11], images: [IMAGES.ELECTRONICS[11]] },
          { variantName: "Camera + 64GB SD + Mounting Kit", sku: "SKU-ELEC-012-V2", color: "Black", stockQuantity: 25, additionalPrice: 50, imageUrl: IMAGES.ELECTRONICS[11], images: [IMAGES.ELECTRONICS[11]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  CLOTHING  (12 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "Nike Air Force 1 '07",
        sku: "SKU-CLOTH-001",
        imageUrl: IMAGES.CLOTHING[1],
        images: [IMAGES.CLOTHING[1], IMAGES.CLOTHING[0], IMAGES.CLOTHING[12]],
        description: "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on what you know best: durable stitched overlays, a crisp leather upper, and cushioning for comfort that lasts all day. A perforated toe box and pivot circle rubber outsole complete this timeless silhouette.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 250,
        costPrice: 65,
        sellingPrice: 110,
        options: [
          { name: "Size", values: ["US 7", "US 8", "US 9", "US 10", "US 11"] },
          { name: "Color", values: ["Triple White", "Black/Black"] },
        ],
        variants: [
          { variantName: "Triple White – US 7", sku: "SKU-CLOTH-001-V1", size: "US 7", color: "White", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
          { variantName: "Triple White – US 8", sku: "SKU-CLOTH-001-V2", size: "US 8", color: "White", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
          { variantName: "Triple White – US 9", sku: "SKU-CLOTH-001-V3", size: "US 9", color: "White", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
          { variantName: "Triple White – US 10", sku: "SKU-CLOTH-001-V4", size: "US 10", color: "White", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
          { variantName: "Black/Black – US 9", sku: "SKU-CLOTH-001-V5", size: "US 9", color: "Black", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
          { variantName: "Black/Black – US 10", sku: "SKU-CLOTH-001-V6", size: "US 10", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[1], images: [IMAGES.CLOTHING[1]] },
        ],
      },
      {
        name: "Nike Tech Fleece Full-Zip Hoodie",
        sku: "SKU-CLOTH-002",
        imageUrl: IMAGES.CLOTHING[2],
        images: [IMAGES.CLOTHING[2], IMAGES.CLOTHING[13]],
        description: "Nike Tech Fleece combines cotton with a unique spacer fabric to provide the warmth you need without adding bulk. The bonded edges give it a sleek look while the ribbed cuffs keep the cold out. Full-zip design for easy on/off, with pockets on both sides and along the hood.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 160,
        costPrice: 55,
        sellingPrice: 110,
        options: [
          { name: "Size", values: ["XS", "S", "M", "L", "XL", "XXL"] },
          { name: "Color", values: ["Carbon Heather", "Black/Black", "Dark Navy"] },
        ],
        variants: [
          { variantName: "Carbon Heather – S", sku: "SKU-CLOTH-002-V1", size: "S", color: "Gray", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[2], images: [IMAGES.CLOTHING[2]] },
          { variantName: "Carbon Heather – M", sku: "SKU-CLOTH-002-V2", size: "M", color: "Gray", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[2], images: [IMAGES.CLOTHING[2]] },
          { variantName: "Carbon Heather – L", sku: "SKU-CLOTH-002-V3", size: "L", color: "Gray", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[2], images: [IMAGES.CLOTHING[2]] },
          { variantName: "Black/Black – M", sku: "SKU-CLOTH-002-V4", size: "M", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[2], images: [IMAGES.CLOTHING[2]] },
          { variantName: "Black/Black – L", sku: "SKU-CLOTH-002-V5", size: "L", color: "Black", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[2], images: [IMAGES.CLOTHING[2]] },
        ],
      },
      {
        name: "Nike Dri-FIT Training T-Shirt",
        sku: "SKU-CLOTH-003",
        imageUrl: IMAGES.CLOTHING[4],
        images: [IMAGES.CLOTHING[4], IMAGES.CLOTHING[13]],
        description: "Stay dry during your toughest workouts. Nike Dri-FIT technology moves sweat away from your skin for quicker evaporation, keeping you dry and comfortable. Raglan sleeves allow a full range of motion; drop-tail hem offers extra coverage during training.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 300,
        costPrice: 18,
        sellingPrice: 35,
        options: [
          { name: "Size", values: ["S", "M", "L", "XL"] },
          { name: "Color", values: ["Black", "White", "Navy", "Gray"] },
        ],
        variants: [
          { variantName: "Black – M", sku: "SKU-CLOTH-003-V1", size: "M", color: "Black", stockQuantity: 80, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "Black – L", sku: "SKU-CLOTH-003-V2", size: "L", color: "Black", stockQuantity: 80, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "White – M", sku: "SKU-CLOTH-003-V3", size: "M", color: "White", stockQuantity: 70, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "Navy – L", sku: "SKU-CLOTH-003-V4", size: "L", color: "Navy", stockQuantity: 70, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
        ],
      },
      {
        name: "Adidas Ultraboost 23 Running Shoes",
        sku: "SKU-CLOTH-004",
        imageUrl: IMAGES.CLOTHING[6],
        images: [IMAGES.CLOTHING[6], IMAGES.CLOTHING[0], IMAGES.CLOTHING[12]],
        description: "Made with a Primeknit+ upper and a full-length Boost midsole for extraordinary energy return. The Linear Energy Push system propels you forward, and a Continental™ Rubber outsole gives you reliable grip on wet and dry surfaces. Recycled materials used throughout.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 140,
        costPrice: 100,
        sellingPrice: 190,
        options: [
          { name: "Size", values: ["US 7", "US 8", "US 9", "US 10", "US 11"] },
          { name: "Color", values: ["Core Black", "Cloud White", "Wonder Steel"] },
        ],
        variants: [
          { variantName: "Core Black – US 8", sku: "SKU-CLOTH-004-V1", size: "US 8", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[6], images: [IMAGES.CLOTHING[6]] },
          { variantName: "Core Black – US 9", sku: "SKU-CLOTH-004-V2", size: "US 9", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[6], images: [IMAGES.CLOTHING[6]] },
          { variantName: "Core Black – US 10", sku: "SKU-CLOTH-004-V3", size: "US 10", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[6], images: [IMAGES.CLOTHING[6]] },
          { variantName: "Cloud White – US 9", sku: "SKU-CLOTH-004-V4", size: "US 9", color: "White", stockQuantity: 25, imageUrl: IMAGES.CLOTHING[6], images: [IMAGES.CLOTHING[6]] },
          { variantName: "Wonder Steel – US 10", sku: "SKU-CLOTH-004-V5", size: "US 10", color: "Gray", stockQuantity: 25, imageUrl: IMAGES.CLOTHING[6], images: [IMAGES.CLOTHING[6]] },
        ],
      },
      {
        name: "Adidas Tiro 23 Track Jacket",
        sku: "SKU-CLOTH-005",
        imageUrl: IMAGES.CLOTHING[5],
        images: [IMAGES.CLOTHING[5], IMAGES.CLOTHING[13]],
        description: "A classic training jacket with a modern cut. Recycled polyester fabric with moisture-absorbing AEROREADY technology keeps you dry during warm-ups. Classic 3-Stripes down the arms, full-zip with a collar, and two side pockets.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 120,
        costPrice: 35,
        sellingPrice: 70,
        options: [
          { name: "Size", values: ["S", "M", "L", "XL"] },
          { name: "Color", values: ["Black/White", "Team Navy Blue", "Dark Gray"] },
        ],
        variants: [
          { variantName: "Black/White – M", sku: "SKU-CLOTH-005-V1", size: "M", color: "Black", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Black/White – L", sku: "SKU-CLOTH-005-V2", size: "L", color: "Black", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Team Navy Blue – M", sku: "SKU-CLOTH-005-V3", size: "M", color: "Navy", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Team Navy Blue – L", sku: "SKU-CLOTH-005-V4", size: "L", color: "Navy", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
        ],
      },
      {
        name: "Levi's 501 Original Fit Jeans",
        sku: "SKU-CLOTH-006",
        imageUrl: IMAGES.CLOTHING[3],
        images: [IMAGES.CLOTHING[3], IMAGES.CLOTHING[13]],
        description: "The original jean since 1873. Straight fit that sits at the waist. A button fly, slight taper below the knee, and rigid 12-oz denim fabric give this style an authentic, timeless look. Made with responsibly sourced cotton through the Better Cotton Initiative.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Levis"],
        quantity: 200,
        costPrice: 38,
        sellingPrice: 79,
        options: [
          { name: "Size", values: ["28×30", "30×30", "30×32", "32×32", "34×32", "36×32"] },
          { name: "Color", values: ["Medium Stonewash", "Dark Rinse", "Light Indigo"] },
        ],
        variants: [
          { variantName: "Medium Stonewash – 30×32", sku: "SKU-CLOTH-006-V1", size: "30×32", color: "Medium Blue", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[3], images: [IMAGES.CLOTHING[3]] },
          { variantName: "Medium Stonewash – 32×32", sku: "SKU-CLOTH-006-V2", size: "32×32", color: "Medium Blue", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[3], images: [IMAGES.CLOTHING[3]] },
          { variantName: "Dark Rinse – 30×32", sku: "SKU-CLOTH-006-V3", size: "30×32", color: "Dark Blue", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[3], images: [IMAGES.CLOTHING[3]] },
          { variantName: "Dark Rinse – 34×32", sku: "SKU-CLOTH-006-V4", size: "34×32", color: "Dark Blue", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[3], images: [IMAGES.CLOTHING[3]] },
        ],
      },
      {
        name: "New Balance 990v6 Running Shoes",
        sku: "SKU-CLOTH-007",
        imageUrl: IMAGES.CLOTHING[12],
        images: [IMAGES.CLOTHING[12], IMAGES.CLOTHING[0]],
        description: "The 990v6 is the latest evolution of New Balance's legendary 990 series, made in USA. Features premium pigskin suede and mesh upper, ENCAP midsole with dual-density foam and polyurethane rim, and a blown rubber outsole for durability and cushioning.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["New Balance"],
        quantity: 90,
        costPrice: 115,
        sellingPrice: 175,
        options: [
          { name: "Size", values: ["US 7", "US 8", "US 9", "US 10", "US 11"] },
          { name: "Color", values: ["Grey", "Navy", "Marblehead"] },
        ],
        variants: [
          { variantName: "Grey – US 8", sku: "SKU-CLOTH-007-V1", size: "US 8", color: "Gray", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[12], images: [IMAGES.CLOTHING[12]] },
          { variantName: "Grey – US 9", sku: "SKU-CLOTH-007-V2", size: "US 9", color: "Gray", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[12], images: [IMAGES.CLOTHING[12]] },
          { variantName: "Grey – US 10", sku: "SKU-CLOTH-007-V3", size: "US 10", color: "Gray", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[12], images: [IMAGES.CLOTHING[12]] },
          { variantName: "Navy – US 9", sku: "SKU-CLOTH-007-V4", size: "US 9", color: "Navy", stockQuantity: 15, imageUrl: IMAGES.CLOTHING[12], images: [IMAGES.CLOTHING[12]] },
          { variantName: "Navy – US 10", sku: "SKU-CLOTH-007-V5", size: "US 10", color: "Navy", stockQuantity: 15, imageUrl: IMAGES.CLOTHING[12], images: [IMAGES.CLOTHING[12]] },
        ],
      },
      {
        name: "Under Armour HeatGear Compression Leggings",
        sku: "SKU-CLOTH-008",
        imageUrl: IMAGES.CLOTHING[8],
        images: [IMAGES.CLOTHING[8], IMAGES.CLOTHING[13]],
        description: "UA HeatGear fabric is ultra-light and breathable for hot weather performance. 4-way stretch construction moves in every direction for unrestricted motion. Anti-odor technology keeps gear fresh. Wide elastic waistband with internal drawcord provides a secure fit during high-intensity workouts.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Under Armour"],
        quantity: 180,
        costPrice: 30,
        sellingPrice: 60,
        options: [
          { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
          { name: "Color", values: ["Black", "Midnight Navy", "Versa Blue"] },
        ],
        variants: [
          { variantName: "Black – S", sku: "SKU-CLOTH-008-V1", size: "S", color: "Black", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[8], images: [IMAGES.CLOTHING[8]] },
          { variantName: "Black – M", sku: "SKU-CLOTH-008-V2", size: "M", color: "Black", stockQuantity: 50, imageUrl: IMAGES.CLOTHING[8], images: [IMAGES.CLOTHING[8]] },
          { variantName: "Midnight Navy – M", sku: "SKU-CLOTH-008-V3", size: "M", color: "Navy", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[8], images: [IMAGES.CLOTHING[8]] },
          { variantName: "Versa Blue – L", sku: "SKU-CLOTH-008-V4", size: "L", color: "Blue", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[8], images: [IMAGES.CLOTHING[8]] },
        ],
      },
      {
        name: "Columbia Watertight II Rain Jacket",
        sku: "SKU-CLOTH-009",
        imageUrl: IMAGES.CLOTHING[14],
        images: [IMAGES.CLOTHING[14], IMAGES.CLOTHING[5]],
        description: "The Columbia Watertight II is a versatile rain jacket featuring Omni-Tech waterproof/breathable technology and critically taped seams to keep rain out. Adjustable hood, underarm venting for airflow, and lightweight packability. Perfect for travel and everyday use.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Columbia"],
        quantity: 100,
        costPrice: 55,
        sellingPrice: 105,
        options: [
          { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
          { name: "Color", values: ["Black", "Mountain Red", "Dark Moss"] },
        ],
        variants: [
          { variantName: "Black – M", sku: "SKU-CLOTH-009-V1", size: "M", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[14], images: [IMAGES.CLOTHING[14]] },
          { variantName: "Black – L", sku: "SKU-CLOTH-009-V2", size: "L", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[14], images: [IMAGES.CLOTHING[14]] },
          { variantName: "Mountain Red – M", sku: "SKU-CLOTH-009-V3", size: "M", color: "Red", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[14], images: [IMAGES.CLOTHING[14]] },
          { variantName: "Dark Moss – L", sku: "SKU-CLOTH-009-V4", size: "L", color: "Green", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[14], images: [IMAGES.CLOTHING[14]] },
        ],
      },
      {
        name: "Adidas Originals Samba OG Sneakers",
        sku: "SKU-CLOTH-010",
        imageUrl: IMAGES.CLOTHING[0],
        images: [IMAGES.CLOTHING[0], IMAGES.CLOTHING[6]],
        description: "A true icon since 1950. The Samba OG was born on hard icy pitches and has since become a street style staple. Features a soft nubuck and leather upper, contrasting suede T-toe overlay, gum rubber outsole, and signature Samba branding. Lightweight EVA midsole.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Adidas"],
        quantity: 150,
        costPrice: 65,
        sellingPrice: 100,
        options: [
          { name: "Size", values: ["US 7", "US 8", "US 9", "US 10", "US 11"] },
          { name: "Color", values: ["Cloud White/Black", "Core Black/White", "Shadow Olive"] },
        ],
        variants: [
          { variantName: "Cloud White/Black – US 8", sku: "SKU-CLOTH-010-V1", size: "US 8", color: "White", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[0], images: [IMAGES.CLOTHING[0]] },
          { variantName: "Cloud White/Black – US 9", sku: "SKU-CLOTH-010-V2", size: "US 9", color: "White", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[0], images: [IMAGES.CLOTHING[0]] },
          { variantName: "Core Black/White – US 9", sku: "SKU-CLOTH-010-V3", size: "US 9", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[0], images: [IMAGES.CLOTHING[0]] },
          { variantName: "Core Black/White – US 10", sku: "SKU-CLOTH-010-V4", size: "US 10", color: "Black", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[0], images: [IMAGES.CLOTHING[0]] },
          { variantName: "Shadow Olive – US 9", sku: "SKU-CLOTH-010-V5", size: "US 9", color: "Olive", stockQuantity: 30, imageUrl: IMAGES.CLOTHING[0], images: [IMAGES.CLOTHING[0]] },
        ],
      },
      {
        name: "Nike Pro Dri-FIT Shorts (9\")",
        sku: "SKU-CLOTH-011",
        imageUrl: IMAGES.CLOTHING[4],
        images: [IMAGES.CLOTHING[4], IMAGES.CLOTHING[13]],
        description: "Nike Pro Dri-FIT Shorts are made with sweat-wicking fabric to keep you dry during training. 9\" inseam with an elastic waistband and internal drawcord. Side pockets, back zip pocket for secure storage. Made with at least 75% recycled polyester fibers.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Nike"],
        quantity: 200,
        costPrice: 22,
        sellingPrice: 45,
        options: [
          { name: "Size", values: ["S", "M", "L", "XL"] },
          { name: "Color", values: ["Black", "Dark Gray", "Navy"] },
        ],
        variants: [
          { variantName: "Black – M", sku: "SKU-CLOTH-011-V1", size: "M", color: "Black", stockQuantity: 60, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "Black – L", sku: "SKU-CLOTH-011-V2", size: "L", color: "Black", stockQuantity: 60, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "Dark Gray – M", sku: "SKU-CLOTH-011-V3", size: "M", color: "Gray", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
          { variantName: "Navy – L", sku: "SKU-CLOTH-011-V4", size: "L", color: "Navy", stockQuantity: 40, imageUrl: IMAGES.CLOTHING[4], images: [IMAGES.CLOTHING[4]] },
        ],
      },
      {
        name: "Levi's Sherpa Trucker Jacket",
        sku: "SKU-CLOTH-012",
        imageUrl: IMAGES.CLOTHING[5],
        images: [IMAGES.CLOTHING[5], IMAGES.CLOTHING[3]],
        description: "The Levi's Trucker Jacket is updated with a cozy Sherpa lining for warmth. Features our iconic trucker jacket silhouette: point collar, adjustable button cuffs, chest and side pockets, and signature Levi's branding. Rigid denim exterior with cloud-soft sherpa interior.",
        category: cat["CLOTH"],
        supplier: sup["Fashion Forward Inc"],
        brand: brand["Levis"],
        quantity: 80,
        costPrice: 75,
        sellingPrice: 148,
        options: [
          { name: "Size", values: ["S", "M", "L", "XL"] },
          { name: "Color", values: ["Medium Wash", "Dark Indigo"] },
        ],
        variants: [
          { variantName: "Medium Wash – M", sku: "SKU-CLOTH-012-V1", size: "M", color: "Medium Blue", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Medium Wash – L", sku: "SKU-CLOTH-012-V2", size: "L", color: "Medium Blue", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Dark Indigo – M", sku: "SKU-CLOTH-012-V3", size: "M", color: "Dark Blue", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
          { variantName: "Dark Indigo – L", sku: "SKU-CLOTH-012-V4", size: "L", color: "Dark Blue", stockQuantity: 20, imageUrl: IMAGES.CLOTHING[5], images: [IMAGES.CLOTHING[5]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  HOME & GARDEN  (11 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "IKEA POÄNG Armchair",
        sku: "SKU-HOME-001",
        imageUrl: IMAGES.HOME[0],
        images: [IMAGES.HOME[0], IMAGES.HOME[1], IMAGES.HOME[13]],
        description: "The POÄNG armchair has a timeless design with a bent birch frame that gives it a slight bounce, making it both comfortable and durable. The frame is made from layer-glued bent birch and the removable cover is easy to wash. Available in multiple cushion colours.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 60,
        costPrice: 130,
        sellingPrice: 229,
        options: [{ name: "Cushion Color", values: ["Knisa Light Beige", "Knisa Light Gray", "Hillared Dark Blue"] }],
        variants: [
          { variantName: "Knisa Light Beige", sku: "SKU-HOME-001-V1", color: "Beige", stockQuantity: 20, imageUrl: IMAGES.HOME[0], images: [IMAGES.HOME[0]] },
          { variantName: "Knisa Light Gray", sku: "SKU-HOME-001-V2", color: "Gray", stockQuantity: 20, imageUrl: IMAGES.HOME[0], images: [IMAGES.HOME[0]] },
          { variantName: "Hillared Dark Blue", sku: "SKU-HOME-001-V3", color: "Blue", stockQuantity: 20, imageUrl: IMAGES.HOME[0], images: [IMAGES.HOME[0]] },
        ],
      },
      {
        name: "IKEA KALLAX 4×4 Shelf Unit",
        sku: "SKU-HOME-002",
        imageUrl: IMAGES.HOME[1],
        images: [IMAGES.HOME[1], IMAGES.HOME[0]],
        description: "The KALLAX series is versatile, sturdy, and easy to adapt. Use it as a room divider, TV stand, or bookcase. 4×4 configuration with 16 open compartments. Compatible with KALLAX inserts, baskets, and boxes (sold separately). Fits vinyl records, books, and display items.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 40,
        costPrice: 120,
        sellingPrice: 229,
        options: [{ name: "Color", values: ["White", "Black-Brown", "Oak Effect"] }],
        variants: [
          { variantName: "White", sku: "SKU-HOME-002-V1", color: "White", stockQuantity: 15, imageUrl: IMAGES.HOME[1], images: [IMAGES.HOME[1]] },
          { variantName: "Black-Brown", sku: "SKU-HOME-002-V2", color: "Black", stockQuantity: 15, imageUrl: IMAGES.HOME[1], images: [IMAGES.HOME[1]] },
          { variantName: "Oak Effect", sku: "SKU-HOME-002-V3", color: "Brown", stockQuantity: 10, imageUrl: IMAGES.HOME[1], images: [IMAGES.HOME[1]] },
        ],
      },
      {
        name: "Dyson V15 Detect Cordless Vacuum",
        sku: "SKU-HOME-003",
        imageUrl: IMAGES.HOME[5],
        images: [IMAGES.HOME[5], IMAGES.HOME[3]],
        description: "The Dyson V15 Detect uses a laser to reveal microscopic dust on hard floors. An acoustic piezo sensor automatically counts and sizes particles, displaying results on the LCD screen. Up to 60 minutes of fade-free suction with 230 AW max suction. Includes 11 attachments.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["Dyson"],
        quantity: 35,
        costPrice: 480,
        sellingPrice: 749,
        options: [{ name: "Color", values: ["Yellow/Nickel", "Submarine (Blue/Copper)"] }],
        variants: [
          { variantName: "Yellow/Nickel", sku: "SKU-HOME-003-V1", color: "Yellow", stockQuantity: 20, imageUrl: IMAGES.HOME[5], images: [IMAGES.HOME[5]] },
          { variantName: "Submarine Blue/Copper", sku: "SKU-HOME-003-V2", color: "Blue", stockQuantity: 15, additionalPrice: 50, imageUrl: IMAGES.HOME[5], images: [IMAGES.HOME[5]] },
        ],
      },
      {
        name: "KitchenAid Artisan Series 5-Qt Stand Mixer",
        sku: "SKU-HOME-004",
        imageUrl: IMAGES.HOME[10],
        images: [IMAGES.HOME[10], IMAGES.HOME[3]],
        description: "The iconic KitchenAid Artisan Stand Mixer with a 5-quart stainless steel bowl, 10 speeds, and the power hub to turn the mixer into a culinary centre. Includes flat beater, dough hook, and wire whip. More than 80 available optional attachments. Tilt-head design for easy access.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["KitchenAid"],
        quantity: 40,
        costPrice: 280,
        sellingPrice: 449,
        options: [{ name: "Color", values: ["Empire Red", "Ice Blue", "Onyx Black", "Contour Silver"] }],
        variants: [
          { variantName: "Empire Red", sku: "SKU-HOME-004-V1", color: "Red", stockQuantity: 10, imageUrl: IMAGES.HOME[10], images: [IMAGES.HOME[10]] },
          { variantName: "Ice Blue", sku: "SKU-HOME-004-V2", color: "Blue", stockQuantity: 10, imageUrl: IMAGES.HOME[10], images: [IMAGES.HOME[10]] },
          { variantName: "Onyx Black", sku: "SKU-HOME-004-V3", color: "Black", stockQuantity: 10, imageUrl: IMAGES.HOME[10], images: [IMAGES.HOME[10]] },
          { variantName: "Contour Silver", sku: "SKU-HOME-004-V4", color: "Silver", stockQuantity: 10, imageUrl: IMAGES.HOME[10], images: [IMAGES.HOME[10]] },
        ],
      },
      {
        name: "Philips Hue White & Color Ambiance Starter Kit",
        sku: "SKU-HOME-005",
        imageUrl: IMAGES.HOME[11],
        images: [IMAGES.HOME[11], IMAGES.HOME[3]],
        description: "Transform your home with 16 million colors and warm-to-cool white light (2000K–6500K). The Starter Kit includes 4× A19 E26 smart bulbs and a Hue Bridge (required for remote access and advanced automations). Works with Alexa, Google Assistant, and Apple HomeKit. Up to 1100 lumens per bulb.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["Philips"],
        quantity: 60,
        costPrice: 140,
        sellingPrice: 199,
        options: [{ name: "Bundle", values: ["4-Bulb Starter Kit", "3-Bulb Starter Kit"] }],
        variants: [
          { variantName: "4-Bulb Starter Kit", sku: "SKU-HOME-005-V1", color: "White", stockQuantity: 40, imageUrl: IMAGES.HOME[11], images: [IMAGES.HOME[11]] },
          { variantName: "3-Bulb Starter Kit", sku: "SKU-HOME-005-V2", color: "White", stockQuantity: 20, additionalPrice: -30, imageUrl: IMAGES.HOME[11], images: [IMAGES.HOME[11]] },
        ],
      },
      {
        name: "Instant Pot Duo 7-in-1 Electric Pressure Cooker (8 Qt)",
        sku: "SKU-HOME-006",
        imageUrl: IMAGES.HOME[14],
        images: [IMAGES.HOME[14], IMAGES.HOME[3]],
        description: "The world's #1 selling multi-cooker. 7 appliances in one: pressure cooker, slow cooker, rice cooker, steamer, sauté pan, yogurt maker, and warmer. 13 one-touch smart programs. Stainless steel inner pot. UL certified, 10+ safety features. 8-quart feeds families of 6–8.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["Instant Pot"],
        quantity: 70,
        costPrice: 80,
        sellingPrice: 129,
        options: [{ name: "Capacity", values: ["3 Quart", "6 Quart", "8 Quart"] }],
        variants: [
          { variantName: "3 Quart", sku: "SKU-HOME-006-V1", color: "Stainless Steel", stockQuantity: 20, additionalPrice: -20, imageUrl: IMAGES.HOME[14], images: [IMAGES.HOME[14]] },
          { variantName: "6 Quart", sku: "SKU-HOME-006-V2", color: "Stainless Steel", stockQuantity: 30, imageUrl: IMAGES.HOME[14], images: [IMAGES.HOME[14]] },
          { variantName: "8 Quart", sku: "SKU-HOME-006-V3", color: "Stainless Steel", stockQuantity: 20, additionalPrice: 30, imageUrl: IMAGES.HOME[14], images: [IMAGES.HOME[14]] },
        ],
      },
      {
        name: "Nespresso Vertuo Next Coffee Machine",
        sku: "SKU-HOME-007",
        imageUrl: IMAGES.HOME[6],
        images: [IMAGES.HOME[6], IMAGES.HOME[3]],
        description: "Brew 5 cup sizes from espresso (40ml) to Alto XL (414ml) with one machine. Centrifusion technology spins capsules up to 7,000 RPM. 27-second heat up, 90-second auto-off, and the environmentally friendly Recycling Program. 1.1L removable water tank.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["Nescafe"],
        quantity: 55,
        costPrice: 130,
        sellingPrice: 199,
        options: [{ name: "Color", values: ["Matte Black", "Cherry Red", "Glacier White"] }],
        variants: [
          { variantName: "Matte Black", sku: "SKU-HOME-007-V1", color: "Black", stockQuantity: 25, imageUrl: IMAGES.HOME[6], images: [IMAGES.HOME[6]] },
          { variantName: "Cherry Red", sku: "SKU-HOME-007-V2", color: "Red", stockQuantity: 15, imageUrl: IMAGES.HOME[6], images: [IMAGES.HOME[6]] },
          { variantName: "Glacier White", sku: "SKU-HOME-007-V3", color: "White", stockQuantity: 15, imageUrl: IMAGES.HOME[6], images: [IMAGES.HOME[6]] },
        ],
      },
      {
        name: "Scandinavian Arc Floor Lamp",
        sku: "SKU-HOME-008",
        imageUrl: IMAGES.HOME[2],
        images: [IMAGES.HOME[2], IMAGES.HOME[0]],
        description: "Minimalist arc floor lamp with a marble weighted base and adjustable articulating head. Includes a linen drum shade for warm, diffused light. Compatible with E26 bulbs up to 60W (or LED equivalent). Height: 155cm. Perfect for reading nooks and living rooms.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 45,
        costPrice: 75,
        sellingPrice: 149,
        options: [{ name: "Shade Color", values: ["Natural Linen", "White", "Black"] }],
        variants: [
          { variantName: "Natural Linen", sku: "SKU-HOME-008-V1", color: "Beige", stockQuantity: 20, imageUrl: IMAGES.HOME[2], images: [IMAGES.HOME[2]] },
          { variantName: "White", sku: "SKU-HOME-008-V2", color: "White", stockQuantity: 15, imageUrl: IMAGES.HOME[2], images: [IMAGES.HOME[2]] },
          { variantName: "Black", sku: "SKU-HOME-008-V3", color: "Black", stockQuantity: 10, imageUrl: IMAGES.HOME[2], images: [IMAGES.HOME[2]] },
        ],
      },
      {
        name: "Luxury Hotel Collection Duvet (King)",
        sku: "SKU-HOME-009",
        imageUrl: IMAGES.HOME[9],
        images: [IMAGES.HOME[9], IMAGES.HOME[4]],
        description: "Hotel-quality 100% cotton duvet with 600-thread-count sateen shell and 650-fill-power white goose down filling. Medium warmth, machine washable. Baffle-box construction prevents fill from shifting. King size: 230×220cm. Includes storage bag.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 40,
        costPrice: 100,
        sellingPrice: 199,
        options: [
          { name: "Size", values: ["Twin", "Full/Queen", "King"] },
          { name: "Warmth", values: ["Light", "Medium", "Extra Warm"] },
        ],
        variants: [
          { variantName: "Twin – Light", sku: "SKU-HOME-009-V1", size: "Twin", color: "White", stockQuantity: 10, additionalPrice: -50, imageUrl: IMAGES.HOME[9], images: [IMAGES.HOME[9]] },
          { variantName: "Full/Queen – Medium", sku: "SKU-HOME-009-V2", size: "Full/Queen", color: "White", stockQuantity: 15, additionalPrice: -20, imageUrl: IMAGES.HOME[9], images: [IMAGES.HOME[9]] },
          { variantName: "King – Medium", sku: "SKU-HOME-009-V3", size: "King", color: "White", stockQuantity: 10, imageUrl: IMAGES.HOME[9], images: [IMAGES.HOME[9]] },
          { variantName: "King – Extra Warm", sku: "SKU-HOME-009-V4", size: "King", color: "White", stockQuantity: 5, additionalPrice: 30, imageUrl: IMAGES.HOME[9], images: [IMAGES.HOME[9]] },
        ],
      },
      {
        name: "Luxury Soy Wax Scented Candle Set",
        sku: "SKU-HOME-010",
        imageUrl: IMAGES.HOME[7],
        images: [IMAGES.HOME[7], IMAGES.HOME[0]],
        description: "Hand-poured set of 3 premium soy wax candles in glass vessels. Fragrances: Cedarwood & Oud, Fresh Linen, and Bergamot & Jasmine. 50-hour burn time per candle. Lead-free cotton wicks. Presented in a luxury gift box. Ideal as a home décor piece or gift.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 100,
        costPrice: 22,
        sellingPrice: 55,
        options: [{ name: "Style", values: ["Set of 3 – Mixed Scents", "Single – Cedarwood & Oud", "Single – Bergamot & Jasmine"] }],
        variants: [
          { variantName: "Set of 3 – Mixed Scents", sku: "SKU-HOME-010-V1", color: "Natural", stockQuantity: 60, imageUrl: IMAGES.HOME[7], images: [IMAGES.HOME[7]] },
          { variantName: "Single – Cedarwood & Oud", sku: "SKU-HOME-010-V2", color: "Natural", stockQuantity: 20, additionalPrice: -35, imageUrl: IMAGES.HOME[7], images: [IMAGES.HOME[7]] },
          { variantName: "Single – Bergamot & Jasmine", sku: "SKU-HOME-010-V3", color: "Natural", stockQuantity: 20, additionalPrice: -35, imageUrl: IMAGES.HOME[7], images: [IMAGES.HOME[7]] },
        ],
      },
      {
        name: "Indoor Plant Trio Bundle",
        sku: "SKU-HOME-011",
        imageUrl: IMAGES.HOME[8],
        images: [IMAGES.HOME[8], IMAGES.HOME[0]],
        description: "Curated set of three popular, low-maintenance houseplants: Monstera Deliciosa, Sansevieria (Snake Plant), and Pothos Golden. Arrives in matching matte ceramic pots. Suitable for offices and homes. Each plant is healthy and ready to be displayed.",
        category: cat["HOME"],
        supplier: sup["Home & Living Hub"],
        brand: brand["IKEA"],
        quantity: 50,
        costPrice: 40,
        sellingPrice: 89,
        options: [{ name: "Pot Color", values: ["White Matte", "Terracotta", "Black Matte"] }],
        variants: [
          { variantName: "White Matte Pots", sku: "SKU-HOME-011-V1", color: "White", stockQuantity: 20, imageUrl: IMAGES.HOME[8], images: [IMAGES.HOME[8]] },
          { variantName: "Terracotta Pots", sku: "SKU-HOME-011-V2", color: "Brown", stockQuantity: 15, imageUrl: IMAGES.HOME[8], images: [IMAGES.HOME[8]] },
          { variantName: "Black Matte Pots", sku: "SKU-HOME-011-V3", color: "Black", stockQuantity: 15, imageUrl: IMAGES.HOME[8], images: [IMAGES.HOME[8]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  SPORTS & GYM  (11 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "Bowflex SelectTech 552 Adjustable Dumbbells (Pair)",
        sku: "SKU-SPORT-001",
        imageUrl: IMAGES.SPORTS[0],
        images: [IMAGES.SPORTS[0], IMAGES.SPORTS[7]],
        description: "Replace 15 sets of weights with one compact set. Each dumbbell adjusts from 5 to 52.5 lbs in 2.5 lb increments up to the first 25 lbs. Dial selector system lets you change resistance in seconds. Space-saving design fits neatly on included stand. Sold as a pair.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Under Armour"],
        quantity: 30,
        costPrice: 260,
        sellingPrice: 429,
        options: [{ name: "Option", values: ["Pair (5–52.5 lbs each)", "Single (5–52.5 lbs)"] }],
        variants: [
          {
            variantName: "Pair – 5 to 52.5 lbs",
            sku: "SKU-SPORT-001-V1",
            optionValues: ["Pair (5–52.5 lbs each)"], // ← must match option.values exactly
            color: "Gray",
            stockQuantity: 20,
            imageUrl: IMAGES.SPORTS[0],
            images: [IMAGES.SPORTS[0]],
          },
          {
            variantName: "Single – 5 to 52.5 lbs",
            sku: "SKU-SPORT-001-V2",
            optionValues: ["Single (5–52.5 lbs)"], // ← must match option.values exactly
            color: "Gray",
            stockQuantity: 10,
            additionalPrice: -220,
            imageUrl: IMAGES.SPORTS[0],
            images: [IMAGES.SPORTS[0]],
          },
        ],
      },
      {
        name: "Manduka PRO Yoga Mat (6mm)",
        sku: "SKU-SPORT-002",
        imageUrl: IMAGES.SPORTS[1],
        images: [IMAGES.SPORTS[1], IMAGES.SPORTS[7]],
        description: "The Manduka PRO is the yoga mat trusted by millions of yogis worldwide. 6mm thick cushioning for joint support, dense foam construction, closed-cell surface to prevent sweat absorption, and guaranteed for life. 180×61cm, weighs 3.2kg. Made without harmful chemicals.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Under Armour"],
        quantity: 100,
        costPrice: 70,
        sellingPrice: 120,
        options: [{ name: "Color", values: ["Black Midnight", "Verve Deep Purple", "Sage Green"] }],
        variants: [
          { variantName: "Black Midnight", sku: "SKU-SPORT-002-V1", color: "Black", stockQuantity: 35, imageUrl: IMAGES.SPORTS[1], images: [IMAGES.SPORTS[1]] },
          { variantName: "Verve Deep Purple", sku: "SKU-SPORT-002-V2", color: "Purple", stockQuantity: 35, imageUrl: IMAGES.SPORTS[1], images: [IMAGES.SPORTS[1]] },
          { variantName: "Sage Green", sku: "SKU-SPORT-002-V3", color: "Green", stockQuantity: 30, imageUrl: IMAGES.SPORTS[1], images: [IMAGES.SPORTS[1]] },
        ],
      },
      {
        name: "Nike Pegasus 40 Running Shoes",
        sku: "SKU-SPORT-003",
        imageUrl: IMAGES.SPORTS[2],
        images: [IMAGES.SPORTS[2], IMAGES.SPORTS[7]],
        description: "Celebrating 40 years of running heritage, the Pegasus 40 features Nike ReactX foam in the midsole for 13% more energy return than the Pegasus 39, a wider toe box for a more natural splay, and a perforated Flyknit tongue. The forefoot Zoom Air unit provides responsive impact protection.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Nike"],
        quantity: 100,
        costPrice: 82,
        sellingPrice: 130,
        options: [
          { name: "Size", values: ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"] },
          { name: "Color", values: ["White/Black", "Black/Anthracite", "Volt/White"] },
        ],
        variants: [
          { variantName: "White/Black – US 8", sku: "SKU-SPORT-003-V1", size: "US 8", color: "White", stockQuantity: 20, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "White/Black – US 9", sku: "SKU-SPORT-003-V2", size: "US 9", color: "White", stockQuantity: 20, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "Black/Anthracite – US 9", sku: "SKU-SPORT-003-V3", size: "US 9", color: "Black", stockQuantity: 20, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "Black/Anthracite – US 10", sku: "SKU-SPORT-003-V4", size: "US 10", color: "Black", stockQuantity: 20, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "Volt/White – US 10", sku: "SKU-SPORT-003-V5", size: "US 10", color: "Yellow", stockQuantity: 20, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
        ],
      },
      {
        name: "DJI Mini 4 Pro Drone",
        sku: "SKU-SPORT-004",
        imageUrl: IMAGES.SPORTS[4],
        images: [IMAGES.SPORTS[4], IMAGES.SPORTS[7]],
        description: "Under 249g with no registration needed in most countries. 4K/60fps HDR video, omnidirectional obstacle sensing, ActiveTrack 360°, and up to 34 minutes flight time. True vertical shooting for social media content. 10km O4 transmission for clear video at range.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["DJI"],
        quantity: 25,
        costPrice: 550,
        sellingPrice: 759,
        options: [{ name: "Bundle", values: ["Standard Combo", "Fly More Combo (with 3 Batteries)", "Fly More Combo Plus (RC 2 Controller)"] }],
        variants: [
          { variantName: "Standard Combo", sku: "SKU-SPORT-004-V1", color: "Gray", stockQuantity: 10, imageUrl: IMAGES.SPORTS[4], images: [IMAGES.SPORTS[4]] },
          { variantName: "Fly More Combo", sku: "SKU-SPORT-004-V2", color: "Gray", stockQuantity: 10, additionalPrice: 240, imageUrl: IMAGES.SPORTS[4], images: [IMAGES.SPORTS[4]] },
          { variantName: "Fly More Combo Plus (RC 2)", sku: "SKU-SPORT-004-V3", color: "Gray", stockQuantity: 5, additionalPrice: 480, imageUrl: IMAGES.SPORTS[4], images: [IMAGES.SPORTS[4]] },
        ],
      },
      {
        name: "Garmin Forerunner 265 GPS Running Watch",
        sku: "SKU-SPORT-005",
        imageUrl: IMAGES.SPORTS[5],
        images: [IMAGES.SPORTS[5], IMAGES.SPORTS[7]],
        description: "The Garmin Forerunner 265 features a vibrant AMOLED display, advanced running metrics including Running Dynamics, Training Readiness, and Suggested Workouts. GPS accuracy with multi-band GNSS, up to 15 days battery life in smartwatch mode, heart rate and SpO2 monitoring, and onboard storage for music.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Garmin"],
        quantity: 40,
        costPrice: 330,
        sellingPrice: 449,
        options: [
          { name: "Size", values: ["42mm", "46mm"] },
          { name: "Color", values: ["Black/Powder Gray", "White/Aqua"] },
        ],
        variants: [
          { variantName: "Black/Powder Gray – 42mm", sku: "SKU-SPORT-005-V1", size: "42mm", color: "Black", stockQuantity: 15, imageUrl: IMAGES.SPORTS[5], images: [IMAGES.SPORTS[5]] },
          { variantName: "Black/Powder Gray – 46mm", sku: "SKU-SPORT-005-V2", size: "46mm", color: "Black", stockQuantity: 10, additionalPrice: 20, imageUrl: IMAGES.SPORTS[5], images: [IMAGES.SPORTS[5]] },
          { variantName: "White/Aqua – 42mm", sku: "SKU-SPORT-005-V3", size: "42mm", color: "White", stockQuantity: 10, imageUrl: IMAGES.SPORTS[5], images: [IMAGES.SPORTS[5]] },
          { variantName: "White/Aqua – 46mm", sku: "SKU-SPORT-005-V4", size: "46mm", color: "White", stockQuantity: 5, additionalPrice: 20, imageUrl: IMAGES.SPORTS[5], images: [IMAGES.SPORTS[5]] },
        ],
      },
      {
        name: "Theragun Prime Percussive Massage Gun",
        sku: "SKU-SPORT-006",
        imageUrl: IMAGES.SPORTS[10],
        images: [IMAGES.SPORTS[10], IMAGES.SPORTS[7]],
        description: "The Theragun Prime delivers professional-grade percussive therapy with 5 built-in speeds (1,750–2,400 PPM), 16mm amplitude, and a QuietForce Technology motor for near-silent operation. 4-attachment set for full body recovery. 120-min battery life, Bluetooth-connected with Therabody app.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Theragun"],
        quantity: 45,
        costPrice: 200,
        sellingPrice: 299,
        options: [{ name: "Color", values: ["Black", "White"] }],
        variants: [
          { variantName: "Black", sku: "SKU-SPORT-006-V1", color: "Black", stockQuantity: 25, imageUrl: IMAGES.SPORTS[10], images: [IMAGES.SPORTS[10]] },
          { variantName: "White", sku: "SKU-SPORT-006-V2", color: "White", stockQuantity: 20, imageUrl: IMAGES.SPORTS[10], images: [IMAGES.SPORTS[10]] },
        ],
      },
      {
        name: "Optimum Nutrition Gold Standard 100% Whey Protein",
        sku: "SKU-SPORT-007",
        imageUrl: IMAGES.SPORTS[11],
        images: [IMAGES.SPORTS[11], IMAGES.SPORTS[7]],
        description: "The world's best-selling whey protein. 24g of protein per serving, 5.5g of BCAAs, and under 1g of sugar. Made with Whey Protein Isolates as the primary ingredient. Banned-substance tested and Informed Choice certified. Mixes easily with a spoon or shaker.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Optimum Nutrition"],
        quantity: 200,
        costPrice: 45,
        sellingPrice: 79,
        options: [
          { name: "Flavor", values: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Banana", "Cookies & Cream"] },
          { name: "Size", values: ["2 lbs (28 servings)", "5 lbs (74 servings)"] },
        ],
        variants: [
          { variantName: "Double Rich Chocolate – 2 lbs", sku: "SKU-SPORT-007-V1", size: "2 lbs", color: "Brown", stockQuantity: 50, imageUrl: IMAGES.SPORTS[11], images: [IMAGES.SPORTS[11]] },
          { variantName: "Vanilla Ice Cream – 2 lbs", sku: "SKU-SPORT-007-V2", size: "2 lbs", color: "White", stockQuantity: 40, imageUrl: IMAGES.SPORTS[11], images: [IMAGES.SPORTS[11]] },
          { variantName: "Double Rich Chocolate – 5 lbs", sku: "SKU-SPORT-007-V3", size: "5 lbs", color: "Brown", stockQuantity: 60, additionalPrice: 55, imageUrl: IMAGES.SPORTS[11], images: [IMAGES.SPORTS[11]] },
          { variantName: "Cookies & Cream – 5 lbs", sku: "SKU-SPORT-007-V4", size: "5 lbs", color: "Mixed", stockQuantity: 50, additionalPrice: 55, imageUrl: IMAGES.SPORTS[11], images: [IMAGES.SPORTS[11]] },
        ],
      },
      {
        name: "Wilson Pro Staff 97 Tennis Racket",
        sku: "SKU-SPORT-008",
        imageUrl: IMAGES.SPORTS[9],
        images: [IMAGES.SPORTS[9], IMAGES.SPORTS[7]],
        description: "The racket used by Roger Federer for most of his Grand Slam career. Features a 97sq in head size, 16×19 string pattern, Braided Graphite and Basalt construction for precise control. Unstrung weight: 315g. Frame only (strings sold separately). Ideal for advanced intermediate to professional players.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Wilson"],
        quantity: 30,
        costPrice: 150,
        sellingPrice: 249,
        options: [{ name: "Grip Size", values: ["L2 (4¼\")", "L3 (4⅜\")", "L4 (4½\")"] }],
        variants: [
          { variantName: "L2 (4¼\")", sku: "SKU-SPORT-008-V1", color: "Black/Red", stockQuantity: 10, imageUrl: IMAGES.SPORTS[9], images: [IMAGES.SPORTS[9]] },
          { variantName: "L3 (4⅜\")", sku: "SKU-SPORT-008-V2", color: "Black/Red", stockQuantity: 10, imageUrl: IMAGES.SPORTS[9], images: [IMAGES.SPORTS[9]] },
          { variantName: "L4 (4½\")", sku: "SKU-SPORT-008-V3", color: "Black/Red", stockQuantity: 10, imageUrl: IMAGES.SPORTS[9], images: [IMAGES.SPORTS[9]] },
        ],
      },
      {
        name: "Under Armour Project Rock 4 Training Shoes",
        sku: "SKU-SPORT-009",
        imageUrl: IMAGES.SPORTS[2],
        images: [IMAGES.SPORTS[2], IMAGES.SPORTS[7]],
        description: "Designed with Dwayne \"The Rock\" Johnson for serious gym training. UA SlipSpeed heel allows instant transition from laced shoe to slipper mode. Dual-layer external heel counter locks in the foot. Charged Cushioning midsole absorbs impact and converts it to explosive energy.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Under Armour"],
        quantity: 70,
        costPrice: 80,
        sellingPrice: 140,
        options: [
          { name: "Size", values: ["US 8", "US 9", "US 10", "US 11", "US 12"] },
          { name: "Color", values: ["Black", "White/Gray"] },
        ],
        variants: [
          { variantName: "Black – US 8", sku: "SKU-SPORT-009-V1", size: "US 8", color: "Black", stockQuantity: 15, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "Black – US 9", sku: "SKU-SPORT-009-V2", size: "US 9", color: "Black", stockQuantity: 15, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "Black – US 10", sku: "SKU-SPORT-009-V3", size: "US 10", color: "Black", stockQuantity: 15, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "White/Gray – US 9", sku: "SKU-SPORT-009-V4", size: "US 9", color: "White", stockQuantity: 15, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
          { variantName: "White/Gray – US 10", sku: "SKU-SPORT-009-V5", size: "US 10", color: "White", stockQuantity: 10, imageUrl: IMAGES.SPORTS[2], images: [IMAGES.SPORTS[2]] },
        ],
      },
      {
        name: "TRX All-In-One Suspension Trainer",
        sku: "SKU-SPORT-010",
        imageUrl: IMAGES.SPORTS[7],
        images: [IMAGES.SPORTS[7], IMAGES.SPORTS[0]],
        description: "The original bodyweight training system trusted by professional athletes and military. 300+ exercises for strength, balance, flexibility, and core. Indoor/outdoor setup. Adjustable straps hold up to 350 lbs. Includes door anchor, training guide, and mesh carry bag. 6-week starter program included.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Under Armour"],
        quantity: 60,
        costPrice: 80,
        sellingPrice: 149,
        options: [{ name: "Bundle", values: ["Trainer Only", "Trainer + Mesh Bag + Door Anchor"] }],
        variants: [
          { variantName: "Trainer Only", sku: "SKU-SPORT-010-V1", color: "Black/Yellow", stockQuantity: 30, imageUrl: IMAGES.SPORTS[7], images: [IMAGES.SPORTS[7]] },
          { variantName: "Trainer + Mesh Bag + Door Anchor", sku: "SKU-SPORT-010-V2", color: "Black/Yellow", stockQuantity: 30, additionalPrice: 20, imageUrl: IMAGES.SPORTS[7], images: [IMAGES.SPORTS[7]] },
        ],
      },
      {
        name: "Adidas Pro Leather Boxing Gloves",
        sku: "SKU-SPORT-011",
        imageUrl: IMAGES.SPORTS[3],
        images: [IMAGES.SPORTS[3], IMAGES.SPORTS[7]],
        description: "Full-grain cowhide leather boxing gloves built for bag work, pad work, and sparring. Multi-layer high-density foam padding for superior knuckle and hand protection. Velcro wrist closure with a long strap for firm wrist support. Pre-curved design for a natural fist shape.",
        category: cat["SPORT"],
        supplier: sup["ActiveLife Distributors"],
        brand: brand["Adidas"],
        quantity: 80,
        costPrice: 55,
        sellingPrice: 99,
        options: [
          { name: "Weight", values: ["10oz", "12oz", "14oz", "16oz"] },
          { name: "Color", values: ["Black/Gold", "Red/Black", "White/Gold"] },
        ],
        variants: [
          { variantName: "Black/Gold – 10oz", sku: "SKU-SPORT-011-V1", size: "10oz", color: "Black", stockQuantity: 20, imageUrl: IMAGES.SPORTS[3], images: [IMAGES.SPORTS[3]] },
          { variantName: "Red/Black – 12oz", sku: "SKU-SPORT-011-V2", size: "12oz", color: "Red", stockQuantity: 20, imageUrl: IMAGES.SPORTS[3], images: [IMAGES.SPORTS[3]] },
          { variantName: "Red/Black – 14oz", sku: "SKU-SPORT-011-V3", size: "14oz", color: "Red", stockQuantity: 20, imageUrl: IMAGES.SPORTS[3], images: [IMAGES.SPORTS[3]] },
          { variantName: "White/Gold – 16oz", sku: "SKU-SPORT-011-V4", size: "16oz", color: "White", stockQuantity: 20, imageUrl: IMAGES.SPORTS[3], images: [IMAGES.SPORTS[3]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  BEAUTY & CARE  (11 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "L'Oréal Revitalift 1.5% Pure Vitamin C Serum",
        sku: "SKU-BEAUTY-001",
        imageUrl: IMAGES.BEAUTY[4],
        images: [IMAGES.BEAUTY[4], IMAGES.BEAUTY[0]],
        description: "Formulated with 1.5% pure Vitamin C (L-Ascorbic Acid) for maximum efficacy. Visibly reduces dark spots, fine lines, and improves skin texture in 4 weeks. Dermatologist-tested, non-comedogenic, and fragrance-free. Suitable for all skin types including sensitive. 30ml with pump dispenser.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["LOreal"],
        quantity: 250,
        costPrice: 22,
        sellingPrice: 49,
        options: [{ name: "Size", values: ["30ml", "50ml"] }],
        variants: [
          { variantName: "30ml", sku: "SKU-BEAUTY-001-V1", color: "Clear", stockQuantity: 150, imageUrl: IMAGES.BEAUTY[4], images: [IMAGES.BEAUTY[4]] },
          { variantName: "50ml", sku: "SKU-BEAUTY-001-V2", color: "Clear", stockQuantity: 100, additionalPrice: 20, imageUrl: IMAGES.BEAUTY[4], images: [IMAGES.BEAUTY[4]] },
        ],
      },
      {
        name: "CeraVe Hydrating Facial Cleanser",
        sku: "SKU-BEAUTY-002",
        imageUrl: IMAGES.BEAUTY[0],
        images: [IMAGES.BEAUTY[0], IMAGES.BEAUTY[5]],
        description: "A gentle, non-foaming cleanser developed with dermatologists. Contains 3 essential ceramides (1, 3, 6-II) that work together to restore the skin's natural barrier. Hyaluronic acid helps retain skin moisture. Non-comedogenic, fragrance-free. Suitable for normal to dry skin. 16 fl oz (473ml).",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["CeraVe"],
        quantity: 300,
        costPrice: 12,
        sellingPrice: 22,
        options: [{ name: "Size", values: ["12 fl oz", "16 fl oz"] }],
        variants: [
          { variantName: "12 fl oz", sku: "SKU-BEAUTY-002-V1", color: "White", stockQuantity: 150, imageUrl: IMAGES.BEAUTY[0], images: [IMAGES.BEAUTY[0]] },
          { variantName: "16 fl oz", sku: "SKU-BEAUTY-002-V2", color: "White", stockQuantity: 150, additionalPrice: 6, imageUrl: IMAGES.BEAUTY[0], images: [IMAGES.BEAUTY[0]] },
        ],
      },
      {
        name: "Dyson Airwrap Multi-Styler Complete",
        sku: "SKU-BEAUTY-003",
        imageUrl: IMAGES.BEAUTY[3],
        images: [IMAGES.BEAUTY[3], IMAGES.BEAUTY[0]],
        description: "Styles and dries simultaneously with no extreme heat. The Coanda effect attracts, wraps, and curls hair around the barrel. Includes 6 attachments: 30mm and 40mm barrels, round volumising brush, firm and soft smoothing brushes, and a pre-styling dryer. Frizz prevention, flyaway control.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["Dyson"],
        quantity: 40,
        costPrice: 380,
        sellingPrice: 599,
        options: [{ name: "Color", values: ["Prussian Blue/Rich Copper", "Black/Nickel", "Fuchsia/Bright Nickel"] }],
        variants: [
          { variantName: "Prussian Blue/Rich Copper", sku: "SKU-BEAUTY-003-V1", color: "Blue", stockQuantity: 15, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
          { variantName: "Black/Nickel", sku: "SKU-BEAUTY-003-V2", color: "Black", stockQuantity: 15, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
          { variantName: "Fuchsia/Bright Nickel", sku: "SKU-BEAUTY-003-V3", color: "Pink", stockQuantity: 10, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
        ],
      },
      {
        name: "Olaplex No.3 Hair Perfector",
        sku: "SKU-BEAUTY-004",
        imageUrl: IMAGES.BEAUTY[11],
        images: [IMAGES.BEAUTY[11], IMAGES.BEAUTY[0]],
        description: "The Olaplex No.3 is a weekly at-home treatment that strengthens and repairs the hair's internal bonds broken by chemical, thermal, and mechanical damage. 100% vegan, cruelty-free. Apply before shampooing for 10+ minutes. Reduces breakage and restores hair elasticity. Suitable for all hair types. 100ml.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["Olaplex"],
        quantity: 200,
        costPrice: 20,
        sellingPrice: 38,
        options: [{ name: "Size", values: ["100ml", "250ml"] }],
        variants: [
          { variantName: "100ml", sku: "SKU-BEAUTY-004-V1", color: "Gold", stockQuantity: 120, imageUrl: IMAGES.BEAUTY[11], images: [IMAGES.BEAUTY[11]] },
          { variantName: "250ml", sku: "SKU-BEAUTY-004-V2", color: "Gold", stockQuantity: 80, additionalPrice: 22, imageUrl: IMAGES.BEAUTY[11], images: [IMAGES.BEAUTY[11]] },
        ],
      },
      {
        name: "La Roche-Posay Anthelios SPF 50+ Sunscreen",
        sku: "SKU-BEAUTY-005",
        imageUrl: IMAGES.BEAUTY[6],
        images: [IMAGES.BEAUTY[6], IMAGES.BEAUTY[0]],
        description: "Europe's #1 dermatologist-recommended sunscreen brand. Broad-spectrum UVA/UVB protection with SPF 50+. Ultra-light texture that leaves no white cast. Fragrance-free, paraben-free, and non-comedogenic. Water-resistant for 80 minutes. Tested on sensitive and allergy-prone skin.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["La Roche-Posay"],
        quantity: 200,
        costPrice: 18,
        sellingPrice: 38,
        options: [
          { name: "Type", values: ["Melt-In Sunscreen Milk SPF 60", "UV Correct SPF 70 Face Serum", "Invisible Fluid SPF 50+"] },
          { name: "Size", values: ["50ml", "100ml"] },
        ],
        variants: [
          { variantName: "Melt-In Sunscreen Milk – 100ml", sku: "SKU-BEAUTY-005-V1", color: "White", stockQuantity: 80, imageUrl: IMAGES.BEAUTY[6], images: [IMAGES.BEAUTY[6]] },
          { variantName: "UV Correct SPF 70 – 50ml", sku: "SKU-BEAUTY-005-V2", color: "White", stockQuantity: 60, additionalPrice: 5, imageUrl: IMAGES.BEAUTY[6], images: [IMAGES.BEAUTY[6]] },
          { variantName: "Invisible Fluid SPF 50+ – 50ml", sku: "SKU-BEAUTY-005-V3", color: "White", stockQuantity: 60, imageUrl: IMAGES.BEAUTY[6], images: [IMAGES.BEAUTY[6]] },
        ],
      },
      {
        name: "L'Oréal Paris Colour Riche Lipstick",
        sku: "SKU-BEAUTY-006",
        imageUrl: IMAGES.BEAUTY[2],
        images: [IMAGES.BEAUTY[2], IMAGES.BEAUTY[7]],
        description: "A cult-classic lipstick with a satin finish and high colour intensity. Enriched with argan oil and vitamin E for moisturising comfort. 24-hour staying power. Over 60 shades. Long-wearing, non-drying formula with a rich, creamy texture that applies smoothly in one stroke.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["LOreal"],
        quantity: 350,
        costPrice: 8,
        sellingPrice: 16,
        options: [{ name: "Shade", values: ["Classic Red", "Nude Rosé", "Berry Bliss", "Plum Elixir", "Blush Fantasy"] }],
        variants: [
          { variantName: "Classic Red", sku: "SKU-BEAUTY-006-V1", color: "Red", stockQuantity: 100, imageUrl: IMAGES.BEAUTY[2], images: [IMAGES.BEAUTY[2]] },
          { variantName: "Nude Rosé", sku: "SKU-BEAUTY-006-V2", color: "Nude", stockQuantity: 100, imageUrl: IMAGES.BEAUTY[2], images: [IMAGES.BEAUTY[2]] },
          { variantName: "Berry Bliss", sku: "SKU-BEAUTY-006-V3", color: "Berry", stockQuantity: 80, imageUrl: IMAGES.BEAUTY[2], images: [IMAGES.BEAUTY[2]] },
          { variantName: "Plum Elixir", sku: "SKU-BEAUTY-006-V4", color: "Plum", stockQuantity: 70, imageUrl: IMAGES.BEAUTY[2], images: [IMAGES.BEAUTY[2]] },
        ],
      },
      {
        name: "MAC Studio Fix Powder Plus Foundation",
        sku: "SKU-BEAUTY-007",
        imageUrl: IMAGES.BEAUTY[9],
        images: [IMAGES.BEAUTY[9], IMAGES.BEAUTY[7]],
        description: "A portable powder-plus-foundation with medium-to-full buildable coverage. The skin-true formula matches skin tones seamlessly with a natural matte finish. Controls oil and shine for up to 8 hours. Available in 60+ shades ranging from N15 to NC55. SPF 15.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["MAC"],
        quantity: 180,
        costPrice: 22,
        sellingPrice: 39,
        options: [{ name: "Shade", values: ["NC15", "NC25", "NC35", "NC42", "NW25", "NW35", "NW45"] }],
        variants: [
          { variantName: "NC15 (Fair)", sku: "SKU-BEAUTY-007-V1", color: "Fair", stockQuantity: 30, imageUrl: IMAGES.BEAUTY[9], images: [IMAGES.BEAUTY[9]] },
          { variantName: "NC25 (Light)", sku: "SKU-BEAUTY-007-V2", color: "Light", stockQuantity: 40, imageUrl: IMAGES.BEAUTY[9], images: [IMAGES.BEAUTY[9]] },
          { variantName: "NC35 (Medium)", sku: "SKU-BEAUTY-007-V3", color: "Medium", stockQuantity: 40, imageUrl: IMAGES.BEAUTY[9], images: [IMAGES.BEAUTY[9]] },
          { variantName: "NC42 (Medium Tan)", sku: "SKU-BEAUTY-007-V4", color: "Tan", stockQuantity: 30, imageUrl: IMAGES.BEAUTY[9], images: [IMAGES.BEAUTY[9]] },
          { variantName: "NW45 (Deep)", sku: "SKU-BEAUTY-007-V5", color: "Deep", stockQuantity: 40, imageUrl: IMAGES.BEAUTY[9], images: [IMAGES.BEAUTY[9]] },
        ],
      },
      {
        name: "CeraVe AM SPF 30 Facial Moisturizing Lotion",
        sku: "SKU-BEAUTY-008",
        imageUrl: IMAGES.BEAUTY[10],
        images: [IMAGES.BEAUTY[10], IMAGES.BEAUTY[0]],
        description: "An oil-free daily moisturizer with SPF 30 for face and neck. Developed with dermatologists to hydrate while protecting from UV exposure. Contains niacinamide, ceramides 1, 3, 6-II, and hyaluronic acid. Non-comedogenic, fragrance-free, and suitable for sensitive skin. 3 fl oz.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["CeraVe"],
        quantity: 300,
        costPrice: 14,
        sellingPrice: 26,
        options: [{ name: "Size", values: ["3 fl oz", "6 fl oz"] }],
        variants: [
          { variantName: "3 fl oz", sku: "SKU-BEAUTY-008-V1", color: "White", stockQuantity: 200, imageUrl: IMAGES.BEAUTY[10], images: [IMAGES.BEAUTY[10]] },
          { variantName: "6 fl oz", sku: "SKU-BEAUTY-008-V2", color: "White", stockQuantity: 100, additionalPrice: 10, imageUrl: IMAGES.BEAUTY[10], images: [IMAGES.BEAUTY[10]] },
        ],
      },
      {
        name: "Midnight Oud Eau de Parfum",
        sku: "SKU-BEAUTY-009",
        imageUrl: IMAGES.BEAUTY[1],
        images: [IMAGES.BEAUTY[1], IMAGES.BEAUTY[0]],
        description: "A rich, oriental fragrance with opening notes of saffron and black pepper, a heart of oud wood and Turkish rose, and a base of black amber and sandalwood. Long-lasting EDP concentration (12+ hours). Presented in a hand-crafted glass bottle with gold detailing.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["LOreal"],
        quantity: 80,
        costPrice: 65,
        sellingPrice: 145,
        options: [{ name: "Size", values: ["50ml EDP", "100ml EDP"] }],
        variants: [
          { variantName: "50ml EDP", sku: "SKU-BEAUTY-009-V1", color: "Gold", stockQuantity: 50, imageUrl: IMAGES.BEAUTY[1], images: [IMAGES.BEAUTY[1]] },
          { variantName: "100ml EDP", sku: "SKU-BEAUTY-009-V2", color: "Gold", stockQuantity: 30, additionalPrice: 60, imageUrl: IMAGES.BEAUTY[1], images: [IMAGES.BEAUTY[1]] },
        ],
      },
      {
        name: "L'Oréal EverPure Sulfate-Free Shampoo & Conditioner",
        sku: "SKU-BEAUTY-010",
        imageUrl: IMAGES.BEAUTY[11],
        images: [IMAGES.BEAUTY[11], IMAGES.BEAUTY[0]],
        description: "Gentle sulfate-free formula safe for colour-treated hair. Infused with rosemary, salicylic acid, and camellia flower extract. Shampoo removes build-up without stripping colour; conditioner seals the cuticle for shine and smoothness. 98% naturally derived ingredients.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["LOreal"],
        quantity: 200,
        costPrice: 9,
        sellingPrice: 18,
        options: [{ name: "Type", values: ["Shampoo 8.5 fl oz", "Conditioner 8.5 fl oz", "Duo Bundle"] }],
        variants: [
          { variantName: "Shampoo 8.5 fl oz", sku: "SKU-BEAUTY-010-V1", color: "Purple", stockQuantity: 80, imageUrl: IMAGES.BEAUTY[11], images: [IMAGES.BEAUTY[11]] },
          { variantName: "Conditioner 8.5 fl oz", sku: "SKU-BEAUTY-010-V2", color: "Purple", stockQuantity: 80, imageUrl: IMAGES.BEAUTY[11], images: [IMAGES.BEAUTY[11]] },
          { variantName: "Duo Bundle", sku: "SKU-BEAUTY-010-V3", color: "Purple", stockQuantity: 40, additionalPrice: 14, imageUrl: IMAGES.BEAUTY[11], images: [IMAGES.BEAUTY[11]] },
        ],
      },
      {
        name: "Dyson Supersonic Hair Dryer",
        sku: "SKU-BEAUTY-011",
        imageUrl: IMAGES.BEAUTY[3],
        images: [IMAGES.BEAUTY[3], IMAGES.BEAUTY[0]],
        description: "The Dyson Supersonic uses intelligent heat control measured 40 times per second to protect hair from extreme heat. The digital motor V9 spins at 110,000 RPM to generate high-pressure airflow. Dries hair fast without extreme heat. Includes 5 magnetic attachments. 1,600W.",
        category: cat["BEAUTY"],
        supplier: sup["Beauty World Imports"],
        brand: brand["Dyson"],
        quantity: 45,
        costPrice: 290,
        sellingPrice: 429,
        options: [{ name: "Color", values: ["Fuchsia/Iron", "Prussian Blue/Rich Copper", "Black/Nickel"] }],
        variants: [
          { variantName: "Fuchsia/Iron", sku: "SKU-BEAUTY-011-V1", color: "Pink", stockQuantity: 15, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
          { variantName: "Prussian Blue/Rich Copper", sku: "SKU-BEAUTY-011-V2", color: "Blue", stockQuantity: 15, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
          { variantName: "Black/Nickel", sku: "SKU-BEAUTY-011-V3", color: "Black", stockQuantity: 15, imageUrl: IMAGES.BEAUTY[3], images: [IMAGES.BEAUTY[3]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  FOOD & DRINKS  (10 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "Nescafé Gold Blend Instant Coffee",
        sku: "SKU-FOOD-001",
        imageUrl: IMAGES.FOOD[0],
        images: [IMAGES.FOOD[0], IMAGES.FOOD[9]],
        description: "Nescafé Gold Blend is made from a blend of Arabica and Robusta beans, freeze-dried for a smooth, balanced flavour. A unique roasting process gives it its distinctive golden colour and rich aroma. Dissolves instantly in hot or cold water. No artificial flavours or preservatives.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 300,
        costPrice: 9,
        sellingPrice: 18,
        options: [{ name: "Size", values: ["100g", "200g", "400g"] }],
        variants: [
          { variantName: "100g", sku: "SKU-FOOD-001-V1", stockQuantity: 100, imageUrl: IMAGES.FOOD[0], images: [IMAGES.FOOD[0]] },
          { variantName: "200g", sku: "SKU-FOOD-001-V2", stockQuantity: 100, additionalPrice: 8, imageUrl: IMAGES.FOOD[0], images: [IMAGES.FOOD[0]] },
          { variantName: "400g", sku: "SKU-FOOD-001-V3", stockQuantity: 100, additionalPrice: 20, imageUrl: IMAGES.FOOD[0], images: [IMAGES.FOOD[0]] },
        ],
      },
      {
        name: "Lindt Excellence Dark Chocolate Bar",
        sku: "SKU-FOOD-002",
        imageUrl: IMAGES.FOOD[1],
        images: [IMAGES.FOOD[1], IMAGES.FOOD[9]],
        description: "Swiss dark chocolate crafted by Lindt Master Chocolatiers since 1845. Made from fine cocoa beans sourced from Ecuador and Ghana. Intense, balanced flavour with a smooth, melting texture. Suitable for vegans. Available in 70%, 85%, and 90% cocoa. 100g bar.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Lindt"],
        quantity: 500,
        costPrice: 3,
        sellingPrice: 7,
        options: [{ name: "Cocoa %", values: ["70% Cocoa", "85% Cocoa", "90% Cocoa"] }],
        variants: [
          { variantName: "70% Cocoa – 100g", sku: "SKU-FOOD-002-V1", stockQuantity: 200, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
          { variantName: "85% Cocoa – 100g", sku: "SKU-FOOD-002-V2", stockQuantity: 200, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
          { variantName: "90% Cocoa – 100g", sku: "SKU-FOOD-002-V3", stockQuantity: 100, additionalPrice: 1, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
        ],
      },
      {
        name: "Manuka Health MGO 400+ Raw Honey",
        sku: "SKU-FOOD-003",
        imageUrl: IMAGES.FOOD[2],
        images: [IMAGES.FOOD[2], IMAGES.FOOD[9]],
        description: "Certified MGO 400+ Manuka honey from New Zealand, guaranteed for methylglyoxal activity. Cold-extracted and minimally processed to preserve natural enzymes, antioxidants, and antibacterial properties. Non-GMO verified. UMF 15+ equivalent. Available in 250g and 500g glass jars.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 150,
        costPrice: 22,
        sellingPrice: 55,
        options: [{ name: "Size", values: ["250g", "500g"] }],
        variants: [
          { variantName: "MGO 400+ – 250g", sku: "SKU-FOOD-003-V1", stockQuantity: 75, imageUrl: IMAGES.FOOD[2], images: [IMAGES.FOOD[2]] },
          { variantName: "MGO 400+ – 500g", sku: "SKU-FOOD-003-V2", stockQuantity: 75, additionalPrice: 30, imageUrl: IMAGES.FOOD[2], images: [IMAGES.FOOD[2]] },
        ],
      },
      {
        name: "San Pellegrino Sparkling Natural Water (24×330ml)",
        sku: "SKU-FOOD-004",
        imageUrl: IMAGES.FOOD[3],
        images: [IMAGES.FOOD[3], IMAGES.FOOD[9]],
        description: "Naturally carbonated mineral water sourced from the Italian Alps since 1899. Rich in calcium, sodium bicarbonate, and magnesium. No artificial additives. The classic choice for dining, cocktails, and premium sparkling water enjoyment. Sold as a case of 24 × 330ml glass bottles.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 200,
        costPrice: 18,
        sellingPrice: 35,
        options: [{ name: "Format", values: ["24×330ml Glass Bottles", "12×750ml Glass Bottles"] }],
        variants: [
          { variantName: "24×330ml Glass Bottles", sku: "SKU-FOOD-004-V1", stockQuantity: 120, imageUrl: IMAGES.FOOD[3], images: [IMAGES.FOOD[3]] },
          { variantName: "12×750ml Glass Bottles", sku: "SKU-FOOD-004-V2", stockQuantity: 80, additionalPrice: 5, imageUrl: IMAGES.FOOD[3], images: [IMAGES.FOOD[3]] },
        ],
      },
      {
        name: "KIND Dark Chocolate Nuts & Sea Salt Bars (30-Count)",
        sku: "SKU-FOOD-005",
        imageUrl: IMAGES.FOOD[7],
        images: [IMAGES.FOOD[7], IMAGES.FOOD[9]],
        description: "Whole ingredient snack bars made with almonds, peanuts, and dark chocolate, finished with a pinch of sea salt. Each bar has 6g+ protein, 5g fibre, and under 200 calories. Gluten-free, non-GMO verified, and free of artificial sweeteners. Ideal for on-the-go snacking.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["KIND"],
        quantity: 200,
        costPrice: 22,
        sellingPrice: 42,
        options: [{ name: "Flavor", values: ["Dark Chocolate Nuts & Sea Salt", "Caramel Almond & Sea Salt", "Peanut Butter Dark Chocolate"] }],
        variants: [
          { variantName: "Dark Chocolate Nuts & Sea Salt – 30ct", sku: "SKU-FOOD-005-V1", stockQuantity: 80, imageUrl: IMAGES.FOOD[7], images: [IMAGES.FOOD[7]] },
          { variantName: "Caramel Almond & Sea Salt – 30ct", sku: "SKU-FOOD-005-V2", stockQuantity: 60, imageUrl: IMAGES.FOOD[7], images: [IMAGES.FOOD[7]] },
          { variantName: "Peanut Butter Dark Chocolate – 30ct", sku: "SKU-FOOD-005-V3", stockQuantity: 60, imageUrl: IMAGES.FOOD[7], images: [IMAGES.FOOD[7]] },
        ],
      },
      {
        name: "Kirkland Signature Organic Extra Virgin Olive Oil (2L)",
        sku: "SKU-FOOD-006",
        imageUrl: IMAGES.FOOD[5],
        images: [IMAGES.FOOD[5], IMAGES.FOOD[9]],
        description: "USDA Certified Organic Extra Virgin Olive Oil cold-pressed from hand-picked olives in Italy and Spain. Acidity level below 0.3%. Rich, fruity flavour with a peppery finish. Non-GMO verified. Ideal for cooking, sautéing, and drizzling. 2-litre tin for home chefs.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 150,
        costPrice: 20,
        sellingPrice: 38,
        options: [{ name: "Size", values: ["1L", "2L"] }],
        variants: [
          { variantName: "Organic EVOO – 1L", sku: "SKU-FOOD-006-V1", stockQuantity: 70, imageUrl: IMAGES.FOOD[5], images: [IMAGES.FOOD[5]] },
          { variantName: "Organic EVOO – 2L", sku: "SKU-FOOD-006-V2", stockQuantity: 80, additionalPrice: 18, imageUrl: IMAGES.FOOD[5], images: [IMAGES.FOOD[5]] },
        ],
      },
      {
        name: "Harney & Sons Fine Teas Premium Tea Sampler (50 bags)",
        sku: "SKU-FOOD-007",
        imageUrl: IMAGES.FOOD[6],
        images: [IMAGES.FOOD[6], IMAGES.FOOD[9]],
        description: "A luxury tea sampler from Harney & Sons featuring 8 varieties: Hot Cinnamon Spice, Black Magic, Paris, English Breakfast, Darjeeling, Chamomile Herbal, Peppermint Herbal, and Green with Citrus. 50 wrapped sachets. Presented in a beautiful keepsake tin. Caffeine-free options included.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 120,
        costPrice: 14,
        sellingPrice: 28,
        options: [{ name: "Box Size", values: ["20 bags", "50 bags"] }],
        variants: [
          { variantName: "Sampler – 20 bags", sku: "SKU-FOOD-007-V1", stockQuantity: 60, imageUrl: IMAGES.FOOD[6], images: [IMAGES.FOOD[6]] },
          { variantName: "Sampler – 50 bags", sku: "SKU-FOOD-007-V2", stockQuantity: 60, additionalPrice: 14, imageUrl: IMAGES.FOOD[6], images: [IMAGES.FOOD[6]] },
        ],
      },
      {
        name: "Wonderful Pistachios No Shells (1.5 lb Bag)",
        sku: "SKU-FOOD-008",
        imageUrl: IMAGES.FOOD[4],
        images: [IMAGES.FOOD[4], IMAGES.FOOD[9]],
        description: "Premium California-grown pistachios, shelled for convenience. 6g protein and 3g fibre per serving. Lightly salted for the perfect balance of flavour. Roasted in small batches. Non-GMO, no artificial ingredients. Resealable bag for freshness. Great for snacking, salads, and cooking.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Nescafe"],
        quantity: 180,
        costPrice: 12,
        sellingPrice: 24,
        options: [{ name: "Flavor & Size", values: ["Lightly Salted – 1.5 lb", "Roasted Unsalted – 1.5 lb", "Chili Roasted – 1 lb"] }],
        variants: [
          { variantName: "Lightly Salted – 1.5 lb", sku: "SKU-FOOD-008-V1", stockQuantity: 80, imageUrl: IMAGES.FOOD[4], images: [IMAGES.FOOD[4]] },
          { variantName: "Roasted Unsalted – 1.5 lb", sku: "SKU-FOOD-008-V2", stockQuantity: 60, imageUrl: IMAGES.FOOD[4], images: [IMAGES.FOOD[4]] },
          { variantName: "Chili Roasted – 1 lb", sku: "SKU-FOOD-008-V3", stockQuantity: 40, imageUrl: IMAGES.FOOD[4], images: [IMAGES.FOOD[4]] },
        ],
      },
      {
        name: "Optimum Nutrition Gold Standard Whey Protein (2 lbs)",
        sku: "SKU-FOOD-009",
        imageUrl: IMAGES.FOOD[8],
        images: [IMAGES.FOOD[8], IMAGES.FOOD[9]],
        description: "The world's best-selling whey protein, banned-substance tested and Informed Choice certified. 24g protein, 5.5g BCAAs, and under 1g sugar per serving. Whey Protein Isolates as the primary ingredient. Mixes instantly with a shaker. 28 servings per container.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Optimum Nutrition"],
        quantity: 200,
        costPrice: 44,
        sellingPrice: 79,
        options: [
          { name: "Flavor", values: ["Double Rich Chocolate", "Vanilla Ice Cream", "Strawberry Banana", "Cookies & Cream"] },
          { name: "Size", values: ["2 lbs", "5 lbs"] },
        ],
        variants: [
          { variantName: "Double Rich Chocolate – 2 lbs", sku: "SKU-FOOD-009-V1", stockQuantity: 60, imageUrl: IMAGES.FOOD[8], images: [IMAGES.FOOD[8]] },
          { variantName: "Vanilla Ice Cream – 2 lbs", sku: "SKU-FOOD-009-V2", stockQuantity: 50, imageUrl: IMAGES.FOOD[8], images: [IMAGES.FOOD[8]] },
          { variantName: "Double Rich Chocolate – 5 lbs", sku: "SKU-FOOD-009-V3", stockQuantity: 50, additionalPrice: 55, imageUrl: IMAGES.FOOD[8], images: [IMAGES.FOOD[8]] },
          { variantName: "Cookies & Cream – 5 lbs", sku: "SKU-FOOD-009-V4", stockQuantity: 40, additionalPrice: 55, imageUrl: IMAGES.FOOD[8], images: [IMAGES.FOOD[8]] },
        ],
      },
      {
        name: "Lindt Lindor Assorted Truffles Box (600g)",
        sku: "SKU-FOOD-010",
        imageUrl: IMAGES.FOOD[1],
        images: [IMAGES.FOOD[1], IMAGES.FOOD[9]],
        description: "A signature Lindt LINDOR truffle: a delicate chocolate shell with an irresistibly smooth, melting chocolate filling. Assorted box of 600g (approx. 48 truffles) with Milk, Dark, White, and Hazelnut varieties. Perfect for gifting or sharing. Kosher certified.",
        category: cat["FOOD"],
        supplier: sup["FreshFarm Foods"],
        brand: brand["Lindt"],
        quantity: 200,
        costPrice: 14,
        sellingPrice: 28,
        options: [{ name: "Variety", values: ["Assorted (Milk+Dark+White+Hazelnut)", "Milk Chocolate Only", "Dark Chocolate Only"] }],
        variants: [
          { variantName: "Assorted – 600g", sku: "SKU-FOOD-010-V1", stockQuantity: 100, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
          { variantName: "Milk Chocolate – 600g", sku: "SKU-FOOD-010-V2", stockQuantity: 60, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
          { variantName: "Dark Chocolate – 600g", sku: "SKU-FOOD-010-V3", stockQuantity: 40, imageUrl: IMAGES.FOOD[1], images: [IMAGES.FOOD[1]] },
        ],
      },

      // ════════════════════════════════════════════════════════════════════
      //  TOYS & GAMES  (10 products)
      // ════════════════════════════════════════════════════════════════════
      {
        name: "LEGO Technic McLaren Formula 1 Race Car (42141)",
        sku: "SKU-TOYS-001",
        imageUrl: IMAGES.TOYS[0],
        images: [IMAGES.TOYS[0], IMAGES.TOYS[1]],
        description: "Recreate the legendary McLaren F1 race car with this officially licensed 1,434-piece LEGO Technic set. Features a V6 hybrid engine with moving pistons, working steering, realistic suspension, and authentic McLaren livery. Includes a buildable display stand and information plaque. Ages 18+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 50,
        costPrice: 95,
        sellingPrice: 179,
        variants: [
          { variantName: "Standard Set", sku: "SKU-TOYS-001-V1", stockQuantity: 50, imageUrl: IMAGES.TOYS[0], images: [IMAGES.TOYS[0]] },
        ],
      },
      {
        name: "LEGO Icons Eiffel Tower (10307)",
        sku: "SKU-TOYS-002",
        imageUrl: IMAGES.TOYS[0],
        images: [IMAGES.TOYS[0], IMAGES.TOYS[1]],
        description: "The largest LEGO set ever at 10,001 pieces. Build a 149cm-tall 1:894 scale replica of the iconic Eiffel Tower with authentic architectural details. Includes 3 observation platforms, a restaurant, and an antenna. Display model for home or office. Ages 18+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 25,
        costPrice: 210,
        sellingPrice: 629,
        variants: [
          { variantName: "Standard Set", sku: "SKU-TOYS-002-V1", stockQuantity: 25, imageUrl: IMAGES.TOYS[0], images: [IMAGES.TOYS[0]] },
        ],
      },
      {
        name: "Nintendo Switch OLED Model",
        sku: "SKU-TOYS-003",
        imageUrl: IMAGES.TOYS[4],
        images: [IMAGES.TOYS[4], IMAGES.TOYS[8]],
        description: "The Nintendo Switch OLED Model features a 7-inch OLED screen with vivid colours and a wide adjustable stand. 64GB internal storage, enhanced audio in handheld mode, and a wired LAN port in the dock. Play at home or on the go. Includes a Nintendo Switch Dock, 2 Joy-Con controllers, and all cables.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Nintendo"],
        quantity: 60,
        costPrice: 280,
        sellingPrice: 349,
        options: [{ name: "Color", values: ["White", "Neon Blue/Neon Red", "Splatoon 3 Special Edition"] }],
        variants: [
          { variantName: "White", sku: "SKU-TOYS-003-V1", color: "White", stockQuantity: 25, imageUrl: IMAGES.TOYS[4], images: [IMAGES.TOYS[4]] },
          { variantName: "Neon Blue/Neon Red", sku: "SKU-TOYS-003-V2", color: "Red", stockQuantity: 25, imageUrl: IMAGES.TOYS[4], images: [IMAGES.TOYS[4]] },
          { variantName: "Splatoon 3 Special Edition", sku: "SKU-TOYS-003-V3", color: "Yellow", stockQuantity: 10, additionalPrice: 10, imageUrl: IMAGES.TOYS[4], images: [IMAGES.TOYS[4]] },
        ],
      },
      {
        name: "Hasbro Monopoly Classic Board Game",
        sku: "SKU-TOYS-004",
        imageUrl: IMAGES.TOYS[1],
        images: [IMAGES.TOYS[1], IMAGES.TOYS[8]],
        description: "The world's favourite family board game. Buy, sell, and trade properties as you travel around the board. The player with the most wealth wins! Includes gameboard, 8 tokens, 28 title deed cards, 16 Chance & 16 Community Chest cards, 2 dice, money pack, houses, hotels. For 2–6 players, ages 8+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 100,
        costPrice: 15,
        sellingPrice: 29,
        variants: [
          { variantName: "Classic Edition", sku: "SKU-TOYS-004-V1", stockQuantity: 70, imageUrl: IMAGES.TOYS[1], images: [IMAGES.TOYS[1]] },
          { variantName: "Cheater's Edition", sku: "SKU-TOYS-004-V2", stockQuantity: 30, additionalPrice: 5, imageUrl: IMAGES.TOYS[1], images: [IMAGES.TOYS[1]] },
        ],
      },
      {
        name: "Hasbro Scrabble Original Word Game",
        sku: "SKU-TOYS-005",
        imageUrl: IMAGES.TOYS[8],
        images: [IMAGES.TOYS[8], IMAGES.TOYS[1]],
        description: "The classic crossword board game for family game nights. 100 letter tiles, 4 tile racks, 2 canvas bags, 1 timer, 1 gameboard. Players create words on the board to score points based on letter values and premium squares. For 2–4 players, ages 10+. Average play time: 90 minutes.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 80,
        costPrice: 15,
        sellingPrice: 29,
        variants: [
          { variantName: "Standard Edition", sku: "SKU-TOYS-005-V1", stockQuantity: 80, imageUrl: IMAGES.TOYS[8], images: [IMAGES.TOYS[8]] },
        ],
      },
      {
        name: "Nerf Elite 2.0 Commander RD-6 Blaster",
        sku: "SKU-TOYS-006",
        imageUrl: IMAGES.TOYS[5],
        images: [IMAGES.TOYS[5], IMAGES.TOYS[8]],
        description: "The Nerf Elite 2.0 Commander RD-6 blaster fires darts up to 27m away. Rotating drum holds 6 Elite darts. Removable stock, barrel, and 2 tactical rails for customization with other Nerf accessories (sold separately). Includes 12 Official Nerf Elite darts. For ages 8+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 80,
        costPrice: 15,
        sellingPrice: 28,
        options: [{ name: "Color", values: ["Orange/White", "Blue/White"] }],
        variants: [
          { variantName: "Orange/White", sku: "SKU-TOYS-006-V1", color: "Orange", stockQuantity: 50, imageUrl: IMAGES.TOYS[5], images: [IMAGES.TOYS[5]] },
          { variantName: "Blue/White", sku: "SKU-TOYS-006-V2", color: "Blue", stockQuantity: 30, imageUrl: IMAGES.TOYS[5], images: [IMAGES.TOYS[5]] },
        ],
      },
      {
        name: "Catan Board Game (5th Edition)",
        sku: "SKU-TOYS-007",
        imageUrl: IMAGES.TOYS[1],
        images: [IMAGES.TOYS[1], IMAGES.TOYS[8]],
        description: "The world's best-selling strategy board game. Settle the island of Catan by collecting and trading resources to build roads, settlements, and cities. For 3–4 players, ages 10+. Average play time: 60–120 minutes. Updated 5th edition with refreshed artwork and revised rulebook for clarity.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 70,
        costPrice: 30,
        sellingPrice: 55,
        variants: [
          { variantName: "5th Edition – Standard", sku: "SKU-TOYS-007-V1", stockQuantity: 50, imageUrl: IMAGES.TOYS[1], images: [IMAGES.TOYS[1]] },
          { variantName: "5th Edition – Travel Size", sku: "SKU-TOYS-007-V2", stockQuantity: 20, additionalPrice: 10, imageUrl: IMAGES.TOYS[1], images: [IMAGES.TOYS[1]] },
        ],
      },
      {
        name: "LEGO Creator Expert Botanical Collection – Dried Flower Centrepiece (10314)",
        sku: "SKU-TOYS-008",
        imageUrl: IMAGES.TOYS[0],
        images: [IMAGES.TOYS[0], IMAGES.TOYS[1]],
        description: "Build and display 8 different dried botanicals including rose, lavender, pampas grass, eucalyptus, and more. 812 pieces with realistic detailing and authentic colour pallet. Comes with a display plaque and ribbon for gifting. A relaxing creative experience and elegant home décor piece. Ages 18+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["LEGO"],
        quantity: 40,
        costPrice: 42,
        sellingPrice: 79,
        variants: [
          { variantName: "Standard Set", sku: "SKU-TOYS-008-V1", stockQuantity: 40, imageUrl: IMAGES.TOYS[0], images: [IMAGES.TOYS[0]] },
        ],
      },
      {
        name: "1:16 Remote Control 4WD Rock Crawler Truck",
        sku: "SKU-TOYS-009",
        imageUrl: IMAGES.TOYS[2],
        images: [IMAGES.TOYS[2], IMAGES.TOYS[8]],
        description: "High-performance 1:16 scale RC rock crawler with all-wheel drive, independent suspension, and rubber-grip tyres. 2.4GHz interference-free remote control with up to 50m range. Top speed: 15 km/h. Rechargeable 7.4V 1200mAh Li-ion battery, 40-minute run time. Ages 8+.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 60,
        costPrice: 28,
        sellingPrice: 59,
        options: [{ name: "Color", values: ["Army Green", "Desert Orange", "Black"] }],
        variants: [
          { variantName: "Army Green", sku: "SKU-TOYS-009-V1", color: "Green", stockQuantity: 25, imageUrl: IMAGES.TOYS[2], images: [IMAGES.TOYS[2]] },
          { variantName: "Desert Orange", sku: "SKU-TOYS-009-V2", color: "Orange", stockQuantity: 20, imageUrl: IMAGES.TOYS[2], images: [IMAGES.TOYS[2]] },
          { variantName: "Black", sku: "SKU-TOYS-009-V3", color: "Black", stockQuantity: 15, imageUrl: IMAGES.TOYS[2], images: [IMAGES.TOYS[2]] },
        ],
      },
      {
        name: "Play-Doh Ultimate Color Collection (65-Pack)",
        sku: "SKU-TOYS-010",
        imageUrl: IMAGES.TOYS[7],
        images: [IMAGES.TOYS[7], IMAGES.TOYS[8]],
        description: "The ultimate Play-Doh colour collection with 65 unique non-toxic colours including neons, glitters, and classic shades. Each 1-oz can is resealable to keep dough fresh. Made with wheat. Safe and certified by ASTM International. For ages 2+. Great for imaginative play and developing fine motor skills.",
        category: cat["TOYS"],
        supplier: sup["KidZone Wholesale"],
        brand: brand["Hasbro"],
        quantity: 80,
        costPrice: 18,
        sellingPrice: 34,
        variants: [
          { variantName: "65 Colour Pack", sku: "SKU-TOYS-010-V1", stockQuantity: 80, imageUrl: IMAGES.TOYS[7], images: [IMAGES.TOYS[7]] },
        ],
      },
    ];

    const insertedProducts: any[] = [];
    for (const p of productsData) {
      insertedProducts.push(await Product.create(p));
    }

    const find = (sku: string) =>
      insertedProducts.find((p) => p.sku === sku)._id;

    // ── 6. Promotions ──────────────────────────────────────────────────────
    console.log("🎉 Seeding Promotions...");
    const now = new Date();
    const nextWeek = new Date(now); nextWeek.setDate(now.getDate() + 7);
    const nextMonth = new Date(now); nextMonth.setMonth(now.getMonth() + 1);
    const twoMonths = new Date(now); twoMonths.setMonth(now.getMonth() + 2);

    const promotionsData = [
      { name: "MacBook Spring Sale", description: "10% off MacBook Pro M3", discountType: "PERCENTAGE", discountValue: 10, startDate: now, endDate: nextMonth, product: find("SKU-ELEC-001") },
      { name: "iPhone 15 Pro Max Deal", description: "$150 off iPhone 15 Pro Max", discountType: "FIXED_AMOUNT", discountValue: 150, startDate: now, endDate: nextWeek, product: find("SKU-ELEC-002") },
      { name: "AirPods Flash Sale", description: "15% off AirPods Pro 2nd Gen", discountType: "PERCENTAGE", discountValue: 15, startDate: now, endDate: nextWeek, product: find("SKU-ELEC-003") },
      { name: "Samsung Galaxy Promo", description: "$150 off Samsung Galaxy S24 Ultra", discountType: "FIXED_AMOUNT", discountValue: 150, startDate: now, endDate: nextMonth, product: find("SKU-ELEC-004") },
      { name: "Nike AF1 Summer Clearance", description: "20% off Nike Air Force 1 '07", discountType: "PERCENTAGE", discountValue: 20, startDate: now, endDate: nextMonth, product: find("SKU-CLOTH-001") },
      { name: "Adidas Ultraboost Deal", description: "$40 off Adidas Ultraboost 23", discountType: "FIXED_AMOUNT", discountValue: 40, startDate: now, endDate: nextMonth, product: find("SKU-CLOTH-004") },
      { name: "Dyson Vacuum Bundle", description: "10% off Dyson V15 Detect", discountType: "PERCENTAGE", discountValue: 10, startDate: now, endDate: twoMonths, product: find("SKU-HOME-003") },
      { name: "KitchenAid Spring Deal", description: "$70 off KitchenAid Artisan Stand Mixer", discountType: "FIXED_AMOUNT", discountValue: 70, startDate: now, endDate: nextMonth, product: find("SKU-HOME-004") },
      { name: "Gym Starter Bundle", description: "$60 off Bowflex SelectTech Dumbbells", discountType: "FIXED_AMOUNT", discountValue: 60, startDate: now, endDate: nextMonth, product: find("SKU-SPORT-001") },
      { name: "DJI Mini 4 Promo", description: "Save $100 on DJI Mini 4 Pro", discountType: "FIXED_AMOUNT", discountValue: 100, startDate: now, endDate: nextWeek, product: find("SKU-SPORT-004") },
      { name: "Skincare Glow Sale", description: "25% off L'Oréal Vitamin C Serum", discountType: "PERCENTAGE", discountValue: 25, startDate: now, endDate: twoMonths, product: find("SKU-BEAUTY-001") },
      { name: "Dyson Hair Sale", description: "15% off Dyson Airwrap", discountType: "PERCENTAGE", discountValue: 15, startDate: now, endDate: nextMonth, product: find("SKU-BEAUTY-003") },
      { name: "Coffee Lover Deal", description: "Buy more save more – Nescafé Gold", discountType: "PERCENTAGE", discountValue: 15, startDate: now, endDate: nextMonth, product: find("SKU-FOOD-001") },
      { name: "LEGO Technic Promo", description: "20% off LEGO Technic McLaren F1", discountType: "PERCENTAGE", discountValue: 20, startDate: now, endDate: nextMonth, product: find("SKU-TOYS-001") },
      { name: "Nintendo Switch Deal", description: "$30 off Nintendo Switch OLED", discountType: "FIXED_AMOUNT", discountValue: 30, startDate: now, endDate: nextWeek, product: find("SKU-TOYS-003") },
    ];
    for (const p of promotionsData) await Promotion.create(p);

    // ── 7. Banners ─────────────────────────────────────────────────────────
    console.log("🖼️  Seeding Banners...");
    const bannersData = [
      {
        title: "iPhone 15 Pro Max – Titanium Power.",
        description: "The most powerful iPhone ever. $150 off, this week only.",
        imageUrl: IMAGES.BANNERS[4],
        images: [IMAGES.BANNERS[4], IMAGES.BANNERS[0]],
        linkUrl: "/products/" + find("SKU-ELEC-002"),
        displayOrder: 1,
        status: "ACTIVE",
      },
      {
        title: "Summer Style Arrivals",
        description: "Nike, Adidas, Levi's & more – up to 20% off.",
        imageUrl: IMAGES.BANNERS[3],
        images: [IMAGES.BANNERS[3], IMAGES.BANNERS[0]],
        linkUrl: "/products/" + find("SKU-CLOTH-001"),
        displayOrder: 2,
        status: "ACTIVE",
      },
      {
        title: "Upgrade Your Home",
        description: "KitchenAid, Dyson, Philips – smart living starts here.",
        imageUrl: IMAGES.BANNERS[1],
        images: [IMAGES.BANNERS[1], IMAGES.BANNERS[0]],
        linkUrl: "/products/" + find("SKU-HOME-004"),
        displayOrder: 3,
        status: "ACTIVE",
      },
      {
        title: "Glow Up This Season",
        description: "CeraVe, L'Oréal, Dyson – skin, hair & beauty essentials.",
        imageUrl: IMAGES.BANNERS[0],
        images: [IMAGES.BANNERS[0], IMAGES.BANNERS[1]],
        linkUrl: "/products/" + find("SKU-BEAUTY-001"),
        displayOrder: 4,
        status: "ACTIVE",
      },
      {
        title: "Train Harder. Recover Faster.",
        description: "Bowflex, Garmin, Theragun & Nike – performance gear on sale.",
        imageUrl: IMAGES.BANNERS[2],
        images: [IMAGES.BANNERS[2], IMAGES.BANNERS[0]],
        linkUrl: "/products/" + find("SKU-SPORT-001"),
        displayOrder: 5,
        status: "ACTIVE",
      },
      {
        title: "Taste the Finest",
        description: "Lindt, Manuka Honey, KIND & Harney & Sons – premium food for less.",
        imageUrl: IMAGES.BANNERS[5],
        images: [IMAGES.BANNERS[5], IMAGES.BANNERS[0]],
        linkUrl: "/products/" + find("SKU-FOOD-002"),
        displayOrder: 6,
        status: "ACTIVE",
      },
    ];
    for (const b of bannersData) await Banner.create(b);

    // ── 8. Reviews ─────────────────────────────────────────────────────────
    console.log("⭐ Seeding Reviews...");

    // Helpers
    const findProd  = (sku: string)   => insertedProducts.find((p: any) => p.sku === sku)?._id;
    const findUser  = (email: string) => insertedUsers.find((u: any) => u.email === email)?._id;
    const findName  = (email: string) => insertedUsers.find((u: any) => u.email === email)?.fullName ?? email;

    const reviewsData = [
      // MacBook Pro M3
      { product: findProd('SKU-ELEC-001'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'Absolute beast of a laptop',       body: 'I moved from an Intel MacBook Pro and the M3 difference is night and day. Compiles my entire project in under 20 seconds. Battery easily lasts a full work day. Space Black looks stunning.', helpful: 24 },
      { product: findProd('SKU-ELEC-001'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 4, title: 'Great laptop, minor quirks',        body: 'Performance is incredible and the display is gorgeous. Only giving 4 stars because the notch still feels dated and base config needs more RAM for heavy Xcode projects.', helpful: 11 },
      { product: findProd('SKU-ELEC-001'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 5, title: 'Best purchase of the year',        body: 'As a video editor, the ProRes acceleration alone justifies the price. Export times dropped by 60%. MagSafe is so convenient.', helpful: 17 },
      // iPhone 15 Pro Max
      { product: findProd('SKU-ELEC-002'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 5, title: 'Best iPhone ever made',            body: 'The titanium frame feels premium without being heavy. Camera quality is unreal — 5x telephoto is a game changer for travel photography. USB-C is finally here!', helpful: 32 },
      { product: findProd('SKU-ELEC-002'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 4, title: 'Incredible camera, battery ok',   body: 'A17 Pro flies through everything. The camera system is the best on any phone. Battery drains faster when using ProRes video though.', helpful: 8 },
      { product: findProd('SKU-ELEC-002'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'Worth every penny',               body: 'Coming from Samsung, the ecosystem integration is incredible. Action button is super useful. Natural Titanium does not show fingerprints.', helpful: 14 },
      // AirPods Pro 2nd Gen
      { product: findProd('SKU-ELEC-003'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'ANC is absolutely incredible',     body: 'Wore these on a 14-hour flight and barely heard the engine. Adaptive Audio is the killer feature. Battery life is honest too.', helpful: 29 },
      { product: findProd('SKU-ELEC-003'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 4, title: 'Great but pricey',                body: 'Sound quality and ANC are top tier. Personalized Spatial Audio works well. Still the best wireless earbuds on the market.', helpful: 6 },
      // Samsung Galaxy S24 Ultra
      { product: findProd('SKU-ELEC-004'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 5, title: 'Galaxy AI is actually useful',   body: 'Live translation and note-taking features are impressive. S Pen feels refined. 100x zoom is a party trick but useful in the right situations.', helpful: 19 },
      { product: findProd('SKU-ELEC-004'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 3, title: 'Too big for daily use',          body: 'Brilliant hardware but it is a brick. The AI features feel gimmicky after the first week. Great for productivity, bad as a phone.', helpful: 7 },
      // Sony WH-1000XM5
      { product: findProd('SKU-ELEC-005'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'Silence has never sounded so good', body: 'Work from a co-working space — these are a must. XM5 is lighter, better call quality, and even better ANC than the XM4.', helpful: 21 },
      { product: findProd('SKU-ELEC-005'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 4, title: 'Fantastic daily driver',          body: 'Comfortable for 4+ hour sessions. Multipoint pairing between laptop and phone works flawlessly.', helpful: 13 },
      // LG OLED C3
      { product: findProd('SKU-ELEC-010'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'OLED changed how I watch TV',     body: 'Came from a QLED and the contrast difference is shocking. Perfect blacks make HDR content look insane. Gaming at 4K 120fps on PS5 is butter smooth.', helpful: 41 },
      { product: findProd('SKU-ELEC-010'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 4, title: 'Stunning picture, so-so sound',  body: 'Picture quality is beyond compare but built-in speakers sound thin. Recommend pairing with a soundbar. Otherwise 5 stars.', helpful: 16 },
      // Apple Watch Series 9
      { product: findProd('SKU-ELEC-009'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 5, title: 'My favorite wearable by far',   body: 'Double Tap is genuinely useful. Health tracking is accurate and the always-on display is bright. Battery consistent at 18 hrs.', helpful: 22 },
      // Logitech MX Master 3S
      { product: findProd('SKU-ELEC-011'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 5, title: 'The only mouse you will ever need', body: 'Used this for 8 months across Mac and Windows. MagSpeed wheel is the best feature — silent and precise. The side scroll wheel is underrated.', helpful: 33 },
      // GoPro HERO12
      { product: findProd('SKU-ELEC-012'), user: findUser('customer@gmail.com'), userName: findName('customer@gmail.com'), rating: 5, title: 'Incredible stabilization',        body: 'HyperSmooth 6.0 is witchcraft. Mounted on my mountain bike helmet and footage is cinema-smooth. Bring a spare battery though.', helpful: 18 },
      // Nike Air Force 1
      { product: findProd('SKU-CLOTH-001'), user: findUser('jane@gmail.com'),    userName: findName('jane@gmail.com'),     rating: 5, title: 'A classic for a reason',         body: 'My 5th pair of Air Force 1s. Triple white colorway goes with everything. Sizing was true to form. Very happy.', helpful: 35 },
      { product: findProd('SKU-CLOTH-001'), user: findUser('customer@gmail.com'),userName: findName('customer@gmail.com'), rating: 4, title: 'Comfortable but creases quickly', body: 'Love the silhouette and comfort. The leather creases after a few wears though. Minor issue at this price point.', helpful: 9 },
      // Nike Tech Fleece Hoodie
      { product: findProd('SKU-CLOTH-002'), user: findUser('jane@gmail.com'),    userName: findName('jane@gmail.com'),     rating: 5, title: 'Worth the premium price',        body: 'Third Nike Tech Fleece hoodie. Warm but not heavy. Carbon Heather is the color to get. Wash inside out to keep the color.', helpful: 12 },
      { product: findProd('SKU-CLOTH-002'), user: findUser('customer@gmail.com'),userName: findName('customer@gmail.com'), rating: 3, title: 'Quality good, sizing runs small', body: 'Fabric and finish are premium. I normally wear a Medium and this fits like a Small. Size up for a relaxed fit.', helpful: 5 },
      // Adidas Ultraboost 23
      { product: findProd('SKU-CLOTH-004'), user: findUser('david@gmail.com'),   userName: findName('david@gmail.com'),    rating: 5, title: 'Best running shoes I have owned', body: 'Run 30+ miles a week and the Ultraboost 23 is the most comfortable shoe I have put on my feet. Sizing runs slightly narrow.', helpful: 28 },
      // iPad Pro 12.9 M2
      { product: findProd('SKU-ELEC-008'), user: findUser('jane@gmail.com'),     userName: findName('jane@gmail.com'),     rating: 5, title: 'Replaced my laptop for drawing',  body: 'As an illustrator, the ProMotion display with Apple Pencil 2 is unmatched. Zero latency, perfect palm rejection.', helpful: 26 },
      // Dell XPS 15
      { product: findProd('SKU-ELEC-007'), user: findUser('david@gmail.com'),    userName: findName('david@gmail.com'),    rating: 4, title: 'Best Windows laptop I have used',  body: 'OLED display is stunning for photo editing. RTX 4060 handles all 3D workloads. Fan noise under sustained load is louder than expected though.', helpful: 14 },
    ];

    const validReviews = reviewsData.filter(r => r.product && r.user);
    for (const r of validReviews) await new Review(r).save();

    console.log(`\n🎊 Database Seeding Complete!`);
    console.log(`   👤 Users:      ${users.length}`);
    console.log(`   🏭 Suppliers:  ${suppliersData.length}`);
    console.log(`   🏷️  Brands:     ${brandsData.length}`);
    console.log(`   📂 Categories: ${categoriesData.length}`);
    console.log(`   📦 Products:   ${productsData.length}`);
    console.log(`   🎉 Promotions: ${promotionsData.length}`);
    console.log(`   🖼️  Banners:    ${bannersData.length}`);
    console.log(`   ⭐ Reviews:    ${validReviews.length}`);
    process.exit(0);
  } catch (e) {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  }
}

seedData();