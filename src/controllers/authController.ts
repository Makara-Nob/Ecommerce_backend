import User, { IUser } from "../models/User";
import PendingRegistration from "../models/PendingRegistration";
import { generateToken, protect } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import { sendEmail } from "../utils/sendEmail";
import { getOtpEmailTemplate } from "../utils/emailTemplates";

export default function (appRouter: Router) {
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
        if (user.status !== 'ACTIVE') {
          // Generate new OTP and resend
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          
          user.otp = otp;
          user.otpExpiresAt = otpExpiresAt;
          await user.save();

          // Send email asynchronously
          try {
            sendEmail({
              email: user.email,
              subject: 'Verify your NAGA Shop Account',
              message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
              html: getOtpEmailTemplate(otp)
            }).catch(err => console.error('Background email error:', err));
          } catch (error) {
            console.error('Email trigger failed', error);
          }

          return appRouter.sendResponse(res, 401, {
            message: "Account not verified. A new OTP has been sent to your email.",
            isVerified: false,
            email: user.email
          });
        }

        appRouter.sendResponse(res, 200, {
          token: generateToken(user._id, user.roles),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
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
   *               - firstName
   *               - lastName
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *                 format: email
   *               password:
   *                 type: string
   *                 format: password
   *               firstName:
   *                 type: string
   *               lastName:
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
      const { username, email, password, firstName, lastName } = await appRouter.parseJsonBody(req);

      if (!username || !email || !password || !firstName || !lastName) {
        return appRouter.sendResponse(res, 400, {
          message: "Please provide username, email, password, firstName, and lastName",
        });
      }

      // Check if a verified user already exists
      const userExists = await User.findOne({ $or: [{ email }, { username }] });
      if (userExists) {
        return appRouter.sendResponse(res, 400, {
          message: "User already exists with that email or username"
        });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Replace any existing pending registration for this email/username
      await PendingRegistration.findOneAndDelete({ $or: [{ email }, { username }] });
      await PendingRegistration.create({ username, email, password, firstName, lastName, otp, otpExpiresAt });

      // Send OTP email in background — do not block the API response
      sendEmail({
        email,
        subject: 'Verify your NAGA Shop Account',
        message: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
        html: getOtpEmailTemplate(otp)
      }).catch(err => console.error('OTP email failed:', err));

      return appRouter.sendResponse(res, 201, {
        message: "Registration initiated. Please check your email for the OTP code.",
        email
      });
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

      // --- New flow: verify against PendingRegistration, then create the User ---
      const pending = await PendingRegistration.findOne({ email });

      if (pending) {
        if (pending.otp !== otp || pending.otpExpiresAt < new Date()) {
          return appRouter.sendResponse(res, 400, { message: "Invalid or expired OTP" });
        }

        // OTP is valid — create the verified user now
        const user = await User.create({
          username: pending.username,
          email: pending.email,
          password: pending.password,
          firstName: pending.firstName,
          lastName: pending.lastName,
          position: null,
          status: 'ACTIVE',
          userPermission: 'APPROVED',
          roles: ['CUSTOMER'],
        });

        // Clean up the pending record
        await PendingRegistration.findByIdAndDelete(pending._id);

        return appRouter.sendResponse(res, 200, {
          token: generateToken(user._id, user.roles),
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.roles && user.roles.length > 0 ? user.roles[0] : 'CUSTOMER',
            active: true,
            position: user.position,
            status: user.status,
            userPermission: user.userPermission,
            roles: user.roles,
          },
        });
      }

      // --- Legacy fallback: handle INACTIVE users created by the old flow ---
      const user = await User.findOne({ email });

      if (!user) {
        return appRouter.sendResponse(res, 404, { message: "User not found" });
      }

      if (user.status === 'ACTIVE') {
        return appRouter.sendResponse(res, 400, { message: "User already verified" });
      }

      if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
        return appRouter.sendResponse(res, 400, { message: "Invalid or expired OTP" });
      }

      user.status = 'ACTIVE';
      user.userPermission = 'APPROVED';
      user.otp = undefined;
      user.otpExpiresAt = undefined;
      await user.save();

      return appRouter.sendResponse(res, 200, {
        token: generateToken(user._id, user.roles),
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Check PendingRegistration first (new flow)
      const pending = await PendingRegistration.findOne({ email });

      if (pending) {
        pending.otp = otp;
        pending.otpExpiresAt = otpExpiresAt;
        await pending.save();
      } else {
        // Legacy fallback: INACTIVE user from old flow
        const user = await User.findOne({ email });
        if (!user) {
          return appRouter.sendResponse(res, 404, { message: "User not found" });
        }
        if (user.status === 'ACTIVE') {
          return appRouter.sendResponse(res, 400, { message: "User already verified" });
        }
        user.otp = otp;
        user.otpExpiresAt = otpExpiresAt;
        await user.save();
      }

      // Send OTP email in background — do not block the API response
      sendEmail({
        email,
        subject: 'Verify your NAGA Shop Account',
        message: `Your new OTP is: ${otp}. It will expire in 10 minutes.`,
        html: getOtpEmailTemplate(otp)
      }).catch(err => console.error('Resend OTP email failed:', err));

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
        appRouter.sendResponse(res, 200, {
          id: user._id.toString(),
          userIdentifier: user.username,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
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
          dob: user.dob,
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

      if (body.firstName !== undefined) user.firstName = body.firstName;
      if (body.lastName !== undefined) user.lastName = body.lastName;
      if (body.email) user.email = body.email;
      if (body.phone) user.phone = body.phone;
      if (body.phoneNumber) user.phone = body.phoneNumber;
      if (body.profileUrl) user.profileUrl = body.profileUrl;
      if (body.profileImageUrl) user.profileUrl = body.profileImageUrl;
      if (body.dob) user.dob = body.dob;
      if (body.address) user.address = body.address;
      if (body.notes) user.notes = body.notes;
      if (body.telegramNotificationsEnabled !== undefined) user.telegramNotificationsEnabled = body.telegramNotificationsEnabled;
      if (body.hasTelegramLinked !== undefined) user.hasTelegramLinked = body.hasTelegramLinked;
      if (body.position) user.position = body.position;
      if (body.status) user.status = body.status;
      if (body.accountStatus) user.status = body.accountStatus;

      await user.save();

      appRouter.sendResponse(res, 200, {
        id: user._id.toString(),
        userIdentifier: user.username,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        phoneNumber: user.phone,
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
        dob: user.dob,
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
