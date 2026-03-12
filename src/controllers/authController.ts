import User, { IUser } from "../models/User";
import { generateToken, protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";

export default function(appRouter: Router) {
  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Auth user & get token
   *     tags: [Auth]
   *     description: Authenticate a user and return a token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - password
   *             properties:
   *               username:
   *                 type: string
   *               password:
   *                 type: string
   *                 format: password
   *     responses:
   *       200:
   *         description: Login successful
   *       400:
   *         description: Please provide username and password
   *       401:
   *         description: Invalid credentials
   */
  // @desc    Auth user & get token
  // @route   POST /api/v1/auth/login
  // @access  Public
  appRouter.post("/api/v1/auth/login", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { username, password } = await appRouter.parseJsonBody(req);

      if (!username || !password) {
        return appRouter.sendResponse(res, 400, {
          message: "Please provide username and password",
        });
      }

      // Find user and include password for validation
      const user = await User.findOne({ username });

      if (user && (await user.matchPassword(password))) {
        appRouter.sendResponse(res, 200, {
          token: generateToken(user._id),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
            active: user.status === 'ACTIVE',
            position: user.position,
            status: user.status,
            userPermission: user.userPermission,
            roles: user.roles,
          },
        });
      } else {
        appRouter.sendResponse(res, 401, { message: "Invalid credentials" });
      }
    } catch (e) {
      appRouter.sendResponse(res, 500, { message: "Server Error" });
    }
  });

  /**
   * @swagger
   * /api/v1/auth/me:
   *   get:
   *     summary: Get user profile
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     description: Get current logged in user profile
   *     responses:
   *       200:
   *         description: User profile data
   *       401:
   *         description: Not authorized API token
   *       404:
   *         description: User not found
   */
  // @desc    Get user profile
  // @route   GET /api/v1/auth/me
  // @access  Private
  appRouter.get("/api/v1/auth/me", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res, appRouter);
      if (!userId) {
        return; // protect handles the 401 response here
      }

      const user = await User.findOne({ id: userId });

      if (user) {
        appRouter.sendResponse(res, 200, {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
          active: user.status === 'ACTIVE',
          position: user.position,
          status: user.status,
          userPermission: user.userPermission,
          roles: user.roles,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });
      } else {
        appRouter.sendResponse(res, 404, { message: "User not found" });
      }
    } catch (e) {
      appRouter.sendResponse(res, 500, { message: "Server Error" });
    }
  });

  /**
   * @swagger
   * /api/v1/auth/validate-token:
   *   get:
   *     summary: Validate token
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     description: Validate if the current token is still valid
   *     responses:
   *       200:
   *         description: Token is valid
   *       401:
   *         description: Invalid token
   */
  // @desc    Validate token
  // @route   GET /api/v1/auth/validate-token
  // @access  Private
  appRouter.get("/api/v1/auth/validate-token", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res);
      // protect doesn't send the 401 response if we don't pass appRouter, so we can do it explicitly depending on requirements
      if (userId) {
        appRouter.sendResponse(res, 200, { valid: true });
      } else {
        appRouter.sendResponse(res, 401, {
          valid: false,
          message: "Invalid token",
        });
      }
    } catch (e) {
      appRouter.sendResponse(res, 500, { message: "Server Error" });
    }
  });
}
