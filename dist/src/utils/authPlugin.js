"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.protect = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION,
    });
};
exports.generateToken = generateToken;
const protect = async (req, res, appRouter) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Decode token and extract id
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return decoded.id; // Returns the integer ID to the controller
        }
        catch (error) {
            console.error('Not authorized, token failed');
        }
    }
    if (!token && appRouter) {
        // Only return 401 directly if the router was explicitly passed, else return null.
        appRouter.sendResponse(res, 401, { message: 'Not authorized, no token' });
    }
    return null;
};
exports.protect = protect;
const admin = async (req, res, appRouter) => {
    const userId = await (0, exports.protect)(req, res, appRouter);
    if (!userId)
        return false;
    const user = await User_1.default.findOne({ id: userId });
    // Check if roles array contains ADMIN
    if (user && user.roles && user.roles.includes('ADMIN')) {
        return true;
    }
    appRouter.sendResponse(res, 403, { message: 'Not authorized as an admin' });
    return false;
};
exports.admin = admin;
