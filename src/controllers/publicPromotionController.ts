import { Promotion } from '../models/Promotion';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/public/promotions:
     *   get:
     *     summary: Get all active promotions
     *     tags: [Public Promotions]
     *     description: Retrieve a list of all current active promotions that haven't expired.
     *     responses:
     *       200:
     *         description: Active promotions retrieved successfully
     */
    appRouter.get('/api/v1/public/promotions', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const currentDate = new Date();
            
            const promotions = await Promotion.find({
                status: 'ACTIVE',
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate }
            })
            .populate({
                path: 'product',
                select: '_id name description sellingPrice costPrice variants imageUrl images sku category brand supplier',
                populate: [
                    { path: 'category', select: '_id name description' },
                    { path: 'brand', select: '_id name description logoUrl' }
                ]
            })
            .sort({ endDate: 1 });

            const mappedPromotions = promotions.map((p: any) => {
                const pObj = p.toObject();
                // When using populate with select, we must be careful with mapping
                const product = pObj.product;
                
                return {
                    id: pObj._id,
                    name: pObj.name,
                    description: pObj.description,
                    discountType: pObj.discountType,
                    discountValue: pObj.discountValue,
                    startDate: pObj.startDate,
                    endDate: pObj.endDate,
                    productId: product ? product._id : 0,
                    productName: product ? product.name : '',
                    product: product ? {
                        ...product,
                        id: product._id,
                        category: product.category ? { ...product.category, id: product.category._id } : null,
                        brand: product.brand ? { ...product.brand, id: product.brand._id } : null,
                        supplier: product.supplier ? { ...product.supplier, id: product.supplier._id } : null,
                        variants: product.variants ? product.variants.map((v: any) => ({ ...v, id: v._id })) : []
                    } : {}
                };
            });

            appRouter.sendResponse(res, 200, mappedPromotions);
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
