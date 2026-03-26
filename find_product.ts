import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "./src/models/Product";

async function findProduct() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const product = await Product.findOne({ name: /Adidas Tiro Track Jacket/i });
    if (product) {
       console.log("Found Product:");
       console.log(`  Name: ${product.name}`);
       console.log(`  _id: ${product._id}`);
       console.log(`  sellingPrice: ${product.sellingPrice}`);
       console.log(`  description: ${product.description ? 'PRESENT' : 'MISSING'}`);
    } else {
       console.log("Product NOT FOUND");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

findProduct();
