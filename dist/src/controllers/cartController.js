"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const authPlugin_1 = require("../utils/authPlugin");
function default_1(appRouter) {
    // Helper to get or create active cart
    const getActiveCart = async (userId) => {
        let cart = await Cart_1.Cart.findOne({ userId, status: 'ACTIVE' }).populate({
            path: 'items',
            populate: { path: 'product' }
        });
        if (!cart) {
            cart = await Cart_1.Cart.create({ userId, status: 'ACTIVE', totalAmount: 0 });
        }
        return cart;
    };
    const calculateTotal = async (cart) => {
        let total = 0;
        for (let itemId of cart.items) {
            const item = await Cart_1.CartItem.findById(itemId);
            if (item)
                total += item.subTotal;
        }
        cart.totalAmount = total;
        await cart.save();
        return cart;
    };
    // @desc    Get current user's active cart
    // @route   GET /api/v1/cart
    // @access  Private
    /**
     * @swagger
     * /api/v1/cart:
     *   get:
     *     summary: Get current user's active cart
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     description: Retrieve the active cart for the currently logged in user
     *     responses:
     *       200:
     *         description: Cart data
     *       401:
     *         description: Not authorized
     */
    appRouter.get('/api/v1/cart', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const cart = await getActiveCart(userId);
            appRouter.sendResponse(res, 200, cart);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    // @desc    Add item to cart
    // @route   POST /api/v1/cart/items
    // @access  Private
    /**
     * @swagger
     * /api/v1/cart/items:
     *   post:
     *     summary: Add item to cart
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     description: Add a product to the user's active cart or increment its quantity if it already exists
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - productId
     *               - quantity
     *             properties:
     *               productId:
     *                 type: string
     *               quantity:
     *                 type: integer
     *     responses:
     *       200:
     *         description: Updated cart data
     *       400:
     *         description: Product ID and quantity are required, or Insufficient stock
     *       401:
     *         description: Not authorized
     *       404:
     *         description: Product not found
     */
    appRouter.post('/api/v1/cart/items', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const { productId, quantity } = await appRouter.parseJsonBody(req);
            if (!productId || !quantity) {
                return appRouter.sendResponse(res, 400, { message: 'Product ID and quantity are required' });
            }
            const product = await Product_1.Product.findOne({ id: productId });
            if (!product) {
                return appRouter.sendResponse(res, 404, { message: 'Product not found' });
            }
            // Check stock
            if (product.quantity < quantity) {
                return appRouter.sendResponse(res, 400, { message: 'Insufficient stock' });
            }
            let cart = await getActiveCart(userId);
            let cartItem = await Cart_1.CartItem.findOne({ cartId: cart.id, product: product.id });
            if (cartItem) {
                // Update existing item
                cartItem.quantity += quantity;
                cartItem.subTotal = cartItem.quantity * cartItem.unitPrice;
                await cartItem.save();
            }
            else {
                // Create new item
                cartItem = await Cart_1.CartItem.create({
                    cartId: cart.id,
                    product: product.id,
                    quantity,
                    unitPrice: product.sellingPrice,
                    subTotal: quantity * product.sellingPrice
                });
                cart.items.push(cartItem._id);
                await cart.save();
            }
            await calculateTotal(cart);
            // Return updated cart
            const updatedCart = await Cart_1.Cart.findById(cart._id).populate({
                path: 'items',
                populate: { path: 'product' }
            });
            appRouter.sendResponse(res, 200, updatedCart);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    // @desc    Update cart item quantity
    // @route   PUT /api/v1/cart/items/:id
    // @access  Private
    /**
     * @swagger
     * /api/v1/cart/items/{id}:
     *   put:
     *     summary: Update cart item quantity
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     description: Update the quantity of a specific item in the cart
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The cart item ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - quantity
     *             properties:
     *               quantity:
     *                 type: integer
     *     responses:
     *       200:
     *         description: Updated cart item
     *       400:
     *         description: Valid quantity required, or Insufficient stock
     *       401:
     *         description: Not authorized
     *       403:
     *         description: Item does not belong to your cart
     *       404:
     *         description: Cart item not found
     */
    appRouter.put('/api/v1/cart/items/:id', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const itemId = req.params?.id;
            const { quantity } = await appRouter.parseJsonBody(req);
            if (quantity === undefined || quantity < 1) {
                return appRouter.sendResponse(res, 400, { message: 'Valid quantity required' });
            }
            const cartItem = await Cart_1.CartItem.findOne({ id: itemId });
            if (!cartItem)
                return appRouter.sendResponse(res, 404, { message: 'Cart item not found' });
            // Verify ownership
            const cart = await Cart_1.Cart.findOne({ id: cartItem.cartId, userId });
            if (!cart)
                return appRouter.sendResponse(res, 403, { message: 'Item does not belong to your cart' });
            // Check availability
            const product = await Product_1.Product.findById(cartItem.product);
            if (!product || product.quantity < quantity) {
                return appRouter.sendResponse(res, 400, { message: 'Insufficient stock' });
            }
            cartItem.quantity = quantity;
            cartItem.subTotal = quantity * cartItem.unitPrice;
            await cartItem.save();
            await calculateTotal(cart);
            appRouter.sendResponse(res, 200, cartItem);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    // @desc    Remove item from cart
    // @route   DELETE /api/v1/cart/items/:id
    // @access  Private
    /**
     * @swagger
     * /api/v1/cart/items/{id}:
     *   delete:
     *     summary: Remove item from cart
     *     tags: [Cart]
     *     security:
     *       - bearerAuth: []
     *     description: Remove a specific item from the cart
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The cart item ID
     *     responses:
     *       200:
     *         description: Item removed from cart
     *       401:
     *         description: Not authorized
     *       403:
     *         description: Item does not belong to your cart
     *       404:
     *         description: Cart item not found
     */
    appRouter.delete('/api/v1/cart/items/:id', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const itemId = req.params?.id;
            const cartItem = await Cart_1.CartItem.findOne({ id: itemId });
            if (!cartItem)
                return appRouter.sendResponse(res, 404, { message: 'Cart item not found' });
            const cart = await Cart_1.Cart.findOne({ id: cartItem.cartId, userId });
            if (!cart)
                return appRouter.sendResponse(res, 403, { message: 'Item does not belong to your cart' });
            // Remove item reference from Cart
            cart.items = cart.items.filter(id => id.toString() !== cartItem._id.toString());
            await cart.save();
            // Delete item
            await Cart_1.CartItem.findByIdAndDelete(cartItem._id);
            await calculateTotal(cart);
            appRouter.sendResponse(res, 200, { message: 'Item removed from cart' });
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
