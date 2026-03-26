import "dotenv/config";
import mongoose from "mongoose";
import { Promotion } from "./src/models/Promotion";
import "./src/models/Product"; 

async function verifyFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const currentDate = new Date();
    
    // Exact same logic as the fixed controller
    const promotions = await Promotion.find({
        status: 'ACTIVE',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
    })
    .populate({
        path: 'product',
        select: '_id name description sellingPrice costPrice variants imageUrl images sku category brand supplier',
        populate: [
            { path: 'category', select: '_id name description' },
            { path: 'brand', select: '_id name description logoUrl' }
        ]
    })
    .sort({ endDate: 1 });

    console.log("Found " + promotions.length + " active promotions\n");
    
    promotions.forEach((p: any) => {
      const pObj = p.toObject();
      const product = pObj.product;
      console.log(`Promotion: ${p.name}`);
      if (product) {
        console.log(`  Product: ${product.name}`);
        console.log(`  Selling Price: ${product.sellingPrice}`);
        console.log(`  Description: ${product.description ? 'PRESENT' : 'MISSING'}`);
        console.log(`  _id: ${product._id}`);
        console.log(`  category: ${product.category ? 'POPULATED' : 'NOT POPULATED'}`);
      } else {
        console.log("  Product NOT POPULATED");
      }
      console.log('---');
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

verifyFix();
