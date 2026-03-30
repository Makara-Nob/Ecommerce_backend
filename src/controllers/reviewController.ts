import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect } from '../utils/authPlugin';
import Review from '../models/Review';
import User from '../models/User';
import { upload } from '../config/multer';

// Helper to run multer middleware
const runMiddleware = (req: any, res: any, fn: any) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result: any) => {
            if (result instanceof Error) return reject(result);
            return resolve(result);
        });
    });
};

export default function(appRouter: Router) {

    // ── GET /api/v1/public/products/:id/reviews ─────────────────────────────
    // Public — paginated, sorted newest first.
    // Returns reviews array + summary stats (avgRating, totalCount, ratingBreakdown)
    appRouter.get('/api/v1/public/products/:id/reviews', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const productId = parseInt(req.params?.id);
            if (isNaN(productId)) return appRouter.sendResponse(res, 400, { message: 'Invalid product id' });

            const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
            const page  = parseInt(url.searchParams.get('page')  || '1');
            const limit = parseInt(url.searchParams.get('limit') || '10');
            const skip  = (page - 1) * limit;

            const [reviews, total, stats] = await Promise.all([
                Review.find({ product: productId })
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Review.countDocuments({ product: productId }),

                Review.aggregate([
                    { $match: { product: productId } },
                    {
                        $group: {
                            _id: null,
                            avgRating: { $avg: '$rating' },
                            count1:    { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
                            count2:    { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
                            count3:    { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
                            count4:    { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
                            count5:    { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
                        }
                    }
                ])
            ]);

            const s = stats[0] || { avgRating: 0, count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 };

            appRouter.sendResponse(res, 200, {
                reviews: reviews.map(r => ({ ...r, id: r._id })),
                summary: {
                    avgRating:       parseFloat((s.avgRating || 0).toFixed(1)),
                    totalCount:      total,
                    ratingBreakdown: { 1: s.count1, 2: s.count2, 3: s.count3, 4: s.count4, 5: s.count5 },
                },
                totalPages: Math.ceil(total / limit),
                pageNo:     page,
            });
        } catch (e) {
            console.error('GET reviews error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    // ── POST /api/v1/reviews ────────────────────────────────────────────────
    // Authenticated — create a new review. One per product per user.
    appRouter.post('/api/v1/reviews', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            // Use multer upload.array('images', 5)
            try {
                await runMiddleware(req, res, upload.array('images', 5));
            } catch (err: any) {
                return appRouter.sendResponse(res, 400, { message: err.message });
            }

            const reqAny = req as any;
            const body = reqAny.body || {}; // Multer populates body for multipart
            
            // If it was a JSON request (non-multipart), req.body might not be set by multer
            // but appRouter.parseJsonBody would have worked if we didn't use multer.
            // However, once we run multer, it consumes the stream.
            // So we need to ensure we handle both or just decide it's multipart.
            // Best practice: if not multipart, multer won't populate body, so we check.
            const data = (Object.keys(body).length > 0) ? body : await appRouter.parseJsonBody(req).catch(() => ({}));

            const productId = parseInt(data.productId);
            const rating    = parseInt(data.rating);
            const title     = data.title;
            const reviewBody = data.body;

            if (!productId || !rating || !reviewBody) {
                return appRouter.sendResponse(res, 400, { message: 'productId, rating, and body are required' });
            }
            if (rating < 1 || rating > 5) {
                return appRouter.sendResponse(res, 400, { message: 'Rating must be between 1 and 5' });
            }

            const user = await User.findById(userId);
            if (!user) return appRouter.sendResponse(res, 404, { message: 'User not found' });

            // Check duplicate
            const existing = await Review.findOne({ product: productId, user: userId });
            if (existing) {
                return appRouter.sendResponse(res, 409, { message: 'You have already reviewed this product' });
            }

            // Map uploaded files to URLs
            const imageUrls = (reqAny.files as any[] ?? []).map(f => `/uploads/${f.filename}`);

            const review = await new Review({
                product:  productId,
                user:     userId,
                userName: user.fullName || user.username,
                rating,
                title:    title?.trim() || undefined,
                body:     reviewBody.trim(),
                images:   imageUrls,
            }).save();

            appRouter.sendResponse(res, 201, { ...review.toObject(), id: review._id });
        } catch (e: any) {
            console.error('POST review error:', e);
            if (e.code === 11000) {
                return appRouter.sendResponse(res, 409, { message: 'You have already reviewed this product' });
            }
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    // ── PUT /api/v1/reviews/:id ─────────────────────────────────────────────
    // Authenticated — update own review
    appRouter.put('/api/v1/reviews/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const reviewId = parseInt(req.params?.id);
            const review   = await Review.findById(reviewId);

            if (!review) return appRouter.sendResponse(res, 404, { message: 'Review not found' });
            if (review.user !== userId) return appRouter.sendResponse(res, 403, { message: 'Not authorised' });

            const body = await appRouter.parseJsonBody(req);
            if (body.rating !== undefined) {
                if (body.rating < 1 || body.rating > 5) return appRouter.sendResponse(res, 400, { message: 'Rating must be 1-5' });
                review.rating = body.rating;
            }
            if (body.title  !== undefined) review.title = body.title?.trim() || undefined;
            if (body.body   !== undefined) review.body  = body.body.trim();

            await review.save();
            appRouter.sendResponse(res, 200, { ...review.toObject(), id: review._id });
        } catch (e) {
            console.error('PUT review error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    // ── DELETE /api/v1/reviews/:id ──────────────────────────────────────────
    // Authenticated — delete own review (admin can delete any)
    appRouter.delete('/api/v1/reviews/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const reviewId = parseInt(req.params?.id);
            const review   = await Review.findById(reviewId);

            if (!review) return appRouter.sendResponse(res, 404, { message: 'Review not found' });

            const user = await User.findById(userId);
            const isAdmin = user?.roles?.includes('ADMIN');

            if (review.user !== userId && !isAdmin) {
                return appRouter.sendResponse(res, 403, { message: 'Not authorised' });
            }

            await Review.findByIdAndDelete(reviewId);
            appRouter.sendResponse(res, 200, { message: 'Review deleted' });
        } catch (e) {
            console.error('DELETE review error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    // ── GET /api/v1/reviews/my/:productId ──────────────────────────────────
    // Authenticated — check if current user already reviewed a product
    appRouter.get('/api/v1/reviews/my/:productId', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const productId = parseInt(req.params?.productId);
            const review    = await Review.findOne({ product: productId, user: userId }).lean();

            appRouter.sendResponse(res, 200, { review: review ? { ...review, id: review._id } : null });
        } catch (e) {
            console.error('GET my review error:', e);
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
