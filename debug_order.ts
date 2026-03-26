import "dotenv/config";
import mongoose from "mongoose";
import { Order } from "./src/models/Order";
import "./src/models/Product";

async function debugOrder() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    const order = await Order.findById(83).populate({
          path: "items.product",
          model: "Product",
          select: "_id name sku description sellingPrice costPrice qty quantity minStock status viewCount imageUrl images variants category brand supplier",
          populate: [
            { path: 'category', select: '_id name description' },
            { path: 'brand', select: '_id name description logoUrl' }
          ]
    });
    
    if (order) {
       console.log("Order Found:");
       const orderObj = order.toObject();
       const item = orderObj.items[0];
       console.log("Item Product Data:");
       console.log(JSON.stringify(item.product, null, 2));
    } else {
       console.log("Order 83 not found");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

debugOrder();
