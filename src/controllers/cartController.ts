import { Cart, CartItem, ICart } from "../models/Cart";
import { Product } from "../models/Product";
import { protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import { getCurrentPrice } from "../utils/promotionUtils";

export default function (appRouter: Router) {
  // Helper to get or create active cart
  const getActiveCart = async (userId: number) => {
    let cart = await Cart.findOne({ userId, status: "ACTIVE" }).populate({
      path: "items",
      populate: {
        path: "product",
        populate: [
          { path: "category" },
          { path: "brand" },
          { path: "supplier" },
        ],
      },
    });

    if (!cart) {
      cart = await Cart.create({ userId, status: "ACTIVE", totalAmount: 0 });
    }
    return cart;
  };

  const calculateTotal = async (cart: ICart) => {
    let total = 0;
    for (let itemId of cart.items) {
      const item = await CartItem.findById(itemId);
      if (item) total += item.subTotal;
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
  appRouter.get(
    "/api/v1/cart",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const cart = await getActiveCart(userId);
        appRouter.sendResponse(res, 200, cart);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

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
  appRouter.post(
    "/api/v1/cart/items",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const body = await appRouter.parseJsonBody(req);
        const productId = Number(body.productId);
        const quantity = Number(body.quantity);
        if (!productId || !quantity) {
          return appRouter.sendResponse(res, 400, {
            message: "Product ID and quantity are required",
          });
        }

        const product = await Product.findOne({ _id: productId });
        if (!product) {
          return appRouter.sendResponse(res, 404, {
            message: "Product not found",
          });
        }

        // Check stock
        if (product.quantity < quantity) {
          return appRouter.sendResponse(res, 400, {
            message: "Insufficient stock",
          });
        }

        let cart = await getActiveCart(userId);
        let cartItem = await CartItem.findOne({
          cartId: cart.id,
          product: product.id,
        });

        if (cartItem) {
          // Update existing item - Recalculate price just in case it changed
          const currentPrice = await getCurrentPrice(product);
          cartItem.unitPrice = currentPrice;
          cartItem.quantity += quantity;
          cartItem.subTotal = cartItem.quantity * cartItem.unitPrice;
          await cartItem.save();
        } else {
          // Create new item
          const currentPrice = await getCurrentPrice(product);
          cartItem = await CartItem.create({
            cartId: cart.id,
            product: product.id,
            quantity,
            unitPrice: currentPrice,
            subTotal: quantity * currentPrice,
          });
          cart.items.push(cartItem._id as unknown as number);
          await cart.save();
        }

        await calculateTotal(cart);

        // Return updated cart
        const updatedCart = (await Cart.findById(cart._id).populate({
          path: "items",
          populate: {
            path: "product",
            populate: [
              { path: "category" },
              { path: "brand" },
              { path: "supplier" },
            ],
          },
        })) as any;

        appRouter.sendResponse(res, 200, updatedCart);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

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
  appRouter.put(
    "/api/v1/cart/items/:id",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const itemId = req.params?.id;
        const { quantity } = await appRouter.parseJsonBody(req);

        if (quantity === undefined || quantity < 1) {
          return appRouter.sendResponse(res, 400, {
            message: "Valid quantity required",
          });
        }

        const cartItem = await CartItem.findOne({ _id: itemId });
        if (!cartItem)
          return appRouter.sendResponse(res, 404, {
            message: "Cart item not found",
          });

        // Verify ownership
        const cart = await Cart.findOne({ _id: cartItem.cartId, userId });
        if (!cart)
          return appRouter.sendResponse(res, 403, {
            message: "Item does not belong to your cart",
          });

        // Check availability
        const product = await Product.findById(cartItem.product);
        if (!product || product.quantity < quantity) {
          return appRouter.sendResponse(res, 400, {
            message: "Insufficient stock",
          });
        }

        const currentPrice = await getCurrentPrice(product);
        cartItem.unitPrice = currentPrice;
        cartItem.quantity = quantity;
        cartItem.subTotal = quantity * cartItem.unitPrice;
        await cartItem.save();

        await calculateTotal(cart);

        // Populate and return updated cart so Flutter can parse it
        const updatedCart = (await Cart.findById(cart._id).populate({
          path: "items",
          populate: {
            path: "product",
            populate: [
              { path: "category" },
              { path: "brand" },
              { path: "supplier" },
            ],
          },
        })) as any;

        appRouter.sendResponse(res, 200, updatedCart);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

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
  appRouter.delete(
    "/api/v1/cart/items/:id",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const itemId = req.params?.id;
        const cartItem = await CartItem.findOne({ _id: itemId });

        if (!cartItem)
          return appRouter.sendResponse(res, 404, {
            message: "Cart item not found",
          });

        const cart = await Cart.findOne({ _id: cartItem.cartId, userId });
        if (!cart)
          return appRouter.sendResponse(res, 403, {
            message: "Item does not belong to your cart",
          });

        // Remove item reference from Cart
        cart.items = cart.items.filter(
          (id) => id.toString() !== cartItem._id.toString(),
        );
        await cart.save();

        // Delete item
        await CartItem.findByIdAndDelete(cartItem._id);
        const updatedCartPlain = await calculateTotal(cart);

        // Populate and return updated cart so Flutter can parse it
        const updatedCart = (await Cart.findById(cart._id).populate({
          path: "items",
          populate: {
            path: "product",
            populate: [
              { path: "category" },
              { path: "brand" },
              { path: "supplier" },
            ],
          },
        })) as any;

        appRouter.sendResponse(res, 200, updatedCart);
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );

  // @desc    Clear active cart
  // @route   DELETE /api/v1/cart
  // @access  Private
  /**
   * @swagger
   * /api/v1/cart:
   *   delete:
   *     summary: Clear cart
   *     tags: [Cart]
   *     security:
   *       - bearerAuth: []
   *     description: Remove all items from the active cart
   *     responses:
   *       200:
   *         description: Cart cleared successfully
   *       401:
   *         description: Not authorized
   */
  appRouter.delete(
    "/api/v1/cart",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const cart = await Cart.findOne({ userId, status: "ACTIVE" });
        if (!cart) {
          return appRouter.sendResponse(res, 200, { message: "Cart is already empty" });
        }

        // Delete all items and reset cart
        await CartItem.deleteMany({ cartId: cart._id });
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();

        appRouter.sendResponse(res, 200, { message: "Cart cleared" });
      } catch (e) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    },
  );
}
