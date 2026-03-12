"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Order_1 = require("../models/Order");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const authPlugin_1 = require("../utils/authPlugin");
function default_1(appRouter) {
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
    appRouter.post('/api/v1/orders', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const { shippingAddress, paymentMethod, note } = await appRouter.parseJsonBody(req);
            if (!shippingAddress) {
                return appRouter.sendResponse(res, 400, { message: 'Shipping address is required' });
            }
            // 1. Get active cart
            const cart = await Cart_1.Cart.findOne({ userId, status: 'ACTIVE' }).populate('items');
            if (!cart || cart.items.length === 0) {
                return appRouter.sendResponse(res, 400, { message: 'Cart is empty' });
            }
            // 2. Validate stock and calculate final amounts
            let totalAmount = 0;
            const orderItems = [];
            for (let cartItemId of cart.items) {
                // Need to refetch in case items property contains plain ObjectIds instead of populated objects
                const item = await Cart_1.CartItem.findById(cartItemId);
                if (!item)
                    continue;
                const product = await Product_1.Product.findById(item.product);
                if (!product || product.quantity < item.quantity) {
                    return appRouter.sendResponse(res, 400, {
                        message: `Product ${product ? product.name : item.product} is out of stock or requested quantity exceeds available stock.`
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
                    subTotal: item.subTotal
                });
                totalAmount += item.subTotal;
            }
            // 3. Create the order
            const discountAmount = 0; // Can implement coupons later
            const netAmount = totalAmount - discountAmount;
            const order = await Order_1.Order.create({
                userId,
                totalAmount,
                discountAmount,
                netAmount,
                status: 'PENDING',
                paymentMethod: paymentMethod || 'CASH',
                shippingAddress,
                note,
                items: orderItems
            });
            // 4. Clear the cart
            cart.status = 'CHECKED_OUT';
            await cart.save();
            // Also clear cart items to keep DB clean
            await Cart_1.CartItem.deleteMany({ cartId: cart.id });
            appRouter.sendResponse(res, 201, order);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
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
    appRouter.get('/api/v1/orders/my-orders', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const orders = await Order_1.Order.find({ userId })
                .sort('-createdAt')
                .populate({
                path: 'items.product',
                model: 'Product',
                select: 'id name sku imageUrl'
            });
            appRouter.sendResponse(res, 200, orders);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
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
    appRouter.get('/api/v1/orders/:id', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const order = await Order_1.Order.findOne({ id: req.params.id })
                .populate({
                path: 'items.product',
                model: 'Product',
                select: 'id name sku imageUrl price sellingPrice'
            });
            if (order) {
                // Enforce ownership
                if (order.userId !== userId) {
                    return appRouter.sendResponse(res, 403, { message: 'Not authorized to view this order' });
                }
                appRouter.sendResponse(res, 200, order);
            }
            else {
                appRouter.sendResponse(res, 404, { message: 'Order not found' });
            }
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
