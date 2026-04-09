import { Promotion } from "../models/Promotion";
import { Product } from "../models/Product";
import User from "../models/User";
import Notification from "../models/Notification";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import { protect, admin } from "../utils/authPlugin";

export default function (appRouter: Router) {
    // @desc    Create a promotion and notify wishlist users
    // @route   POST /api/v1/admin/promotions
    // @access  Private/Admin
    appRouter.post("/api/v1/admin/promotions", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { name, description, discountType, discountValue, startDate, endDate, productId, status } = body;

            if (!name || !discountType || !discountValue || !startDate || !endDate || !productId) {
                return appRouter.sendResponse(res, 400, { message: "Required fields are missing" });
            }

            const product = await Product.findById(productId);
            if (!product) {
                return appRouter.sendResponse(res, 404, { message: "Product not found" });
            }

            const promotion = await Promotion.create({
                name,
                description,
                discountType,
                discountValue,
                startDate,
                endDate,
                product: productId,
                status: status || 'ACTIVE'
            });

            // If promotion is active, notify users who have this product in their wishlist
            if (promotion.status === 'ACTIVE') {
                await notifyWishlistUsers(productId, product.name, promotion);
            }

            appRouter.sendResponse(res, 201, promotion);
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get all promotions (Admin)
    // @route   POST /api/v1/admin/promotions/fetch
    // @access  Private/Admin
    appRouter.post("/api/v1/admin/promotions/fetch", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const pageNo = parseInt(body.pageNo) || 1;
            const pageSize = parseInt(body.pageSize) || 10;
            const search = body.search || '';

            const query: any = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }

            const totalElements = await Promotion.countDocuments(query);
            const totalPages = Math.ceil(totalElements / pageSize);

            const promotions = await Promotion.find(query)
                .populate('product', 'name sku imageUrl sellingPrice')
                .skip((pageNo - 1) * pageSize)
                .limit(pageSize)
                .sort({ createdAt: -1 });

            appRouter.sendResponse(res, 200, {
                content: promotions,
                pageNo,
                pageSize,
                totalElements,
                totalPages,
                last: pageNo >= totalPages
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Update a promotion
    // @route   PUT /api/v1/admin/promotions/:id
    // @access  Private/Admin
    appRouter.put("/api/v1/admin/promotions/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const promotion = await Promotion.findById(req.params.id);
            if (!promotion) {
                return appRouter.sendResponse(res, 404, { message: "Promotion not found" });
            }

            const body = await appRouter.parseJsonBody(req);
            const oldStatus = promotion.status;

            promotion.name = body.name || promotion.name;
            promotion.description = body.description !== undefined ? body.description : promotion.description;
            promotion.discountType = body.discountType || promotion.discountType;
            promotion.discountValue = body.discountValue !== undefined ? body.discountValue : promotion.discountValue;
            promotion.startDate = body.startDate || promotion.startDate;
            promotion.endDate = body.endDate || promotion.endDate;
            promotion.status = body.status || promotion.status;

            const updatedPromotion = await promotion.save();

            // Notify if status changed from something else to ACTIVE
            if (oldStatus !== 'ACTIVE' && updatedPromotion.status === 'ACTIVE') {
                const product = await Product.findById(updatedPromotion.product);
                if (product) {
                    await notifyWishlistUsers(product._id as any, product.name, updatedPromotion);
                }
            }

            appRouter.sendResponse(res, 200, updatedPromotion);
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete a promotion
    // @route   DELETE /api/v1/admin/promotions/:id
    // @access  Private/Admin
    appRouter.delete("/api/v1/admin/promotions/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const promotion = await Promotion.findById(req.params.id);
            if (!promotion) {
                return appRouter.sendResponse(res, 404, { message: "Promotion not found" });
            }

            await Promotion.findByIdAndDelete(req.params.id);
            appRouter.sendResponse(res, 200, { message: "Promotion removed" });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // Helper function to notify users
    async function notifyWishlistUsers(productId: number, productName: string, promotion: any) {
        try {
            const users = await User.find({ wishlist: productId });
            
            if (users.length === 0) return;

            const notifications = users.map(user => ({
                userId: user._id,
                title: "Wishlist Item on Promotion!",
                body: `Exclusive offer! "${productName}" is now featured in our "${promotion.name}" promotion. Don't miss out!`,
                data: {
                    type: "PROMOTION",
                    productId: productId,
                    promotionId: promotion._id,
                    discountType: promotion.discountType,
                    discountValue: promotion.discountValue
                }
            }));

            await Notification.insertMany(notifications);
        } catch (error) {
            console.error("Failed to send wishlist notifications:", error);
        }
    }
}
