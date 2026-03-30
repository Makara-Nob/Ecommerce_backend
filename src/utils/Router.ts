import express, { Request, Response } from 'express';

export class Router {
    public expressRouter: express.Router;

    constructor() {
        this.expressRouter = express.Router();
    }

    get(path: string, handler: (req: any, res: any) => void | Promise<void>) {
        this.expressRouter.get(path, handler);
    }

    post(path: string, handler: (req: any, res: any) => void | Promise<void>) {
        this.expressRouter.post(path, handler);
    }

    put(path: string, handler: (req: any, res: any) => void | Promise<void>) {
        this.expressRouter.put(path, handler);
    }

    delete(path: string, handler: (req: any, res: any) => void | Promise<void>) {
        this.expressRouter.delete(path, handler);
    }

    sendResponse(res: any, statusCode: number, data: any) {
        const isSuccess = statusCode >= 200 && statusCode < 300;
        
        let responsePayload: any = {
            status: isSuccess ? 'success' : 'error',
            message: data?.message || (isSuccess ? 'Success' : 'Error'),
            data: null
        };

        if (isSuccess) {
            // Check if data is already wrapped in our structured format to avoid double wrapping
            if (data && data.status !== undefined && data.message !== undefined) {
                 responsePayload = data;
            } else if (data && data.message && Object.keys(data).length === 1) {
                 // Skip wrapping if it's just a {message: "..."} payload and keep data null
            } else {
                 responsePayload.data = data;
                 // Remove message from data if it exists there
                 if(responsePayload.data && responsePayload.data.message) {
                     delete responsePayload.data.message;
                 }
            }
        } else {
            // For errors, if data is an object but NOT just a message, put it in data
            if (data && typeof data === 'object' && Object.keys(data).some((k: string) => k !== 'message')) {
                const errorData = { ...data };
                delete errorData.message;
                if (Object.keys(errorData).length > 0) {
                    responsePayload.data = errorData;
                }
            }
        }

        res.status(statusCode).json(responsePayload);
    }

    parseJsonBody(req: any): Promise<any> {
        return Promise.resolve(req.body || {});
    }
}
