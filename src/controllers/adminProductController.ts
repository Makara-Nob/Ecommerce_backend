import { Product, ProductVariant } from '../models/Product';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect, admin } from '../utils/authPlugin';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/admin/products/fetch:
     *   post:
     *     summary: Fetch all products with post method (Admin view)
     *     tags: [Admin - Products]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               pageNo:
     *                 type: integer
     *               pageSize:
     *                 type: integer
     *               search:
     *                 type: string
     *     responses:
     *       200:
     *         description: A list of products with pagination data
     */
    appRouter.post('/api/v1/admin/products/fetch', async (req: any, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const page = parseInt(body.pageNo as string) || 1;
            const limit = parseInt(body.pageSize as string) || 10;
            const skip = (page - 1) * limit;
            const search = body.search as string || '';

            const query: any = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ];
            }

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .populate('category', 'id name')
                .populate('brand', 'id name')
                .populate('supplier', 'id name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const response = {
                content: products,
                pageNo: page,
                pageSize: limit,
                totalElements: total,
                totalPages: Math.ceil(total / limit),
                last: page * limit >= total,
                first: page === 1,
                hasNext: page * limit < total,
                hasPrevious: page > 1
            };

            appRouter.sendResponse(res, 200, response);
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

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
    appRouter.get('/api/v1/admin/products', async (req: any, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const page = parseInt(req.query.pageNo as string) || 1;
            const limit = parseInt(req.query.pageSize as string) || 10;
            const skip = (page - 1) * limit;
            const search = req.query.search as string || '';

            const query: any = {};
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { sku: { $regex: search, $options: 'i' } }
                ];
            }

            const total = await Product.countDocuments(query);
            const products = await Product.find(query)
                .populate('category', 'id name')
                .populate('brand', 'id name')
                .populate('supplier', 'id name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const response = {
                content: products,
                pageNo: page,
                pageSize: limit,
                totalElements: total,
                totalPages: Math.ceil(total / limit),
                last: page * limit >= total,
                first: page === 1,
                hasNext: page * limit < total,
                hasPrevious: page > 1
            };

            appRouter.sendResponse(res, 200, response);
        } catch (e) {
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
    appRouter.post('/api/v1/admin/products', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            
            if (!body.name || !body.sku || body.costPrice === undefined || body.sellingPrice === undefined) {
                return appRouter.sendResponse(res, 400, { message: 'Missing required product fields' });
            }

            const productExists = await Product.findOne({ sku: body.sku });
            if (productExists) {
                return appRouter.sendResponse(res, 400, { message: 'Product with this SKU already exists' });
            }

            const product = await Product.create({
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
        } catch (e) {
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
    appRouter.put('/api/v1/admin/products/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const product = await Product.findOne({ id: req.params.id });

            if (product) {
                Object.assign(product, body);
                
                // Keep SKU protected from updates unless explicitly specified and verified
                if(body.sku && body.sku !== product.sku) {
                    const skuExists = await Product.findOne({ sku: body.sku });
                    if(skuExists) return appRouter.sendResponse(res, 400, { message: 'SKU already in use' });
                    product.sku = body.sku;
                }

                const updatedProduct = await product.save();
                appRouter.sendResponse(res, 200, updatedProduct);
            } else {
                appRouter.sendResponse(res, 404, { message: 'Product not found' });
            }
        } catch (e) {
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
    appRouter.post('/api/v1/admin/products/:id/variants', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
         try {
             if (!await admin(req, res, appRouter)) return;
             
             const body = await appRouter.parseJsonBody(req);
             const product = await Product.findOne({ id: req.params.id });
             
             if (!product) {
                 return appRouter.sendResponse(res, 404, { message: 'Product not found' });
             }
             
             // Create variant subdoc in mongoose
             product.variants.push(body);
             await product.save();
             
             appRouter.sendResponse(res, 201, product.variants[product.variants.length - 1]);
         } catch(e) {
             appRouter.sendResponse(res, 500, { message: 'Server Error' });
         }
    });
}
