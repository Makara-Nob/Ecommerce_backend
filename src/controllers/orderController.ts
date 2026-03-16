import { Order, OrderItem } from "../models/Order";
import { Cart, CartItem } from "../models/Cart";
import { Product } from "../models/Product";
import { protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import {
  getCheckoutPayload,
  verifyWebhookHash,
  checkAbaTransaction,
  ABA_PAYWAY_API_URL,
} from "../utils/abaPayway";
import User from "../models/User";

export default function (appRouter: Router) {
  // @desc    Create new order from cart
  // @route   POST /api/v1/orders
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders:
   *   post:
   *     summary: Create new order
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     description: Create a new order from the user's active cart
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - shippingAddress
   *             properties:
   *               shippingAddress:
   *                 type: string
   *               paymentMethod:
   *                 type: string
   *               note:
   *                 type: string
   *     responses:
   *       201:
   *         description: Order created
   *       400:
   *         description: Shipping address is required, Cart is empty, or out of stock
   *       401:
   *         description: Not authorized
   */
  appRouter.post(
    "/api/v1/orders",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const { shippingAddress, paymentMethod, note } =
          await appRouter.parseJsonBody(req);

        if (!shippingAddress) {
          return appRouter.sendResponse(res, 400, {
            message: "Shipping address is required",
          });
        }

        // 1. Get active cart
        const cart = await Cart.findOne({ userId, status: "ACTIVE" }).populate(
          "items",
        );

        if (!cart || cart.items.length === 0) {
          return appRouter.sendResponse(res, 400, { message: "Cart is empty" });
        }

        // 2. Validate stock and calculate final amounts
        let totalAmount = 0;
        const orderItems = [];

        for (let cartItemId of cart.items) {
          // Need to refetch in case items property contains plain ObjectIds instead of populated objects
          const item = await CartItem.findById(cartItemId);
          if (!item) continue;

          const product = await Product.findById(item.product);

          if (!product || product.quantity < item.quantity) {
            return appRouter.sendResponse(res, 400, {
              message: `Product ${product ? product.name : item.product} is out of stock or requested quantity exceeds available stock.`,
            });
          }

          // Deduct stock immediately
          product.quantity -= item.quantity;
          await product.save();

          // Add to order items
          orderItems.push({
            product: product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subTotal: item.subTotal,
          });

          totalAmount += item.subTotal;
        }

        // 3. Create the order
        const discountAmount = 0; // Can implement coupons later
        const netAmount = totalAmount - discountAmount;

        let paywayTranId;
        if (paymentMethod === "ABA_PAYWAY") {
          const dt = new Date();
          const randomStr = Math.floor(
            100000 + Math.random() * 900000,
          ).toString();
          paywayTranId =
            dt.getFullYear().toString() +
            (dt.getMonth() + 1).toString().padStart(2, "0") +
            dt.getDate().toString().padStart(2, "0") +
            randomStr;
        }

        const order = await Order.create({
          userId,
          totalAmount,
          discountAmount,
          netAmount,
          status: "PENDING",
          paymentMethod: paymentMethod || "CASH",
          shippingAddress,
          note,
          items: orderItems,
          ...(paywayTranId && { paywayTranId }),
        });

        // 4. Clear the cart
        cart.status = "CHECKED_OUT";
        await cart.save();

        // Also clear cart items to keep DB clean
        await CartItem.deleteMany({ cartId: cart.id });

        let responseData: any = order.toObject ? order.toObject() : order;

        if (paymentMethod === "ABA_PAYWAY") {
          const user = await User.findById(userId);
          const fallbackNames =
            user && user.fullName ? user.fullName.split(" ") : ["Customer", ""];
          const firstname = fallbackNames[0];
          const lastname = fallbackNames.slice(1).join(" ") || "";
          const email = user ? user.email : "";

          // In a real application we would populate the actual product names for the items
          // Since we only have ids here without full product object, we will use generic names
          // Actually, we fetched the product earlier in the loop, but we only saved its id.
          const paywayItems = orderItems.map((i: any) => ({
            name: `Product_${i.product}`,
            quantity: i.quantity,
            price: parseFloat(i.unitPrice).toFixed(2),
          }));

          const paywayPayload = getCheckoutPayload({
            tran_id: paywayTranId,
            amount: netAmount,
            items: paywayItems,
            firstname,
            lastname,
            email,
            phone: "",
          });

          responseData = {
            order: responseData,
            paywayPayload,
            paywayApiUrl: ABA_PAYWAY_API_URL,
          };
        }

        appRouter.sendResponse(res, 201, responseData);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

  // @desc    Get logged in user orders
  // @route   GET /api/v1/orders/my-orders
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders/my-orders:
   *   get:
   *     summary: Get logged in user orders
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     description: Retrieve all orders for the currently logged in user
   *     responses:
   *       200:
   *         description: List of orders
   *       401:
   *         description: Not authorized
   */
  appRouter.get(
    "/api/v1/orders/my-orders",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const orders = await Order.find({ userId })
          .sort("-createdAt")
          .populate({
            path: "items.product",
            model: "Product",
            select: "id name sku imageUrl",
          });

        appRouter.sendResponse(res, 200, orders);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

  // @desc    Get order by ID
  // @route   GET /api/v1/orders/:id
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders/{id}:
   *   get:
   *     summary: Get order by ID
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     description: Retrieve specific order details by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: The order ID
   *     responses:
   *       200:
   *         description: Order details
   *       401:
   *         description: Not authorized
   *       403:
   *         description: Not authorized to view this order
   *       404:
   *         description: Order not found
   */
  appRouter.get(
    "/api/v1/orders/:id",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const order = await Order.findById(req.params.id).populate({
          path: "items.product",
          model: "Product",
          select: "id name sku imageUrl price sellingPrice",
        });

        if (order) {
          // Enforce ownership
          if (order.userId !== userId) {
            return appRouter.sendResponse(res, 403, {
              message: "Not authorized to view this order",
            });
          }
          appRouter.sendResponse(res, 200, order);
        } else {
          appRouter.sendResponse(res, 404, { message: "Order not found" });
        }
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

  // @desc    Check payment status manually
  // @route   POST /api/v1/orders/:id/check-payment
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders/{id}/check-payment:
   *   post:
   *     summary: Check payment status manually
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     description: Manually trigger a check against ABA Payway check-transaction-2 API
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *       - schema:
   *           type: string
   *         description: The order DB ID
   *     responses:
   *       200:
   *         description: Check completed successfully
   */
  appRouter.post(
    "/api/v1/orders/:id/check-payment",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const order = await Order.findById(req.params.id);

        if (!order) {
          return appRouter.sendResponse(res, 404, { message: "Order not found" });
        }
        if (order.userId !== userId) {
          return appRouter.sendResponse(res, 403, { message: "Not authorized" });
        }
        if (!order.paywayTranId) {
          return appRouter.sendResponse(res, 400, { message: "Order does not have an ABA transaction ID" });
        }

        // Call ABA Check Transaction API
        const abaResponse = await checkAbaTransaction(order.paywayTranId);

        // Update local DB if status from ABA means completed or cancelled
        // Status "0" = Success
        if (abaResponse.status === 0 && order.status === "PENDING") {
          order.status = "CONFIRMED";
          order.paywayStatus = "APPROVED";
          await order.save();
        } else if (abaResponse.status !== 0 && abaResponse.status !== 1 && order.status === "PENDING") {
           // Depending on ABA status codes, you might cancel it here if explicitly failed.
           // Usually 1 is pending/created, 0 is success. 
        }

        appRouter.sendResponse(res, 200, { 
          message: "Check completed", 
          abaResponse, 
          order 
        });

      } catch (e: any) {
        console.error(e);
        appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
      }
    }
  );

  // @desc    ABA PayWay Webhook callback
  // @route   POST /api/v1/orders/payway-webhook
  // @access  Public
  /**
   * @swagger
   * /api/v1/orders/payway-webhook:
   *   post:
   *     summary: ABA PayWay Webhook callback
   *     tags: [Orders]
   *     description: S2S callback from ABA PayWay to update order status
   *     responses:
   *       200:
   *         description: Webhook processed
   */
  appRouter.post(
    "/api/v1/orders/payway-webhook",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        // ABA usually sends data in form-data or JSON, depending on config.
        // Assuming JSON body for the structure, or wait, ABA Payway sends form application/x-www-form-urlencoded
        const bodyContent = await appRouter.parseJsonBody(req);

        let payload: any = {};
        if (typeof bodyContent === "string") {
          // Parse url-encoded string
          const parsed = new URLSearchParams(bodyContent);
          parsed.forEach((value, key) => {
            payload[key] = value;
          });
        } else {
          payload = bodyContent;
        }

        const tran_id = payload.tran_id;
        const apv = payload.apv || ""; // approval code
        const status = payload.status; // 0 for success
        const hash = payload.hash;

        console.log(
          `[ABA Webhook] Received status ${status} for tran_id ${tran_id}`,
        );

        if (tran_id) {
          const isValid = verifyWebhookHash(tran_id, status, hash); // <- fixed

          if (!isValid) {
            return appRouter.sendResponse(res, 400, {
              message: "Invalid hash signature",
            });
          }

          const order = await Order.findOne({ paywayTranId: tran_id });
          if (order) {
            if (status === "0") {
              order.status = "CONFIRMED";
              order.paywayStatus = "APPROVED";
            } else {
              order.status = "CANCELLED";
              order.paywayStatus = `DECLINED_${status}`;

              // Restock items
              for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product) {
                  product.quantity += item.quantity;
                  await product.save();
                }
              }
            }
            await order.save();
          } else {
            console.error(
              `[ABA Webhook] Order with tran_id ${tran_id} not found`,
            );
          }
        }

        // Must respond HTTP 200 to acknowledge receipt to ABA
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" }));
      } catch (e: any) {
        console.error("[ABA Webhook] Error:", e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            status: "error",
            message: e.message || "Server Error",
          }),
        );
      }
    },
  );
}
