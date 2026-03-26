import "dotenv/config";
import mongoose from "mongoose";
import { Product } from "./src/models/Product";
import { Promotion } from "./src/models/Promotion";
import { getCurrentPrice } from "./src/utils/promotionUtils";

async function verifyPromotionPrice() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const currentDate = new Date();
    
    // Find an active promotion
    const activePromotion = await Promotion.findOne({
        status: 'ACTIVE',
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate }
    }).populate('product');

    if (!activePromotion) {
        console.log("No active promotions found for testing.");
        process.exit(0);
    }

    const product = await Product.findById(activePromotion.product);
    if (!product) {
        console.log("Product not found for promotion.");
        process.exit(0);
    }

    console.log(`Testing Product: ${product.name} (ID: ${product._id})`);
    console.log(`Base Price: ${product.sellingPrice}`);
    console.log(`Promotion: ${activePromotion.name}`);
    console.log(`Discount: ${activePromotion.discountType} ${activePromotion.discountValue}`);

    const calculatedPrice = await getCurrentPrice(product);
    
    let expectedPrice = product.sellingPrice;
    if (activePromotion.discountType === 'PERCENTAGE') {
        expectedPrice = product.sellingPrice - (product.sellingPrice * activePromotion.discountValue / 100);
    } else {
        expectedPrice = product.sellingPrice - activePromotion.discountValue;
    }

    console.log(`Expected Price: ${expectedPrice}`);
    console.log(`Calculated Price: ${calculatedPrice}`);

    if (Math.abs(calculatedPrice - expectedPrice) < 0.01) {
        console.log("✅ Price calculation logic is CORRECT");
    } else {
        console.log("❌ Price calculation logic is INCORRECT");
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

verifyPromotionPrice();
