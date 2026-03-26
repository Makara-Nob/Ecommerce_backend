import "dotenv/config";
import mongoose from "mongoose";
import { Order } from "./src/models/Order";
import { getCurrentPrice } from "./src/utils/promotionUtils";

async function fixRecentOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    
    // Fix Order #81 and #83 specifically
    const orderIds = [81, 83];
    
    for (const orderId of orderIds) {
        const order = await Order.findById(orderId);
        if (!order) {
            console.log(`Order ${orderId} not found.`);
            continue;
        }

        console.log(`Fixing Order #${orderId}...`);
        let newTotal = 0;

        for (const item of order.items) {
            const currentPrice = await getCurrentPrice(item.product as any);
            console.log(`  Product ${item.product}: ${item.unitPrice} -> ${currentPrice}`);
            item.unitPrice = currentPrice;
            item.subTotal = item.quantity * currentPrice;
            newTotal += item.subTotal;
        }

        order.totalAmount = newTotal;
        order.netAmount = newTotal - (order.discountAmount || 0);
        
        await order.save();
        console.log(`✅ Order #${orderId} updated. New Total: ${order.netAmount}`);
    }

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

fixRecentOrders();
