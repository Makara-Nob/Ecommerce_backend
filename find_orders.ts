import "dotenv/config";
import mongoose from "mongoose";
import { Order } from "./src/models/Order";

async function findOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const orders = await Order.find({ "items.product": 16 });
    console.log(`Found ${orders.length} orders containing product 16\n`);
    
    orders.forEach(order => {
      console.log(`Order ID: ${order._id}`);
      console.log(`Status: ${order.status}`);
      const item = order.items.find(i => i.product === 16);
      console.log(`  Item Product ID: ${item?.product}`);
      console.log(`  Item Unit Price: ${item?.unitPrice}`);
      console.log(`  Item Subtotal: ${item?.subTotal}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

findOrders();
