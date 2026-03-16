import * as http from 'http';
import * as url from 'url';

export interface Route {
    method: string;
    path: string | RegExp;
    keys: string[];
    handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>;
}

export class Router {
    private routes: Route[];

    constructor() {
        this.routes = [];
    }

    addRoute(method: string, path: string, handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>) {
        const keys: string[] = [];
        // Convert express-style path (/users/:id) to RegExp
        // This regex matches /:paramName and captures the parameter name
        let regexPath = path;
        
        // Match parameters
        const paramMatches = path.match(/\/:([^\/]+)/g);
        if (paramMatches) {
            paramMatches.forEach(match => {
                keys.push(match.substring(2)); // Remove '/:'
            });
            // Replace /:paramName with regex pattern to match actual values
            regexPath = path.replace(/\/:([^\/]+)/g, '/([^/]+)');
        }
        
        // Create full regex string
        const regexString = `^${regexPath}/?$`; // Optional trailing slash
        
        this.routes.push({
            method: method.toUpperCase(),
            path: paramMatches ? new RegExp(regexString) : path,
            keys,
            handler
        });
    }

    get(path: string, handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>) {
        this.addRoute('GET', path, handler);
    }

    post(path: string, handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>) {
        this.addRoute('POST', path, handler);
    }

    put(path: string, handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>) {
        this.addRoute('PUT', path, handler);
    }

    delete(path: string, handler: (req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) => void | Promise<void>) {
        this.addRoute('DELETE', path, handler);
    }

    async handle(req: http.IncomingMessage & { params?: any }, res: http.ServerResponse) {
        if (!req.url) return this.sendResponse(res, 404, { message: 'URL not found' });
        
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const pathname = parsedUrl.pathname;
        
        console.log(`[Router] Received ${method} ${req.url} (Pathname: ${pathname})`);

        if (!method || !pathname) return this.sendResponse(res, 400, { message: 'Invalid Request' });

        for (const route of this.routes) {
            if (route.method === method) {
                // If path is a string, do exact match
                if (typeof route.path === 'string') {
                    if (route.path === pathname || route.path + '/' === pathname) {
                        return route.handler(req, res);
                    }
                } 
                // If path is regex, do regex match and extract params
                else if (route.path instanceof RegExp) {
                    const match = pathname.match(route.path);
                    if (match) {
                        req.params = {};
                        // Start at 1 because match[0] is the full matched string
                        for (let i = 1; i < match.length; i++) {
                            req.params[route.keys[i - 1]] = match[i];
                        }
                        return route.handler(req, res);
                    }
                }
            }
        }

        // Setup CORS preflight handling
        if (req.method === 'OPTIONS') {
            res.writeHead(204, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            });
            return res.end();
        }

        // If no route matches
        this.sendResponse(res, 404, { message: 'Route Not Found' });
    }

    sendResponse(res: http.ServerResponse, statusCode: number, data: any) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });

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
            if (data && typeof data === 'object' && Object.keys(data).some(k => k !== 'message')) {
                const errorData = { ...data };
                delete errorData.message;
                if (Object.keys(errorData).length > 0) {
                    responsePayload.data = errorData;
                }
            }
        }

        res.end(JSON.stringify(responsePayload));
    }

    parseJsonBody(req: http.IncomingMessage): Promise<any> {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                } catch (e) {
                    reject(e);
                }
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
    }
}
