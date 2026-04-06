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
import { sendPushNotification } from "../utils/fcmService";

const getBaseUrl = (req: IncomingMessage) => {
  const protocol = (req.headers["x-forwarded-proto"] as string) || "http";
  const host = req.headers.host;
  return `${protocol}://${host}`;
};

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

        const { shippingAddress, paymentMethod, note, items: directItems, isBuyNow } =
          await appRouter.parseJsonBody(req);

        if (!shippingAddress) {
          return appRouter.sendResponse(res, 400, {
            message: "Shipping address is required",
          });
        }

        let totalAmount = 0;
        const orderItems = [];
        let usedCart = false;
        let cartToClear = null;

        let itemsToProcess = directItems;
        if (!isBuyNow || !itemsToProcess || itemsToProcess.length === 0) {
          // fallback to cart
          const cart = await Cart.findOne({ userId, status: "ACTIVE" }).populate("items");
          if (!cart || cart.items.length === 0) {
            return appRouter.sendResponse(res, 400, { message: "Cart is empty" });
          }
          itemsToProcess = cart.items;
          usedCart = true;
          cartToClear = cart;
        }

        // 2. Validate stock and calculate final amounts
        for (let rawItem of itemsToProcess) {
          let productId, quantity, variantId, unitPrice, variantName;
            
          if (usedCart) {
              productId = rawItem.product;
              quantity = rawItem.quantity;
              unitPrice = rawItem.unitPrice;
              variantId = rawItem.variantId;
              variantName = rawItem.variantName;
          } else {
              productId = rawItem.productId;
              quantity = rawItem.quantity;
              variantId = rawItem.variantId;
          }

          const product = await Product.findById(productId);
          if (!product || product.quantity < quantity) {
              return appRouter.sendResponse(res, 400, {
                  message: `Product ${product ? product.name : productId} is out of stock.`,
              });
          }

          if (!usedCart) {
              let additionalPrice = 0;
              if (variantId != null) {
                  const variant = product.variants.find((v: any) => Number(v._id) === Number(variantId));
                  if (variant) {
                      additionalPrice = variant.additionalPrice || 0;
                      const parts = [variant.variantName, ...(variant.optionValues || [])].filter(Boolean);
                      variantName = parts.join(' / ') || `Variant #${variantId}`;
                  }
              }
              unitPrice = (await getCurrentPrice(product)) + additionalPrice;
          } else if (!unitPrice || unitPrice <= 0) {
              unitPrice = await getCurrentPrice(product);
          }

          orderItems.push({
            product: product.id,
            quantity: quantity,
            unitPrice: unitPrice,
            subTotal: quantity * unitPrice,
            ...(variantId != null && { variantId }),
            ...(variantName && { variantName }),
          });

          totalAmount += quantity * unitPrice;
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

        // --- PUSH NOTIFICATION: ORDER PLACED ---
        await sendPushNotification(
          userId,
          "Order Placed!",
          `Your order #${order.id} has been placed successfully.`
        );
        // ---------------------------------------

        // 4. Clear the cart if used
        if (usedCart && cartToClear) {
            cartToClear.status = "CHECKED_OUT";
            await cartToClear.save();
            await CartItem.deleteMany({ cartId: cartToClear.id });
        }

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

          const baseUrl = getBaseUrl(req);
          const paywayPayload = getCheckoutPayload({
            tran_id: paywayTranId,
            amount: netAmount,
            items: paywayItems,
            firstname,
            lastname,
            email,
            phone: user?.phone || "",
          }, baseUrl);

          responseData = {
            ...responseData,
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

  // @desc    Get logged in user orders with pagination
  // @route   POST /api/v1/orders/my-orders
  // @access  Private
  /**
   * @swagger
   * /api/v1/orders/my-orders:
   *   post:
   *     summary: Get logged in user orders with pagination
   *     tags: [Orders]
   *     security:
   *       - bearerAuth: []
   *     description: Retrieve orders for the currently logged in user with pagination
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               pageNo:
   *                 type: number
   *                 default: 1
   *               pageSize:
   *                 type: number
   *                 default: 10
   *     responses:
   *       200:
   *         description: Paginated list of orders
   *       401:
   *         description: Not authorized
   */
  appRouter.post(
    "/api/v1/orders/my-orders",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const body = await appRouter.parseJsonBody(req);
        const page = parseInt(body.pageNo) || 1;
        const limit = parseInt(body.pageSize) || 10;
        const skip = (page - 1) * limit;

        // Support status filtering
        const filter: any = { userId };
        if (body.status === 'PAID') {
          filter.status = { $in: ['CONFIRMED', 'SHIPPED', 'DELIVERED'] };
        } else if (body.status && body.status !== 'ALL') {
          filter.status = body.status;
        } else {
          // Default: exclude PENDING (payment in progress) orders
          filter.status = { $nin: ['PENDING'] };
        }
        const totalElements = await Order.countDocuments(filter);
        const totalPages = Math.ceil(totalElements / limit);

        const orders = await Order.find(filter)
          .sort("-createdAt")
          .populate({
            path: "items.product",
            model: "Product",
            select: "_id name sku description sellingPrice costPrice qty quantity minStock status viewCount imageUrl images variants category brand supplier",
            populate: [
              { path: 'category', select: '_id name description' },
              { path: 'brand', select: '_id name description logoUrl' }
            ]
          })
          .skip(skip)
          .limit(limit);

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

        appRouter.sendResponse(res, 200, {
          content: mappedOrders,
          totalElements,
          totalPages,
          pageNo: page,
          pageSize: limit,
          last: page >= totalPages
        });
      } catch (e) {
        console.error('My Orders Error:', e);
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
          // Standard one-time card purchase without tokenizing
          paywayPayload = getCheckoutPayload({
            tran_id: order.paywayTranId,
            amount: order.netAmount,
            items: paywayItems,
            firstname,
            lastname,
            email,
            phone: "",
            payment_option: "cards",
            return_deeplink: process.env.ABA_RETURN_DEEPLINK || "",
            view_type: "checkout",
          });
          paywayApiUrl = ABA_PAYWAY_API_URL;
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

        const baseUrl = getBaseUrl(req);
        const cofPayload = getCofPayload({
          return_param: `link_card_${userId}`,
          firstname,
          lastname,
          email: user.email,
          phone: user.phone || "",
        }, baseUrl);

        // POST to ABA on the server side without following the redirect.
        // Capture the direct /add-card/... URL from Location header — Flutter loads it
        // directly as a plain page, skipping the bottom-sheet wrapper entirely.
        const form = new FormData();
        Object.entries(cofPayload).forEach(([key, value]) => {
          form.append(key, String(value));
        });

        const abaRes = await fetch(ABA_PAYWAY_COF_URL, {
          method: "POST",
          body: form,
          redirect: "manual",
        });

        const cofUrl = abaRes.headers.get("location");
        console.log("[Link Card API] ABA redirect URL:", cofUrl);

        if (!cofUrl) {
          const text = await abaRes.text().catch(() => "");
          console.error("[Link Card API] ABA status:", abaRes.status, "Body:", text.slice(0, 300));
          return appRouter.sendResponse(res, 502, {
            message: "ABA PayWay did not return a card form URL",
          });
        }

        appRouter.sendResponse(res, 200, { cofUrl });
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

  // @desc    Update order status
  // @route   POST /api/v1/orders/:id/status
  // @access  Private (Admin ideally, but using standard protect for now)
  appRouter.post(
    "/api/v1/orders/:id/status",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const { status } = await appRouter.parseJsonBody(req);
        if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
            return appRouter.sendResponse(res, 400, { message: "Invalid status" });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return appRouter.sendResponse(res, 404, { message: "Order not found" });

        order.status = status;
        await order.save();

        if (status === 'DELIVERED') {
          // --- PUSH NOTIFICATION: ORDER DELIVERED ---
          await sendPushNotification(
            order.userId,
            "Order Delivered! 📦",
            `Your order #${order.id} has been successfully delivered. Thank you for shopping with us!`,
            { orderId: order.id.toString(), type: 'DELIVERY' }
          );
          // ------------------------------------------
        } else if (status === 'SHIPPED') {
          // Optional extra trigger
          await sendPushNotification(
            order.userId,
            "Order Shipped! 🚚",
            `Your order #${order.id} is on the way!`,
            { orderId: order.id.toString(), type: 'SHIPPING' }
          );
        }

        appRouter.sendResponse(res, 200, { success: true, order });
      } catch (e: any) {
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

          // --- PUSH NOTIFICATION: ORDER PAID / UPDATED ---
          await sendPushNotification(
            order.userId,
            "Payment Confirmed!",
            `Your payment for order #${order.id} was successful.`
          );
          // -----------------------------------------------
        }

        // ➕ NEW — Populate product details in items so Flutter gets real names/images
        const populatedOrder = await Order.findById(order._id);
        const rawItems = populatedOrder?.items || order.items;

        console.log(`[check-payment] Populating ${rawItems.length} items for order #${order.id}`);

        const populatedItems = await Promise.all(
          rawItems.map(async (item: any) => {
            // Cast to Number — auto-increment IDs are stored and queried as Numbers
            const productId = Number(item.product);
            console.log(`[check-payment]  → looking up product id: ${productId} (original: ${item.product}, type: ${typeof item.product})`);
            const prod = await Product.findOne({ _id: productId }).select('_id name sku images sellingPrice quantity');
            console.log(`[check-payment]  → found: ${prod ? prod.name : 'NULL - product not found!'}`);
            return {
              _id: item._id,
              product: prod
                ? prod.toObject()
                : { _id: productId, name: 'Unknown Product', images: [], sku: '', sellingPrice: item.unitPrice ?? 0, quantity: 0 },
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subTotal: item.subTotal,
            };
          })
        );

        const orderWithProducts = {
          ...(populatedOrder || order).toObject(),
          items: populatedItems,
        };

        appRouter.sendResponse(res, 200, {
          message: "Check completed",
          abaResponse,
          order: orderWithProducts
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
        console.log(`[ABA Webhook] Request received: ${req.method} ${req.url}`);

        if (req.method === "GET") {
          // Browser redirect (Return URL)
          const successHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <title>Payment Successful</title>
                <style>
                  body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f4f6f9; }
                  .card { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                  .icon { font-size: 60px; color: #4CAF50; margin-bottom: 20px; }
                  h1 { margin: 0 0 10px; color: #1a1f36; }
                  p { color: #4e5d78; line-height: 1.5; margin-bottom: 30px; }
                  .btn { background: #0052cc; color: white; padding: 12px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">✓</div>
                  <h1>Payment Successful!</h1>
                  <p>Your transaction has been processed successfully. You can now close this window or return to the app.</p>
                  <a href="#" class="btn" onclick="window.close(); return false;">Return to App</a>
                </div>
                <script>
                  // Auto-close if possible after a short delay
                  setTimeout(() => {
                    // Try to notify the parent or close
                    if (window.opener) window.close();
                  }, 3000);
                </script>
              </body>
            </html>
          `;
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(successHtml);
          return;
        }

        const payload = await appRouter.parseJsonBody(req);
        const signature = req.headers["x-payway-hmac-sha512"] as string;

        console.log(`[ABA Webhook] Raw Payload:`, JSON.stringify(payload, null, 2));

        if (!signature || !verifyWebhookSignature(payload, signature)) {
          console.error("[ABA Webhook] Signature Verification: FAILED ❌");
          return appRouter.sendResponse(res, 401, {
            message: "Invalid signature",
          });
        }
        console.log("[ABA Webhook] Signature Verification: SUCCESS ✅");

        const tran_id = payload.tran_id;
        const status = payload.status;

        // --- 1. Check for Link Card (COF) Tokenization ---
        // Tokenization operations do not return a tran_id, they only return return_params
        let returnParams = payload.return_params;
          
          // Robustly handle if ABA sends return_params as a stringified JSON
          if (typeof returnParams === "string") {
            try {
              returnParams = JSON.parse(returnParams);
            } catch (e) {
              console.error("[ABA Webhook] Failed to parse return_params string:", e);
            }
          }

          const cardStatus = returnParams?.card_status;
          const pwt = cardStatus?.pwt;
          const ctid = returnParams?.ctid;

          if (pwt) {
            // Option #1: Link Card (COF) Flow
            const returnParamVal = String(returnParams.return_param || "");
            let orderUser: any = null;
            let order: any = null;

            if (returnParamVal.startsWith("link_card_")) {
              // Standalone link card from Profile screen
              const linkUserId = returnParamVal.replace("link_card_", "");
              orderUser = await User.findById(linkUserId);
            } else {
              // Link card during checkout
              order = await Order.findById(returnParamVal);
              if (order && order.status === "PENDING") {
                orderUser = await User.findById(order.userId);
              }
            }

            if (orderUser) {
              console.log(`[ABA Webhook] Card linked for user ${orderUser._id}. Saving ctid and pwt...`);
              
              // Avoid duplicates by checking maskPan
              const alreadySaved = orderUser.savedCards?.some((c: any) => c.maskPan === cardStatus.mask_pan);
              if (!alreadySaved) {
                orderUser.savedCards = orderUser.savedCards || [];
                orderUser.savedCards.push({
                  pwt: cardStatus.pwt,
                  maskPan: cardStatus.mask_pan,
                  cardType: cardStatus.card_type,
                  ctid: ctid || "",
                });
                await orderUser.save();
                console.log(`[ABA Webhook] User found and card saved: TRUE ✅ for User ${orderUser._id}`);
              } else {
                console.log(`[ABA Webhook] Card already exists: SKIP ⚠️`);
              }

              // If this was linked during checkout, charge the order immediately
              if (order) {
                try {
                  const purchaseResult = await purchaseByToken({
                    tran_id: order.paywayTranId,
                    amount: order.netAmount,
                    items: order.items.map((i: any) => ({
                      name: "Product",
                      quantity: i.quantity,
                      price: parseFloat(i.unitPrice).toFixed(2),
                    })),
                    pwt: cardStatus.pwt,
                    ctid: ctid || "",
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
                } catch (err) {
                  console.error("[ABA Webhook] Error during purchaseByToken:", err);
                }
              }
            } else {
              console.log("[ABA Webhook] User not found for return_param:", returnParamVal);
            }
            
            if (!tran_id) {
              return appRouter.sendResponse(res, 200, { message: "Tokenization recorded" });
            }
          }

          // --- 2. Check for Standard Payment ---
          if (tran_id) {
            const order = await Order.findOne({ paywayTranId: tran_id });
            if (order) {
              if (status === "0" && order.status === "PENDING") {
                order.status = "CONFIRMED";
                order.paywayStatus = "APPROVED";

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
          
        // Must respond HTTP 200 to acknowledge receipt to ABA
        // If this is a browser redirect (GET) from ABA, we return an HTML success page.
        // Webhooks (POST) still get JSON.
        if (req.method === "GET") {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; }
                  .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 90%; }
                  .icon { color: #10b981; font-size: 3rem; margin-bottom: 1rem; }
                  h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
                  p { color: #6b7280; font-size: 0.875rem; margin-bottom: 1.5rem; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">✓</div>
                  <h1>Success!</h1>
                  <p>Your card has been linked successfully.</p>
                  <p>You can now close this window and return to the app.</p>
                </div>
                <script>
                  // Try to close automatically after 2 seconds
                  setTimeout(() => { window.close(); }, 2000);
                </script>
              </body>
            </html>
          `);
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "success" }));
        }
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
