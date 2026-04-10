import { Product, Category } from "../models/Product";
import StockTransaction from "../models/StockTransaction";
import { Order } from "../models/Order";
import User from "../models/User";
import { protect, admin } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";

export default function (appRouter: Router) {
    // @desc    Get dashboard stats
    // @route   GET /api/v1/reports/dashboard-stats
    // @access  Private/Admin
    appRouter.get("/api/v1/reports/dashboard-stats", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const totalProducts = await Product.countDocuments();
            const totalCategories = await Category.countDocuments();
            const outOfStock = await Product.countDocuments({ quantity: { $lte: 0 } });

            // We need to count products where quantity <= minStock, but quantity > 0
            const products = await Product.find({}, 'quantity minStock');
            let lowStock = 0;
            products.forEach(p => {
                if (p.quantity > 0 && p.quantity <= p.minStock) {
                    lowStock++;
                }
            });

            const data = {
                totalProducts,
                totalCategories,
                outOfStockProducts: outOfStock,
                lowStockProducts: lowStock
            };

            appRouter.sendResponse(res, 200, { message: "Dashboard stats retrieved successfully", data });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get stock status distribution
    // @route   GET /api/v1/reports/stock-distribution
    // @access  Private/Admin
    appRouter.get("/api/v1/reports/stock-distribution", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const products = await Product.find({}, 'quantity minStock');
            let inStock = 0;
            let lowStock = 0;
            let outOfStock = 0;

            products.forEach(p => {
                if (p.quantity <= 0) {
                    outOfStock++;
                } else if (p.quantity <= p.minStock) {
                    lowStock++;
                } else {
                    inStock++;
                }
            });

            const total = products.length || 1; // prevent division by zero

            const data = {
                inStockPercentage: Number(((inStock / total) * 100).toFixed(2)),
                lowStockPercentage: Number(((lowStock / total) * 100).toFixed(2)),
                outOfStockPercentage: Number(((outOfStock / total) * 100).toFixed(2)),
                inStockCount: inStock,
                lowStockCount: lowStock,
                outOfStockCount: outOfStock
            };

            appRouter.sendResponse(res, 200, { message: "Stock status distribution retrieved successfully", data });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get weekly stock movements
    // @route   GET /api/v1/reports/weekly-movements
    // @access  Private/Admin
    appRouter.get("/api/v1/reports/weekly-movements", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            // Calculate the start of the week (7 days ago)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const transactions = await StockTransaction.find({
                transactionDate: { $gte: sevenDaysAgo }
            });

            // Initialize map for the last 7 days
            const daysMap = new Map();
            for (let i = 0; i < 7; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dateString = d.toISOString().split('T')[0];
                daysMap.set(dateString, { date: dateString, stockIn: 0, stockOut: 0 });
            }

            transactions.forEach(t => {
                const tDateString = new Date(t.transactionDate).toISOString().split('T')[0];
                const dayData = daysMap.get(tDateString);
                if (dayData) {
                    if (['STOCK_IN', 'RETURN_TO_SUPPLIER', 'ADJUSTMENT'].includes(t.type)) { // Depends on adjustment but generally we can map it
                        // Simplification: just counting basic IN/OUT if previous < new
                        if (t.newStock > t.previousStock) {
                            dayData.stockIn += (t.newStock - t.previousStock);
                        } else if (t.newStock < t.previousStock) {
                            dayData.stockOut += (t.previousStock - t.newStock);
                        }
                    } else {
                        dayData.stockOut += t.quantity;
                    }
                }
            });

            const data = Array.from(daysMap.values());

            appRouter.sendResponse(res, 200, { message: "Weekly stock movements retrieved successfully", data });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get low stock alerts
    // @route   GET /api/v1/reports/alerts
    // @access  Private/Admin
    appRouter.get("/api/v1/reports/alerts", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const products = await Product.find({}, 'name sku quantity minStock')
                .populate('category', 'name');
            const alerts: any[] = [];

            products.forEach(p => {
                if (p.quantity <= p.minStock) {
                    alerts.push({
                        productId: p._id,
                        productName: p.name,
                        sku: p.sku,
                        categoryName: (p.category as any)?.name,
                        currentStock: p.quantity,
                        minStock: p.minStock,
                        status: p.quantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
                    });
                }
            });

            appRouter.sendResponse(res, 200, { message: "Low stock alerts retrieved successfully", data: alerts });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get comprehensive admin dashboard summary
    // @route   GET /api/v1/reports/admin-dashboard-summary
    // @access  Private/Admin
    appRouter.get("/api/v1/reports/admin-dashboard-summary", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            // 1. Basic Counts
            const totalProducts = await Product.countDocuments();
            const totalCustomers = await User.countDocuments({ roles: 'CUSTOMER' });
            
            // 2. Order & Revenue Stats
            const allOrders = await Order.find({ status: { $ne: 'CANCELLED' } });
            const totalRevenue = allOrders.reduce((sum, order) => sum + (order.netAmount || 0), 0);
            const totalOrdersCount = await Order.countDocuments();
            const activeOrdersCount = await Order.countDocuments({ 
                status: { $in: ['PENDING', 'CONFIRMED', 'SHIPPED'] } 
            });

            // 3. Sales Trend (Last 7 Days)
            const salesTrend: any[] = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateString = date.toISOString().split('T')[0];
                
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                const dayOrders = await Order.find({
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: { $ne: 'CANCELLED' }
                });

                const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.netAmount || 0), 0);
                
                salesTrend.push({
                    date: dateString,
                    revenue: Number(dayRevenue.toFixed(2)),
                    orderCount: dayOrders.length
                });
            }

            // 4. Recent Orders (Last 5)
            const recentOrders = await Order.find()
                .populate('userId', 'fullName profileUrl')
                .sort({ createdAt: -1 })
                .limit(5);

            const data = {
                summary: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalOrders: totalOrdersCount,
                    activeOrders: activeOrdersCount,
                    totalCustomers,
                    totalProducts
                },
                salesTrend,
                recentOrders: recentOrders.map(order => ({
                    id: order._id,
                    invoiceNumber: order.invoiceNumber,
                    customerName: (order.userId as any)?.fullName || 'Guest',
                    customerProfile: (order.userId as any)?.profileUrl,
                    amount: order.netAmount,
                    status: order.status,
                    createdAt: order.createdAt
                }))
            };

            appRouter.sendResponse(res, 200, { 
                message: "Dashboard summary retrieved successfully", 
                data 
            });
        } catch (e: any) {
            console.error('[Dashboard API Error]:', e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });
}
