"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Product_1 = require("../models/Product");
const Banner_1 = __importDefault(require("../models/Banner"));
function default_1(appRouter) {
    /**
     * @swagger
     * /api/v1/public/products/all:
     *   post:
     *     summary: Fetch all public products with pagination and filters
     *     tags: [Products]
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: A paginated list of products
     */
    appRouter.post('/api/v1/public/products/all', async (req, res) => {
        try {
            const body = await appRouter.parseJsonBody(req);
            const page = body.pageNo || 1;
            const limit = body.pageSize || 10;
            const skip = (page - 1) * limit;
            const filter = { status: 'ACTIVE' };
            if (body.search)
                filter.name = { $regex: body.search, $options: 'i' };
            if (body.categoryId)
                filter.category = body.categoryId;
            if (body.brandId)
                filter.brand = body.brandId;
            // Price filtering
            if (body.minPrice || body.maxPrice) {
                filter.sellingPrice = {};
                if (body.minPrice)
                    filter.sellingPrice.$gte = body.minPrice;
                if (body.maxPrice)
                    filter.sellingPrice.$lte = body.maxPrice;
            }
            const totalElements = await Product_1.Product.countDocuments(filter);
            const totalPages = Math.ceil(totalElements / limit);
            const products = await Product_1.Product.find(filter)
                .populate('category', 'id name description')
                .populate('brand', 'id name description')
                .populate('supplier', 'id name contactPerson phone email')
                .skip(skip)
                .limit(limit);
            appRouter.sendResponse(res, 200, {
                content: products,
                totalElements,
                totalPages,
                pageNo: page,
                pageSize: limit,
                last: page >= totalPages
            });
        }
        catch (e) {
            console.error('Products Error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/products/{id}:
     *   get:
     *     summary: Fetch single product by id
     *     tags: [Products]
     *     description: Retrieve a single product by its ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The product ID
     *     responses:
     *       200:
     *         description: Product data
     *       404:
     *         description: Product not found
     */
    // @desc    Fetch single product by id
    // @route   GET /api/v1/public/products/:id
    // @access  Public
    appRouter.get('/api/v1/public/products/:id', async (req, res) => {
        try {
            const product = await Product_1.Product.findOne({ id: req.params.id })
                .populate('category', 'id name description')
                .populate('brand', 'id name description')
                .populate('supplier', 'id name contactPerson phone email');
            if (product) {
                // Increment view count
                product.viewCount += 1;
                await product.save();
                appRouter.sendResponse(res, 200, product);
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
     * /api/v1/public/products/{id}/related:
     *   get:
     *     summary: Get related products
     *     tags: [Products]
     *     description: Retrieve related products based on the category of the given product ID
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *         description: The product ID
     *     responses:
     *       200:
     *         description: A list of related products
     *       404:
     *         description: Product not found
     */
    // @desc    Get related products
    // @route   GET /api/v1/public/products/:id/related
    // @access  Public
    appRouter.get('/api/v1/public/products/:id/related', async (req, res) => {
        try {
            const product = await Product_1.Product.findOne({ id: req.params.id });
            if (!product) {
                return appRouter.sendResponse(res, 404, { message: 'Product not found' });
            }
            const related = await Product_1.Product.find({
                category: product.category,
                id: { $ne: product.id },
                status: 'ACTIVE'
            })
                .limit(4)
                .populate('category', 'id name description')
                .populate('brand', 'id name description')
                .populate('supplier', 'id name contactPerson phone email');
            appRouter.sendResponse(res, 200, related);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/categories:
     *   get:
     *     summary: Fetch all categories
     *     tags: [Public Resources]
     *     description: Retrieve all categories
     *     responses:
     *       200:
     *         description: A list of categories
     */
    // @desc    Fetch all categories
    // @route   GET /api/v1/public/categories
    // @access  Public
    appRouter.get('/api/v1/public/categories', async (req, res) => {
        try {
            const categories = await Product_1.Category.find({});
            appRouter.sendResponse(res, 200, categories);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/categories/all:
     *   post:
     *     summary: Fetch categories via POST (for mobile app compatibility)
     *     tags: [Public Resources]
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: A list of categories wrapped in a content object
     */
    appRouter.post('/api/v1/public/categories/all', async (req, res) => {
        try {
            // App sends { pageNo: 1, pageSize: 100, search: '', status: 'ACTIVE' }
            const body = await appRouter.parseJsonBody(req);
            const filter = {};
            if (body.status)
                filter.status = body.status;
            if (body.search)
                filter.name = { $regex: body.search, $options: 'i' };
            const categories = await Product_1.Category.find(filter);
            // Wrap in Pageable format expected by the app ('content' field)
            appRouter.sendResponse(res, 200, { content: categories });
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/brands:
     *   get:
     *     summary: Fetch all brands
     *     tags: [Public Resources]
     *     description: Retrieve all active brands
     *     responses:
     *       200:
     *         description: A list of brands
     */
    // @desc    Fetch all brands
    // @route   GET /api/v1/public/brands
    // @access  Public
    appRouter.get('/api/v1/public/brands', async (req, res) => {
        try {
            const brands = await Product_1.Brand.find({ status: 'ACTIVE' });
            appRouter.sendResponse(res, 200, brands);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/brands/all:
     *   post:
     *     summary: Fetch brands via POST (for mobile app compatibility)
     *     tags: [Public Resources]
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: A list of brands wrapped in a content object
     */
    appRouter.post('/api/v1/public/brands/all', async (req, res) => {
        try {
            // App sends { page: 1, size: 100, searchTerm: '' }
            const body = await appRouter.parseJsonBody(req);
            const filter = { status: 'ACTIVE' };
            if (body.searchTerm)
                filter.name = { $regex: body.searchTerm, $options: 'i' };
            const brands = await Product_1.Brand.find(filter);
            // Wrap in Pageable format expected by the app ('content' field)
            appRouter.sendResponse(res, 200, { content: brands });
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/public/banners:
     *   get:
     *     summary: Fetch all banners
     *     tags: [Public Resources]
     *     description: Retrieve all active banners sorted by display order
     *     responses:
     *       200:
     *         description: A list of banners
     */
    // @desc    Fetch all banners
    // @route   GET /api/v1/public/banners
    // @access  Public
    appRouter.get('/api/v1/public/banners', async (req, res) => {
        try {
            const banners = await Banner_1.default.find({ status: 'ACTIVE' }).sort({ displayOrder: 1 });
            appRouter.sendResponse(res, 200, banners);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
