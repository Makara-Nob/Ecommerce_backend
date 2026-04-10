import { Order } from '../models/Order';
import User from '../models/User';
import Notification from '../models/Notification';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { admin } from '../utils/authPlugin';
import { sendPushNotification } from '../utils/fcmService';

export default function (appRouter: Router) {
    /**
     * @swagger
     * /api/v1/admin/orders/fetch:
     *   post:
     *     summary: Fetch all orders with pagination and search (Admin)
     *     tags: [Admin - Orders]
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
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: List of orders
     */
    appRouter.post('/api/v1/admin/orders/fetch', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const page = parseInt(body.pageNo as string) || 1;
            const limit = parseInt(body.pageSize as string) || 10;
            const skip = (page - 1) * limit;
            const search = body.search as string || '';
            const status = body.status as string || '';

            const query: any = {};

            if (status && status !== 'ALL') {
                query.status = status;
            }

            if (search) {
                // Search by invoice number or user name (via populate but MongoDB needs a different strategy for nested search or separate lookup)
                // For simplicity, we search by invoiceNumber first. 
                // To search by user name, we'd normally use an aggregation or find user ids first.
                const users = await User.find({ fullName: { $regex: search, $options: 'i' } }).select('_id');
                const userIds = users.map(u => u._id);

                query.$or = [
                    { invoiceNumber: { $regex: search, $options: 'i' } },
                    { userId: { $in: userIds } }
                ];
            }

            const total = await Order.countDocuments(query);
            const orders = await Order.find(query)
                .populate('userId', 'fullName email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            const response = {
                content: orders.map(o => {
                    const obj = o.toObject();
                    const userObj = obj.userId;
                    return {
                        ...obj,
                        id: obj._id,
                        userId: (userObj && typeof userObj === 'object') ? (userObj as any)._id : obj.userId,
                        user: userObj
                    };
                }),
                pageNo: page,
                pageSize: limit,
                totalElements: total,
                totalPages: Math.ceil(total / limit),
                last: page * limit >= total
            };

            appRouter.sendResponse(res, 200, response);
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/admin/orders/{id}/status:
     *   put:
     *     summary: Update order shipping status (Admin)
     *     tags: [Admin - Orders]
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
     *               status:
     *                 type: string
     *                 enum: [PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED]
     *     responses:
     *       200:
     *         description: Status updated
     */
    appRouter.put('/api/v1/admin/orders/:id/status', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const { status } = await appRouter.parseJsonBody(req);
            if (!['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
                return appRouter.sendResponse(res, 400, { message: 'Invalid status' });
            }

            const order = await Order.findById(req.params.id);
            if (!order) return appRouter.sendResponse(res, 404, { message: 'Order not found' });

            const oldStatus = order.status;
            order.status = status;
            await order.save();

            // Notify user if status changed to SHIPPED or DELIVERED
            if (status !== oldStatus) {
                let title = '';
                let body = '';
                let type = '';

                if (status === 'SHIPPED') {
                    title = 'Order Shipped! 🚚';
                    body = `Good news! Your order #${order.id} has been shipped and is on its way.`;
                    type = 'SHIPPING';
                } else if (status === 'DELIVERED') {
                    title = 'Order Delivered! 📦';
                    body = `Your order #${order.id} has been delivered. We hope you enjoy your purchase!`;
                    type = 'DELIVERY';
                } else if (status === 'CONFIRMED') {
                    title = 'Order Confirmed! ✅';
                    body = `Your order #${order.id} has been confirmed and is being prepared.`;
                    type = 'ORDER_CONFIRMED';
                }

                if (title && body) {
                    // 1. Create database notification record
                    await Notification.create({
                        userId: order.userId,
                        title,
                        body,
                        data: { orderId: order.id.toString(), type }
                    });

                    // 2. Send push notification
                    await sendPushNotification(
                        order.userId,
                        title,
                        body,
                        { orderId: order.id.toString(), type }
                    );
                }
            }

            appRouter.sendResponse(res, 200, { success: true, status: order.status });
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || 'Server Error' });
        }
    });
}
