import { Product, Category, Brand, Supplier } from '../models/Product';
import Banner from '../models/Banner';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';

export default function(appRouter: Router) {
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
appRouter.post('/api/v1/public/products/all', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const body = await appRouter.parseJsonBody(req);
        
        const page = body.pageNo || 1;
        const limit = body.pageSize || 10;
        const skip = (page - 1) * limit;
        
        const filter: any = { status: 'ACTIVE' };
        
        if (body.search) filter.name = { $regex: body.search, $options: 'i' };
        if (body.categoryId) filter.category = body.categoryId;
        if (body.brandId) filter.brand = body.brandId;
        
        // Price filtering
        if (body.minPrice || body.maxPrice) {
            filter.sellingPrice = {};
            if (body.minPrice) filter.sellingPrice.$gte = body.minPrice;
            if (body.maxPrice) filter.sellingPrice.$lte = body.maxPrice;
        }

        const totalElements = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalElements / limit);
        
        const products = await Product.find(filter)
            .populate('category', 'id name description')
            .populate('brand', 'id name description logoUrl')
            .populate('supplier', 'id name contactPerson phone email')
            .skip(skip)
            .limit(limit);
            
        const mappedProducts = products.map((p: any) => {
            const pObj = p.toObject();
            return {
                ...pObj,
                id: pObj._id,
                category: pObj.category ? { ...pObj.category, id: pObj.category._id } : null,
                brand: pObj.brand ? { ...pObj.brand, id: pObj.brand._id } : null,
                supplier: pObj.supplier ? { ...pObj.supplier, id: pObj.supplier._id } : null,
                variants: pObj.variants ? pObj.variants.map((v: any) => ({ ...v, id: v._id })) : []
            };
        });

        appRouter.sendResponse(res, 200, {
            content: mappedProducts,
            totalElements,
            totalPages,
            pageNo: page,
            pageSize: limit,
            last: page >= totalPages
        });
    } catch (e) {
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
appRouter.get('/api/v1/public/products/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', '_id name description')
            .populate('brand', '_id name description')
            .populate('supplier', '_id name contactPerson phone email');

        if (product) {
            // Increment view count
            product.viewCount += 1;
            await product.save();
            
            const productObj: any = product.toObject();
            appRouter.sendResponse(res, 200, {
                ...productObj,
                id: productObj._id,
                category: productObj.category ? { ...productObj.category, id: productObj.category._id } : null,
                brand: productObj.brand ? { ...productObj.brand, id: productObj.brand._id } : null,
                supplier: productObj.supplier ? { ...productObj.supplier, id: productObj.supplier._id } : null,
                variants: productObj.variants ? productObj.variants.map((v: any) => ({ ...v, id: v._id })) : []
            });
        } else {
            appRouter.sendResponse(res, 404, { message: 'Product not found' });
        }
    } catch (e) {
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
appRouter.get('/api/v1/public/products/:id/related', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
    try {
         const product = await Product.findById(req.params.id);
         if (!product) {
             return appRouter.sendResponse(res, 404, { message: 'Product not found' });
         }
         
         const related = await Product.find({
             category: product.category,
             _id: { $ne: product._id },
             status: 'ACTIVE'
         })
         .limit(4)
         .populate('category', 'id name description')
         .populate('brand', 'id name description logoUrl')
         .populate('supplier', 'id name contactPerson phone email');

         const mappedRelated = related.map((p: any) => {
             const pObj = p.toObject();
             return {
                ...pObj,
                id: pObj._id,
                category: pObj.category ? { ...pObj.category, id: pObj.category._id } : null,
                brand: pObj.brand ? { ...pObj.brand, id: pObj.brand._id } : null,
                supplier: pObj.supplier ? { ...pObj.supplier, id: pObj.supplier._id } : null,
                variants: pObj.variants ? pObj.variants.map((v: any) => ({ ...v, id: v._id })) : []
             };
         });
         
         appRouter.sendResponse(res, 200, mappedRelated);
    } catch (e) {
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
appRouter.get('/api/v1/public/categories', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const categories = await Category.find({});
        const mappedCategories = categories.map(c => ({
            ...c.toObject(),
            id: c._id
        }));
        appRouter.sendResponse(res, 200, mappedCategories);
    } catch (e) {
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
appRouter.post('/api/v1/public/categories/all', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        // App sends { pageNo: 1, pageSize: 100, search: '', status: 'ACTIVE' }
        const body = await appRouter.parseJsonBody(req);
        
        const filter: any = {};
        if (body.status) filter.status = body.status;
        if (body.search) filter.name = { $regex: body.search, $options: 'i' };

        const categories = await Category.find(filter);
        const mappedCategories = categories.map(c => ({
            ...c.toObject(),
            id: c._id
        }));
        
        // Wrap in Pageable format expected by the app ('content' field)
        appRouter.sendResponse(res, 200, { content: mappedCategories });
    } catch (e) {
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
appRouter.get('/api/v1/public/brands', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const brands = await Brand.find({ status: 'ACTIVE' });
        const mappedBrands = brands.map(b => ({
            ...b.toObject(),
            id: b._id
        }));
        appRouter.sendResponse(res, 200, mappedBrands);
    } catch (e) {
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
appRouter.post('/api/v1/public/brands/all', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        // App sends { page: 1, size: 100, searchTerm: '' }
        const body = await appRouter.parseJsonBody(req);
        
        const filter: any = { status: 'ACTIVE' };
        if (body.searchTerm) filter.name = { $regex: body.searchTerm, $options: 'i' };

        const brands = await Brand.find(filter);
        const mappedBrands = brands.map(b => ({
            ...b.toObject(),
            id: b._id
        }));
        
        // Wrap in Pageable format expected by the app ('content' field)
        appRouter.sendResponse(res, 200, { content: mappedBrands });
    } catch (e) {
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
appRouter.get('/api/v1/public/banners', async (req: IncomingMessage, res: ServerResponse) => {
    try {
        const banners = await Banner.find({ status: 'ACTIVE' }).sort({ displayOrder: 1 });
        const mappedBanners = banners.map(b => ({
            ...b.toObject(),
            id: b._id,
            active: b.status === 'ACTIVE'
        }));
        appRouter.sendResponse(res, 200, mappedBanners);
    } catch (e) {
        appRouter.sendResponse(res, 500, { message: 'Server Error' });
    }
});

}
