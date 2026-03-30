import { IncomingMessage, ServerResponse } from "http";
import url from "url";
import Notification from "../models/Notification";
import { protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";

export default function (appRouter: Router) {
  // @desc    Get user notifications
  // @route   GET /api/v1/notifications
  // @access  Private
  appRouter.get(
    "/api/v1/notifications",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const parsedUrl = url.parse(req.url || '', true);
        const page = parseInt((parsedUrl.query.page as string) || '1', 10);
        const limit = parseInt((parsedUrl.query.limit as string) || '20', 10);
        const skip = (page - 1) * limit;

        const totalElements = await Notification.countDocuments({ userId });
        const totalPages = Math.ceil(totalElements / limit);

        const notifications = await Notification.find({ userId })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit);

        const unreadCount = await Notification.countDocuments({
          userId,
          isRead: false,
        });

        appRouter.sendResponse(res, 200, {
          notifications,
          unreadCount,
          totalElements,
          totalPages,
          pageNo: page,
          pageSize: limit,
          last: page >= totalPages
        });
      } catch (e: any) {
        appRouter.sendResponse(res, 500, {
          message: e.message || "Server Error",
        });
      }
    }
  );

  // @desc    Mark specific notification as read
  // @route   POST /api/v1/notifications/:id/read
  // @access  Private
  appRouter.post(
    "/api/v1/notifications/:id/read",
    async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const notification = await Notification.findOneAndUpdate(
          { _id: req.params.id, userId },
          { isRead: true },
          { new: true }
        );

        if (!notification) {
          return appRouter.sendResponse(res, 404, { message: "Not found" });
        }

        appRouter.sendResponse(res, 200, notification);
      } catch (e: any) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    }
  );

  // @desc    Mark all unread notifications as read
  // @route   POST /api/v1/notifications/read-all
  // @access  Private
  appRouter.post(
    "/api/v1/notifications/read-all",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        await Notification.updateMany({ userId, isRead: false }, { isRead: true });

        appRouter.sendResponse(res, 200, { message: "All marked as read" });
      } catch (e: any) {
        appRouter.sendResponse(res, 500, { message: "Server Error" });
      }
    }
  );
}
