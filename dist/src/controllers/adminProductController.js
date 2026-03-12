"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Product_1 = require("../models/Product");
const authPlugin_1 = require("../utils/authPlugin");
function default_1(appRouter) {
    /**
     * @swagger
     * /api/v1/admin/products:
     *   get:
     *     summary: Fetch all products (Admin view)
     *     tags: [Admin - Products]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of all products including inactive ones
     */
    appRouter.get('/api/v1/admin/products', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const products = await Product_1.Product.find({})
                .populate('category', 'id name')
                .populate('brand', 'id name')
                .populate('supplier', 'id name');
            appRouter.sendResponse(res, 200, products);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/products:
     *   post:
     *     summary: Create a product
     *     tags: [Admin - Products]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - sku
     *               - costPrice
     *               - sellingPrice
     *             properties:
     *               name:
     *                 type: string
     *               sku:
     *                 type: string
     *               description:
     *                 type: string
     *               category:
     *                 type: integer
     *               supplier:
     *                 type: integer
     *               brand:
     *                 type: integer
     *               quantity:
     *                 type: integer
     *               minStock:
     *                 type: integer
     *               costPrice:
     *                 type: number
     *               sellingPrice:
     *                 type: number
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Product created
     */
    appRouter.post('/api/v1/admin/products', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const body = await appRouter.parseJsonBody(req);
            if (!body.name || !body.sku || body.costPrice === undefined || body.sellingPrice === undefined) {
                return appRouter.sendResponse(res, 400, { message: 'Missing required product fields' });
            }
            const productExists = await Product_1.Product.findOne({ sku: body.sku });
            if (productExists) {
                return appRouter.sendResponse(res, 400, { message: 'Product with this SKU already exists' });
            }
            const product = await Product_1.Product.create({
                name: body.name,
                sku: body.sku,
                description: body.description,
                category: body.category,
                supplier: body.supplier,
                brand: body.brand,
                quantity: body.quantity || 0,
                minStock: body.minStock || 0,
                costPrice: body.costPrice,
                sellingPrice: body.sellingPrice,
                status: body.status || 'ACTIVE'
            });
            appRouter.sendResponse(res, 201, product);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/products/{id}:
     *   put:
     *     summary: Update a product
     *     tags: [Admin - Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               category:
     *                 type: integer
     *               supplier:
     *                 type: integer
     *               brand:
     *                 type: integer
     *               quantity:
     *                 type: integer
     *               minStock:
     *                 type: integer
     *               costPrice:
     *                 type: number
     *               sellingPrice:
     *                 type: number
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: Product updated
     */
    appRouter.put('/api/v1/admin/products/:id', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const body = await appRouter.parseJsonBody(req);
            const product = await Product_1.Product.findOne({ id: req.params.id });
            if (product) {
                Object.assign(product, body);
                // Keep SKU protected from updates unless explicitly specified and verified
                if (body.sku && body.sku !== product.sku) {
                    const skuExists = await Product_1.Product.findOne({ sku: body.sku });
                    if (skuExists)
                        return appRouter.sendResponse(res, 400, { message: 'SKU already in use' });
                    product.sku = body.sku;
                }
                const updatedProduct = await product.save();
                appRouter.sendResponse(res, 200, updatedProduct);
            }
            else {
                appRouter.sendResponse(res, 404, { message: 'Product not found' });
            }
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/products/{id}/variants:
     *   post:
     *     summary: Add variant to product
     *     tags: [Admin - Products]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               variantName:
     *                 type: string
     *               sku:
     *                 type: string
     *               size:
     *                 type: string
     *               color:
     *                 type: string
     *               stockQuantity:
     *                 type: integer
     *               additionalPrice:
     *                 type: number
     *               imageUrl:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Variant added
     */
    appRouter.post('/api/v1/admin/products/:id/variants', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const body = await appRouter.parseJsonBody(req);
            const product = await Product_1.Product.findOne({ id: req.params.id });
            if (!product) {
                return appRouter.sendResponse(res, 404, { message: 'Product not found' });
            }
            // Create variant subdoc in mongoose
            product.variants.push(body);
            await product.save();
            appRouter.sendResponse(res, 201, product.variants[product.variants.length - 1]);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
