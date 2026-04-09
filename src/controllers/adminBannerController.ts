import Banner from "../models/Banner";
import { protect, admin } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";

export default function (appRouter: Router) {
    // @desc    Create new banner
    // @route   POST /api/v1/admin/banners
    // @access  Private/Admin
    appRouter.post("/api/v1/admin/banners", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);

            const banner = await Banner.create({
                title: body.title,
                description: body.description,
                imageUrl: body.imageUrl,
                linkUrl: body.linkUrl,
                displayOrder: body.displayOrder || 0,
                status: body.status || 'ACTIVE'
            });

            const mapped = {
                id: banner._id,
                title: banner.title,
                description: banner.description,
                imageUrl: banner.imageUrl,
                linkUrl: banner.linkUrl,
                displayOrder: banner.displayOrder,
                status: banner.status
            };

            appRouter.sendResponse(res, 201, mapped);
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Update banner
    // @route   PUT /api/v1/admin/banners/:id
    // @access  Private/Admin
    appRouter.put("/api/v1/admin/banners/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const banner = await Banner.findById(req.params.id);
            if (!banner) {
                return appRouter.sendResponse(res, 404, { message: "Banner not found" });
            }

            const body = await appRouter.parseJsonBody(req);

            banner.title = body.title || banner.title;
            banner.description = body.description !== undefined ? body.description : banner.description;
            banner.imageUrl = body.imageUrl || banner.imageUrl;
            banner.linkUrl = body.linkUrl !== undefined ? body.linkUrl : banner.linkUrl;
            banner.displayOrder = body.displayOrder !== undefined ? body.displayOrder : banner.displayOrder;
            banner.status = body.status || banner.status;

            const updatedBanner = await banner.save();

            const mapped = {
                id: updatedBanner._id,
                title: updatedBanner.title,
                description: updatedBanner.description,
                imageUrl: updatedBanner.imageUrl,
                linkUrl: updatedBanner.linkUrl,
                displayOrder: updatedBanner.displayOrder,
                status: updatedBanner.status
            };

            appRouter.sendResponse(res, 200, mapped);
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete banner
    // @route   DELETE /api/v1/admin/banners/:id
    // @access  Private/Admin
    appRouter.delete("/api/v1/admin/banners/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const banner = await Banner.findById(req.params.id);
            if (!banner) {
                return appRouter.sendResponse(res, 404, { message: "Banner not found" });
            }

            await Banner.findByIdAndDelete(req.params.id);

            appRouter.sendResponse(res, 200, { message: "Banner deleted successfully" });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get banner by ID
    // @route   GET /api/v1/admin/banners/:id
    // @access  Private/Admin
    appRouter.get("/api/v1/admin/banners/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const banner = await Banner.findById(req.params.id);
            if (!banner) {
                return appRouter.sendResponse(res, 404, { message: "Banner not found" });
            }

            const mapped = {
                id: banner._id,
                title: banner.title,
                description: banner.description,
                imageUrl: banner.imageUrl,
                linkUrl: banner.linkUrl,
                displayOrder: banner.displayOrder,
                status: banner.status
            };

            appRouter.sendResponse(res, 200, mapped);
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Search all banners
    // @route   POST /api/v1/admin/banners/search
    // @access  Private/Admin
    appRouter.post("/api/v1/admin/banners/search", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await protect(req, res, appRouter)) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const pageNo = body.pageNo || 1;
            const pageSize = body.pageSize || 10;
            const search = body.search || '';
            const status = body.status || '';

            const query: any = {};

            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }

            if (status) {
                query.status = status;
            }

            const totalElements = await Banner.countDocuments(query);
            const totalPages = Math.ceil(totalElements / pageSize);

            const banners = await Banner.find(query)
                .skip((pageNo - 1) * pageSize)
                .limit(pageSize)
                .sort({ displayOrder: 1, createdAt: -1 });

            const mapped = banners.map(b => ({
                id: b._id,
                title: b.title,
                description: b.description,
                imageUrl: b.imageUrl,
                linkUrl: b.linkUrl,
                displayOrder: b.displayOrder,
                status: b.status
            }));

            appRouter.sendResponse(res, 200, {
                content: mapped,
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
}
