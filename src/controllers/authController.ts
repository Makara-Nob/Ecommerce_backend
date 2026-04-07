import User, { IUser } from "../models/User";
import { generateToken, protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import { sendEmail } from "../utils/sendEmail";
import { getOtpEmailTemplate } from "../utils/emailTemplates";

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
          token: generateToken(user._id, user.roles),
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
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user & get token
   *     tags: [Auth]
   *     description: Register a new public user and return a token
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - username
   *               - email
   *               - password
   *               - fullName
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               fullName:
   *                 type: string
   *     responses:
   *       201:
   *         description: Registration successful
   *       400:
   *         description: Bad request (user already exists or missing data)
   *       500:
   *         description: Server error
   */
  // @desc    Register a new user & get token
  // @route   POST /api/v1/auth/register
  // @access  Public
  appRouter.post("/api/v1/auth/register", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { username, email, password, fullName } = await appRouter.parseJsonBody(req);

      if (!username || !email || !password || !fullName) {
        return appRouter.sendResponse(res, 400, {
          message: "Please provide username, email, password, and fullName",
        });
      }

      // Check if user already exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        return appRouter.sendResponse(res, 400, { 
          message: "User already exists with that email or username" 
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Create new user with CUSTOMER role
      const user = await User.create({
        username,
        email,
        password, // Password hashing is handled by the Mongoose pre-save hook
        fullName,
        position: null,
        status: 'INACTIVE', // Important: keep inactive until OTP is verified
        userPermission: 'PENDING',
        roles: ['CUSTOMER'],
        otp,
        otpExpiresAt
      });

      if (user) {
        // Send email
        try {
          await sendEmail({
            email: user.email,
            subject: 'Verify your E-Commerce Account',
            message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
            html: getOtpEmailTemplate(otp)
          });
        } catch (error) {
          console.error('Email could not be sent', error);
          // We don't abort registration here, but they might need to resend OTP
        }

        appRouter.sendResponse(res, 201, {
          message: "Registration successful. Please check your email for the OTP code.",
          email: user.email
        });
      } else {
        appRouter.sendResponse(res, 400, { message: "Invalid user data" });
      }
    } catch (e: any) {
      console.error(e);
      appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
    }
  });

  /**
   * @swagger
   * /api/v1/auth/verify-otp:
   *   post:
   *     summary: Verify Email OTP and login
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - otp
   *             properties:
   *               email:
   *                 type: string
   *               otp:
   *                 type: string
   *     responses:
   *       200:
   *         description: OTP verified and logged in
   *       400:
   *         description: Invalid or expired OTP
   */
  appRouter.post("/api/v1/auth/verify-otp", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { email, otp } = await appRouter.parseJsonBody(req);

      if (!email || !otp) {
        return appRouter.sendResponse(res, 400, { message: "Please provide email and otp" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return appRouter.sendResponse(res, 404, { message: "User not found" });
      }

      if (user.status === 'ACTIVE' && user.userPermission !== 'PENDING') {
        return appRouter.sendResponse(res, 400, { message: "User already verified" });
      }

      if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        return appRouter.sendResponse(res, 400, { message: "Invalid or expired OTP" });
      }

      // Mark user as active and clear OTP
      user.status = 'ACTIVE';
      user.userPermission = 'APPROVED';
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      appRouter.sendResponse(res, 200, {
        token: generateToken(user._id, user.roles),
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
    } catch (e: any) {
      console.error(e);
      appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
    }
  });

  /**
   * @swagger
   * /api/v1/auth/resend-otp:
   *   post:
   *     summary: Resend verification OTP
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: OTP resent
   */
  appRouter.post("/api/v1/auth/resend-otp", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const { email } = await appRouter.parseJsonBody(req);

      if (!email) {
        return appRouter.sendResponse(res, 400, { message: "Please provide an email" });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return appRouter.sendResponse(res, 404, { message: "User not found" });
      }

      if (user.status === 'ACTIVE' && user.userPermission !== 'PENDING') {
        return appRouter.sendResponse(res, 400, { message: "User already verified" });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      user.otp = otp;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();

      // Send email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Verify your E-Commerce Account',
          message: `Your new OTP is: ${otp}. It will expire in 10 minutes.`,
          html: getOtpEmailTemplate(otp)
        });
      } catch (error) {
        console.error('Email could not be sent', error);
        return appRouter.sendResponse(res, 500, { message: "Could not send email" });
      }

      appRouter.sendResponse(res, 200, { message: "OTP resent successfully" });
    } catch (e: any) {
      console.error(e);
      appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
    }
  });

  /**
   * @swagger
   * /api/v1/user/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [User]
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
  // @route   GET /api/v1/user/profile
  // @access  Private
  appRouter.get("/api/v1/user/profile", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res, appRouter);
      if (!userId) {
        return; // protect handles the 401 response here
      }

      const user = await User.findById(userId);
      if (user) {
        // Split fullName into firstName and lastName for the frontend
        const nameParts = (user.fullName || "").split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        appRouter.sendResponse(res, 200, {
          id: user._id.toString(),
          userIdentifier: user.username,
          username: user.username,
          email: user.email,
          firstName: firstName,
          lastName: lastName,
          fullName: user.fullName,
          role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
          userType: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
          active: user.status === 'ACTIVE',
          accountStatus: user.status,
          position: user.position,
          status: user.status,
          userPermission: user.userPermission,
          roles: user.roles,
          phone: user.phone,
          phoneNumber: user.phone,
          profileUrl: user.profileUrl,
          profileImageUrl: user.profileUrl,
          address: user.address,
          notes: user.notes,
          telegramNotificationsEnabled: user.telegramNotificationsEnabled,
          hasTelegramLinked: user.hasTelegramLinked,
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
   * /api/v1/user/profile:
   *   post:
   *     summary: Update profile
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     description: Update current logged in user profile
   *     responses:
   *       200:
   *         description: Profile updated
   *       401:
   *         description: Not authorized API token
   */
  // @desc    Update user profile
  // @route   POST /api/v1/user/profile
  // @access  Private
  appRouter.post("/api/v1/user/profile", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res, appRouter);
      if (!userId) {
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        return appRouter.sendResponse(res, 404, { message: "User not found" });
      }

      const body = await appRouter.parseJsonBody(req);
      
      // Map frontend fields to backend fields
      if (body.firstName || body.lastName) {
        const currentFullName = user.fullName || "";
        const nameParts = currentFullName.split(" ");
        const firstName = body.firstName !== undefined ? body.firstName : (nameParts[0] || "");
        const lastName = body.lastName !== undefined ? body.lastName : (nameParts.slice(1).join(" ") || "");
        user.fullName = `${firstName} ${lastName}`.trim();
      }
      
      if (body.fullName) user.fullName = body.fullName;
      if (body.email) user.email = body.email;
      if (body.phone) user.phone = body.phone;
      if (body.phoneNumber) user.phone = body.phoneNumber;
      if (body.profileUrl) user.profileUrl = body.profileUrl;
      if (body.profileImageUrl) user.profileUrl = body.profileImageUrl;
      if (body.address) user.address = body.address;
      if (body.notes) user.notes = body.notes;
      if (body.telegramNotificationsEnabled !== undefined) user.telegramNotificationsEnabled = body.telegramNotificationsEnabled;
      if (body.hasTelegramLinked !== undefined) user.hasTelegramLinked = body.hasTelegramLinked;
      if (body.position) user.position = body.position;
      if (body.status) user.status = body.status;
      if (body.accountStatus) user.status = body.accountStatus;

      await user.save();

      // Split fullName into firstName and lastName for the frontend
      const nameParts = (user.fullName || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      appRouter.sendResponse(res, 200, {
        id: user._id.toString(),
        userIdentifier: user.username,
        username: user.username,
        email: user.email,
        firstName: firstName,
        lastName: lastName,
        phone: user.phone,
        phoneNumber: user.phone,
        fullName: user.fullName,
        role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
        userType: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
        active: user.status === 'ACTIVE',
        accountStatus: user.status,
        position: user.position,
        status: user.status,
        userPermission: user.userPermission,
        roles: user.roles,
        profileUrl: user.profileUrl,
        profileImageUrl: user.profileUrl,
        address: user.address,
        notes: user.notes,
        telegramNotificationsEnabled: user.telegramNotificationsEnabled,
        hasTelegramLinked: user.hasTelegramLinked,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
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

  /**
   * @swagger
   * /api/v1/auth/delete-account:
   *   delete:
   *     summary: Delete account
   *     tags: [Auth]
   *     security:
   *       - bearerAuth: []
   *     description: Delete the current logged in user account
   *     responses:
   *       200:
   *         description: Account deleted
   *       401:
   *         description: Not authorized
   */
  appRouter.delete("/api/v1/auth/delete-account", async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res, appRouter);
      if (!userId) return;

      const user = await User.findById(userId);
      if (!user) {
        return appRouter.sendResponse(res, 404, { message: "User not found" });
      }

      await User.findByIdAndDelete(userId);

      appRouter.sendResponse(res, 200, { message: "Account deleted successfully" });
    } catch (e: any) {
      console.error(e);
      appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
    }
  });
}
