import User from "../models/User";
import { protect, admin } from "../utils/authPlugin";
import { Router } from "../utils/Router";
import { IncomingMessage, ServerResponse } from "http";
import bcrypt from 'bcryptjs';

export default function (appRouter: Router) {
    // @desc    Get all users (with pagination and search)
    // @route   POST /api/v1/user
    // @access  Private/Admin
    appRouter.post("/api/v1/user", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const pageNo = body.pageNo || 1;
            const pageSize = body.pageSize || 10;
            const search = body.search || '';
            const status = body.status || '';

            const query: any = {};

            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            if (status) {
                query.status = status;
            }

            const totalElements = await User.countDocuments(query);
            const totalPages = Math.ceil(totalElements / pageSize);

            const users = await User.find(query)
                .select('-password')
                .skip((pageNo - 1) * pageSize)
                .limit(pageSize)
                .sort({ createdAt: -1 });

            const mappedUsers = users.map(user => ({
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                position: user.position,
                status: user.status,
                userPermission: user.userPermission,
                roles: user.roles,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }));

            appRouter.sendResponse(res, 200, {
                message: "Users retrieved successfully",
                data: {
                    content: mappedUsers,
                    pageNo,
                    pageSize,
                    totalElements,
                    totalPages,
                    last: pageNo >= totalPages
                }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get user by ID
    // @route   POST /api/v1/user/getById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/getById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id).select('-password');

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const mappedUser = {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                position: user.position,
                status: user.status,
                userPermission: user.userPermission,
                roles: user.roles,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            };

            appRouter.sendResponse(res, 200, { message: "User details retrieved successfully", data: mappedUser });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Create new user (by Admin)
    // @route   POST /api/v1/user/create-user
    // @access  Private/Admin
    appRouter.post("/api/v1/user/create-user", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { username, email, password, fullName, position, status, userPermission, roles } = body;

            const userExists = await User.findOne({ $or: [{ email }, { username }] });
            if (userExists) {
                return appRouter.sendResponse(res, 400, { message: "User already exists with that email or username" });
            }

            const user = await User.create({
                username,
                email,
                password,
                fullName,
                position: position || null,
                status: status || 'ACTIVE',
                userPermission: userPermission || 'APPROVED',
                roles: roles || ['CUSTOMER']
            });

            if (user) {
                appRouter.sendResponse(res, 201, {
                    message: "User created successfully",
                    data: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        position: user.position,
                        status: user.status,
                        userPermission: user.userPermission,
                        roles: user.roles,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                });
            } else {
                appRouter.sendResponse(res, 400, { message: "Invalid user data" });
            }
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete user by ID
    // @route   POST /api/v1/user/deleteById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/deleteById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id);

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            await User.findByIdAndDelete(req.params.id);

            appRouter.sendResponse(res, 200, { message: "User deleted successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Update user
    // @route   POST /api/v1/user/updateById/:id
    // @access  Private/Admin
    appRouter.post("/api/v1/user/updateById/:id", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const user = await User.findById(req.params.id);

            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const body = await appRouter.parseJsonBody(req);

            user.fullName = body.fullName || user.fullName;
            user.email = body.email || user.email;
            user.position = body.position !== undefined ? body.position : user.position;
            user.status = body.status || user.status;
            user.userPermission = body.userPermission || user.userPermission;
            user.roles = body.roles || user.roles;

            if (body.password) {
                user.password = body.password; // mongoose pre-save hook will hash it
            }

            const updatedUser = await user.save();

            appRouter.sendResponse(res, 200, {
                message: "User updated successfully",
                data: {
                    id: updatedUser._id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    position: updatedUser.position,
                    status: updatedUser.status,
                    userPermission: updatedUser.userPermission,
                    roles: updatedUser.roles,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt
                }
            });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Change password
    // @route   POST /api/v1/user/change-password
    // @access  Private
    appRouter.post("/api/v1/user/change-password", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const body = await appRouter.parseJsonBody(req);
            const { oldPassword, newPassword } = body;

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            const isMatch = await user.matchPassword(oldPassword);
            if (!isMatch) {
                return appRouter.sendResponse(res, 400, { message: "Old password does not match" });
            }

            user.password = newPassword;
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Password changed successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Change password by admin
    // @route   POST /api/v1/user/change-password-by-admin
    // @access  Private/Admin
    appRouter.post("/api/v1/user/change-password-by-admin", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const adminId = await protect(req, res, appRouter);
            if (!adminId) return;
            if (!await admin(req, res, appRouter)) return;

            const body = await appRouter.parseJsonBody(req);
            const { userId, newPassword } = body;

            const user = await User.findById(userId);
            if (!user) {
                return appRouter.sendResponse(res, 404, { message: "User not found" });
            }

            user.password = newPassword;
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Password changed by admin successfully", data: { id: user._id } });
        } catch (e: any) {
            console.error(e);
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Get saved cards for current user
    // @route   GET /api/v1/users/saved-cards
    // @access  Private
    appRouter.get("/api/v1/users/saved-cards", async (req: IncomingMessage, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const user = await User.findById(userId).select('savedCards');
            if (!user) return appRouter.sendResponse(res, 404, { message: "User not found" });

            // Return masked data only (never expose pwt in listing)
            const cards = (user.savedCards || []).map((c: any, i: number) => ({
                index: i,
                maskPan: c.maskPan,
                cardType: c.cardType,
                ctid: c.ctid,
            }));

            appRouter.sendResponse(res, 200, { savedCards: cards });
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });

    // @desc    Delete a saved card by index
    // @route   DELETE /api/v1/users/saved-cards/:index
    // @access  Private
    appRouter.delete("/api/v1/users/saved-cards/:index", async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const idx = parseInt(req.params.index, 10);
            const user = await User.findById(userId);
            if (!user) return appRouter.sendResponse(res, 404, { message: "User not found" });

            if (isNaN(idx) || idx < 0 || idx >= user.savedCards.length) {
                return appRouter.sendResponse(res, 400, { message: "Invalid card index" });
            }

            user.savedCards.splice(idx, 1);
            await user.save();

            appRouter.sendResponse(res, 200, { message: "Card removed" });
        } catch (e: any) {
            appRouter.sendResponse(res, 500, { message: e.message || "Server Error" });
        }
    });
}
