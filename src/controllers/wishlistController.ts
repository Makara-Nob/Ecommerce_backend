import User from '../models/User';
import { Product } from '../models/Product';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect } from '../utils/authPlugin';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/wishlist/toggle:
     *   post:
     *     summary: Toggle product in user's wishlist
     *     tags: [Wishlist]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               productId:
     *                 type: number
     *     responses:
     *       200:
     *         description: Toggled successfully
     */
    appRouter.post('/api/v1/wishlist/toggle', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const body = await appRouter.parseJsonBody(req);
            const { productId } = body;

            if (!productId) {
                return appRouter.sendResponse(res, 400, { message: 'Product ID is required' });
            }

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: 'User not found' });
            }

            const index = user.wishlist.indexOf(productId);
            if (index > -1) {
                user.wishlist.splice(index, 1);
            } else {
                user.wishlist.push(productId);
            }

            await user.save();
            appRouter.sendResponse(res, 200, { 
                message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
                wishlist: user.wishlist 
            });
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/wishlist:
     *   get:
     *     summary: Get user's wishlist items
     *     tags: [Wishlist]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: List of products in wishlist
     */
    appRouter.get('/api/v1/wishlist', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const user = await User.findById(userId).populate({
                path: 'wishlist',
                populate: [
                    { path: 'category', select: '_id name description' },
                    { path: 'brand', select: '_id name description logoUrl' },
                    { path: 'supplier', select: '_id name contactPerson phone email' }
                ]
            });

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: 'User not found' });
            }

            const mappedProducts = user.wishlist.map((p: any) => {
                if (!p || typeof p === 'number') return null;
                
                // Ensure p is a document with toObject, or use it as is if it's already a POJO
                const pObj = typeof p.toObject === 'function' ? p.toObject() : p;
                
                return {
                    ...pObj,
                    id: pObj._id || pObj.id,
                    category: pObj.category ? { 
                        ...(typeof pObj.category.toObject === 'function' ? pObj.category.toObject() : pObj.category),
                        id: pObj.category._id || pObj.category.id 
                    } : null,
                    brand: pObj.brand ? { 
                        ...(typeof pObj.brand.toObject === 'function' ? pObj.brand.toObject() : pObj.brand),
                        id: pObj.brand._id || pObj.brand.id 
                    } : null,
                    supplier: pObj.supplier ? { 
                        ...(typeof pObj.supplier.toObject === 'function' ? pObj.supplier.toObject() : pObj.supplier),
                        id: pObj.supplier._id || pObj.supplier.id 
                    } : null,
                    variants: pObj.variants ? pObj.variants.map((v: any) => ({ 
                        ...(typeof v.toObject === 'function' ? v.toObject() : v),
                        id: v._id || v.id 
                    })) : []
                };
            }).filter(p => p !== null);

            appRouter.sendResponse(res, 200, mappedProducts);
        } catch (e) {
            console.error('Wishlist Error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
