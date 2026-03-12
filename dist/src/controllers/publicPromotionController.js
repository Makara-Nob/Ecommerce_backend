"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Promotion_1 = require("../models/Promotion");
function default_1(appRouter) {
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
    appRouter.get('/api/v1/public/promotions', async (req, res) => {
        try {
            const currentDate = new Date();
            const promotions = await Promotion_1.Promotion.find({
                status: 'ACTIVE',
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate }
            })
                .populate('product', 'id name description sellingPrice costPrice variants imageUrl sku')
                .sort({ endDate: 1 });
            appRouter.sendResponse(res, 200, {
                status: 'success',
                message: 'Active promotions retrieved successfully',
                data: promotions
            });
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
