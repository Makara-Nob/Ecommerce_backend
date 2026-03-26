import { Order, OrderItem } from "../models/Order";
import { Cart, CartItem } from "../models/Cart";
import { Product } from "../models/Product";
import { protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import crypto from "crypto";

import {
  getCheckoutPayload,
  getCofPayload,
  verifyWebhookSignature,
  checkAbaTransaction,
  purchaseByToken,
  ABA_PAYWAY_API_URL,
  ABA_PAYWAY_COF_URL,
} from "../utils/abaPayway";
import User from "../models/User";
import { getCurrentPrice } from "../utils/promotionUtils";

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

          // Defer stock deduction until payment is confirmed via webhook.
          // Product quantity will only be reduced in /api/v1/orders/payway-webhook or token pay.

          // Re-verify price at checkout time
          const currentPrice = await getCurrentPrice(product);
          
          // Add to order items
          orderItems.push({
            product: product.id,
            quantity: item.quantity,
            unitPrice: currentPrice,
            subTotal: item.quantity * currentPrice,
          });

          totalAmount += (item.quantity * currentPrice);
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
            return_deeplink: process.env.ABA_RETURN_DEEPLINK || "",
            view_type: "hosted_view",
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
            select: "_id name sku description sellingPrice costPrice qty quantity minStock status viewCount imageUrl images variants category brand supplier",
            populate: [
              { path: 'category', select: '_id name description' },
              { path: 'brand', select: '_id name description logoUrl' }
            ]
          });

        const mappedOrders = orders.map(order => {
          const oObj = order.toObject();
          return {
            ...oObj,
            id: oObj._id,
            items: oObj.items.map((item: any) => ({
              ...item,
              id: item._id,
              product: item.product ? {
                ...item.product,
                id: item.product._id,
                category: item.product.category ? { ...item.product.category, id: item.product.category._id } : null,
                brand: item.product.brand ? { ...item.product.brand, id: item.product.brand._id } : null,
                supplier: item.product.supplier ? { ...item.product.supplier, id: item.product.supplier._id } : null,
                variants: item.product.variants ? item.product.variants.map((v: any) => ({ ...v, id: v._id })) : []
              } : null
            }))
          };
        });

        appRouter.sendResponse(res, 200, mappedOrders);
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
          select: "_id name sku description sellingPrice costPrice qty quantity minStock status viewCount imageUrl images variants category brand supplier",
          populate: [
            { path: 'category', select: '_id name description' },
            { path: 'brand', select: '_id name description logoUrl' }
          ]
        });

        if (order) {
          // Enforce ownership
          if (order.userId !== userId) {
            return appRouter.sendResponse(res, 403, {
              message: "Not authorized to view this order",
            });
          }
          const oObj = order.toObject();
          const mappedOrder = {
            ...oObj,
            id: oObj._id,
            items: oObj.items.map((item: any) => ({
              ...item,
              id: item._id,
              product: item.product ? {
                ...item.product,
                id: item.product._id,
                category: item.product.category ? { ...item.product.category, id: item.product.category._id } : null,
                brand: item.product.brand ? { ...item.product.brand, id: item.product.brand._id } : null,
                supplier: item.product.supplier ? { ...item.product.supplier, id: item.product.supplier._id } : null,
                variants: item.product.variants ? item.product.variants.map((v: any) => ({ ...v, id: v._id })) : []
              } : null
            }))
          };
          appRouter.sendResponse(res, 200, mappedOrder);
        } else {
          appRouter.sendResponse(res, 404, { message: "Order not found" });
        }
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

  // @desc    Get ABA PayWay payload for existing order
  // @route   POST /api/v1/orders/:id/payway-payload
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders/{id}/payway-payload:
   *   post:
   *     summary: Get PayWay payload for existing order
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               paymentOption:
   *                 type: string
   *                 example: abakhqr
   *     responses:
   *       200:
   *         description: Payload generated
   */
  appRouter.post(
    "/api/v1/orders/:id/payway-payload",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const { paymentOption } = await appRouter.parseJsonBody(req);

        const order = await Order.findById(req.params.id);
        if (!order) {
          return appRouter.sendResponse(res, 404, { message: "Order not found" });
        }
        if (order.userId !== userId) {
          return appRouter.sendResponse(res, 403, { message: "Not authorized" });
        }

        if (!order.paywayTranId) {
          const dt = new Date();
          const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
          order.paywayTranId =
            dt.getFullYear().toString() +
            (dt.getMonth() + 1).toString().padStart(2, "0") +
            dt.getDate().toString().padStart(2, "0") +
            randomStr;
          await order.save();
        }

        const user = await User.findById(userId);
        const fallbackNames = user && user.fullName ? user.fullName.split(" ") : ["Customer", ""];
        const firstname = fallbackNames[0];
        const lastname = fallbackNames.slice(1).join(" ") || "";
        const email = user ? user.email : "";

        const paywayItems = order.items.map((i: any) => ({
          name: `Product_${i.product}`,
          quantity: i.quantity,
          price: parseFloat(i.unitPrice).toFixed(2),
        }));

        let paywayPayload;
        let paywayApiUrl;

        if (paymentOption === "cards") {
          // Use refined Link Card (COF) flow
          paywayPayload = getCofPayload({
            ctid: userId,
            return_param: order.id,
            firstname,
            lastname,
            email,
            phone: "",
          });
          paywayApiUrl = ABA_PAYWAY_COF_URL;
        } else {
          // Standard Purchase flow for KHQR
          paywayPayload = getCheckoutPayload({
            tran_id: order.paywayTranId,
            amount: order.netAmount,
            items: paywayItems,
            firstname,
            lastname,
            email,
            phone: "",
            payment_option: paymentOption || "",
            return_deeplink: process.env.ABA_RETURN_DEEPLINK || "",
            view_type: "checkout",
          });
          paywayApiUrl = ABA_PAYWAY_API_URL;
        }

        appRouter.sendResponse(res, 200, {
          paywayPayload,
          paywayApiUrl,
        });

      } catch (e: any) {
        appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
      }
    }
  );

  // @desc    Initiate Link Card (CoF) for saving a card without purchase
  // @route   POST /api/v1/orders/link-card
  // @access  Private
  appRouter.post(
    "/api/v1/orders/link-card",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const user = await User.findById(userId);
        if (!user) return appRouter.sendResponse(res, 404, { message: "User not found" });

        const fallbackNames = user.fullName ? user.fullName.split(" ") : ["Customer", ""];
        const firstname = fallbackNames[0];
        const lastname = fallbackNames.slice(1).join(" ") || "";

        const cofPayload = getCofPayload({
          ctid: userId,
          return_param: `link_card_${userId}`, // distinguish from order CoF callbacks
          firstname,
          lastname,
          email: user.email,
          phone: user.phone || "",
        });

        const responsePayload = {
          cofPayload,
          cofApiUrl: ABA_PAYWAY_COF_URL,
        };

        console.log("[Link Card API] Returning Payload:", JSON.stringify(responsePayload, null, 2));

        appRouter.sendResponse(res, 200, responsePayload);
      } catch (e: any) {
        appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
      }
    }
  );

  // @desc    Pay for an order using a saved card token
  // @route   POST /api/v1/orders/:id/pay-by-token
  // @access  Private
  appRouter.post(
    "/api/v1/orders/:id/pay-by-token",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const { cardIndex } = await appRouter.parseJsonBody(req);

        const order = await Order.findById(req.params.id);
        if (!order) return appRouter.sendResponse(res, 404, { message: "Order not found" });
        if (order.userId !== userId) return appRouter.sendResponse(res, 403, { message: "Not authorized" });

        const user = await User.findById(userId);
        if (!user || !user.savedCards || user.savedCards.length === 0) {
          return appRouter.sendResponse(res, 400, { message: "No saved cards found" });
        }

        const card = user.savedCards[cardIndex];
        if (!card) return appRouter.sendResponse(res, 400, { message: "Card not found" });

        if (!order.paywayTranId) {
          const dt = new Date();
          const randomStr = Math.floor(100000 + Math.random() * 900000).toString();
          order.paywayTranId =
            dt.getFullYear().toString() +
            (dt.getMonth() + 1).toString().padStart(2, "0") +
            dt.getDate().toString().padStart(2, "0") +
            randomStr;
          await order.save();
        }

        const paywayItems = order.items.map((i: any) => ({
          name: `Product_${i.product}`,
          quantity: i.quantity,
          price: parseFloat(i.unitPrice).toFixed(2),
        }));

        const purchaseResult = await purchaseByToken({
          tran_id: order.paywayTranId,
          amount: order.netAmount,
          items: paywayItems,
          ctid: card.ctid,
          pwt: card.pwt,
          firstname: user.fullName?.split(' ')[0] || 'Customer',
          lastname: user.fullName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
        });

        const isSuccess =
          purchaseResult?.payment_status?.status === "0" ||
          purchaseResult?.status?.code === "00";

        if (isSuccess) {
          order.status = "CONFIRMED";
          order.paywayStatus = "APPROVED";
          await order.save();
          return appRouter.sendResponse(res, 200, { success: true, order });
        } else {
          return appRouter.sendResponse(res, 400, {
            success: false,
            message: purchaseResult?.payment_status?.description || purchaseResult?.status?.message || "Payment failed",
            raw: purchaseResult,
          });
        }
      } catch (e: any) {
        console.error("[pay-by-token]", e);
        appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
      }
    }
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

        // abaResponse.status.code "00" = API Success
        // abaResponse.data.payment_status_code 0 = Payment Success
        const isAbaSuccess =
          abaResponse.status &&
          abaResponse.status.code === "00" &&
          abaResponse.data &&
          abaResponse.data.payment_status_code === 0;

        if (isAbaSuccess && order.status === "PENDING") {
          order.status = "CONFIRMED";
          order.paywayStatus = "APPROVED";

          // Deduct stock upon successful payment check
          for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
              product.quantity -= item.quantity;
              await product.save();
            }
          }

          await order.save();
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
        const payload = await appRouter.parseJsonBody(req);
        const signature = req.headers["x-payway-hmac-sha512"] as string;

        if (!signature || !verifyWebhookSignature(payload, signature)) {
          console.error("[ABA Webhook] Invalid signature or missing header");
          return appRouter.sendResponse(res, 401, {
            message: "Invalid signature",
          });
        }

        const tran_id = payload.tran_id;
        const status = payload.status; // 0 for success

        console.log(
          `[ABA Webhook] Received status ${status} for tran_id ${tran_id}`,
        );
        console.log(`[ABA Webhook] Raw Payload:`, JSON.stringify(payload, null, 2));

        if (tran_id) {
          // Check if this is a Link Card (COF) callback by looking for pwt
          const returnParams = payload.return_params;
          const pwt = returnParams?.card_status?.pwt;

          if (pwt) {
            // Option #1: Link Card (COF) Flow
            const returnParamStr = String(returnParams.return_param || "");
            let orderUser: any = null;
            let order: any = null;

            if (returnParamStr.startsWith("link_card_")) {
              // Standalone link card from Profile screen
              const linkUserId = returnParamStr.replace("link_card_", "");
              orderUser = await User.findById(linkUserId);
            } else {
              // Link card during checkout
              order = await Order.findById(returnParamStr);
              if (order && order.status === "PENDING") {
                orderUser = await User.findById(order.userId);
              }
            }

            if (orderUser) {
              console.log(`[ABA Webhook] Card linked for user ${orderUser._id}. Saving token...`);
              const cardInfo = returnParams.card_status;
              // Avoid duplicates by checking maskPan
              const alreadySaved = orderUser.savedCards?.some((c: any) => c.maskPan === cardInfo.mask_pan);
              if (!alreadySaved) {
                const hashId = crypto.createHash("md5").update(orderUser._id.toString()).digest("hex").slice(0, 16);
                orderUser.savedCards = orderUser.savedCards || [];
                orderUser.savedCards.push({
                  pwt: cardInfo.pwt,
                  maskPan: cardInfo.mask_pan,
                  cardType: cardInfo.card_type,
                  ctid: hashId,
                });
                await orderUser.save();
                console.log(`[ABA Webhook] Card saved for user ${orderUser._id}: ${cardInfo.mask_pan}`);
              }

              // If this was linked during checkout, charge the order immediately
              if (order) {
                try {
                  const hashId = crypto.createHash("md5").update(orderUser._id.toString()).digest("hex").slice(0, 16);
                  const purchaseResult = await purchaseByToken({
                    tran_id: order.paywayTranId,
                    amount: order.netAmount,
                    items: order.items.map((i: any) => ({
                      name: "Product",
                      quantity: i.quantity,
                      price: parseFloat(i.unitPrice).toFixed(2),
                    })),
                    pwt: cardInfo.pwt,
                    ctid: hashId,
                    firstname: orderUser?.fullName || "Customer",
                    lastname: "",
                    email: orderUser?.email || "",
                    return_param: String(order.id),
                  });

                  if (purchaseResult?.payment_status?.status === "0") {
                    order.status = "CONFIRMED";
                    order.paywayStatus = "APPROVED";

                    // Deduct stock upon successful payment
                    for (const item of order.items) {
                      const product = await Product.findById(item.product);
                      if (product) {
                        product.quantity -= item.quantity;
                        await product.save();
                      }
                    }

                    await order.save();
                  } else {
                    order.status = "CANCELLED";
                    order.paywayStatus = `TOKEN_PAY_FAILED_${purchaseResult?.payment_status?.code}`;
                    await order.save();
                  }
                } catch (tokenErr) {
                  console.error("[ABA Webhook] purchaseByToken Error:", tokenErr);
                }
              }
            }
          } else {
            // OPTION #2: Standard Purchase callback
            const order = await Order.findOne({ paywayTranId: tran_id });
            if (order) {
              if (status === "0" && order.status === "PENDING") {
                order.status = "CONFIRMED";
                order.paywayStatus = "APPROVED";

                // Deduct stock upon successful payment
                for (const item of order.items) {
                  const product = await Product.findById(item.product);
                  if (product) {
                    product.quantity -= item.quantity;
                    await product.save();
                  }
                }

                await order.save();
              } else if (status !== "0" && order.status === "PENDING") {
                order.status = "CANCELLED";
                order.paywayStatus = `DECLINED_${status}`;
                await order.save();
              }
            }
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
