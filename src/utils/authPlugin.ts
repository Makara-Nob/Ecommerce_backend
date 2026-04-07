import jwt from 'jsonwebtoken';
import { IncomingMessage, ServerResponse } from 'http';
import { Router } from '../utils/Router'; // if we need response throwing
import User from '../models/User';

export const generateToken = (id: number | string, roles: string[] = []): string => {
    return jwt.sign({ id, roles }, process.env.JWT_SECRET as string, {
        expiresIn: process.env.JWT_EXPIRATION,
    } as jwt.SignOptions);
};

export const protect = async (req: any, res: ServerResponse, appRouter?: Router): Promise<number | null> => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // Decode token and extract id and roles
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: number, roles: string[] };
            
            // Attach decoded user info to the request object for later use by middleware/controllers
            req.user = decoded;
            
            return decoded.id; // Returns the integer ID to the controller
        } catch (error) {
            console.error('Not authorized, token failed');
            if (appRouter) {
                appRouter.sendResponse(res, 401, { message: 'Not authorized, token failed' });
            }
        }
    }

    if (!token && appRouter) {
        appRouter.sendResponse(res, 401, { message: 'Not authorized, no token' });
    }

    return null;
};

export const admin = async (req: any, res: ServerResponse, appRouter: Router): Promise<boolean> => {
    const userId = await protect(req, res, appRouter);
    if (!userId) return false;

    // Use roles directly from the token (stateless check)
    if (req.user && req.user.roles && req.user.roles.includes('ADMIN')) {
        return true;
    }

    appRouter.sendResponse(res, 403, { message: 'Not authorized as an admin' });
    return false;
};
