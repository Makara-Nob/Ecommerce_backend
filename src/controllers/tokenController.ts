import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect } from '../utils/authPlugin';
import { DeviceToken } from '../models/DeviceToken';

export default function (appRouter: Router) {
  // @desc    Register FCM device token for push notifications
  // @route   POST /api/v1/tokens/register
  appRouter.post(
    "/api/v1/tokens/register",
    async (req: IncomingMessage, res: ServerResponse) => {
      try {
        const userId = await protect(req, res, appRouter);
        if (!userId) return;

        const { token, deviceType } = await appRouter.parseJsonBody(req);

        if (!token) {
          return appRouter.sendResponse(res, 400, { message: "Token is required" });
        }

        // Check if token exists, update user; or create new
        await DeviceToken.findOneAndUpdate(
          { token },
          { userId, token, deviceType: deviceType || 'android' },
          { upsert: true, new: true }
        );

        appRouter.sendResponse(res, 201, { message: "Token registered successfully" });
      } catch (e: any) {
        console.error("Token registration error:", e);
        appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
      }
    }
  );
}
