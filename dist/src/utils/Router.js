"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Router = void 0;
const url = __importStar(require("url"));
class Router {
    constructor() {
        this.routes = [];
    }
    addRoute(method, path, handler) {
        const keys = [];
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
    get(path, handler) {
        this.addRoute('GET', path, handler);
    }
    post(path, handler) {
        this.addRoute('POST', path, handler);
    }
    put(path, handler) {
        this.addRoute('PUT', path, handler);
    }
    delete(path, handler) {
        this.addRoute('DELETE', path, handler);
    }
    async handle(req, res) {
        if (!req.url)
            return this.sendResponse(res, 404, { message: 'URL not found' });
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const pathname = parsedUrl.pathname;
        console.log(`[Router] Received ${method} ${req.url} (Pathname: ${pathname})`);
        if (!method || !pathname)
            return this.sendResponse(res, 400, { message: 'Invalid Request' });
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
    sendResponse(res, statusCode, data) {
        res.writeHead(statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*' // Add basic CORS to responses
        });
        const isSuccess = statusCode >= 200 && statusCode < 300;
        let responsePayload = {
            success: isSuccess,
            message: data?.message || (isSuccess ? 'Success' : 'Error'),
            data: null,
            error: null
        };
        if (isSuccess) {
            // Check if data is already wrapped in our structured format to avoid double wrapping
            if (data && data.success !== undefined && data.message !== undefined && data.data !== undefined) {
                responsePayload = data;
            }
            else if (data && data.message && Object.keys(data).length === 1) {
                // Skip wrapping if it's just a {message: "..."} payload and keep data null
            }
            else {
                responsePayload.data = data;
                // Remove message from data if it exists there
                if (responsePayload.data && responsePayload.data.message) {
                    delete responsePayload.data.message;
                }
            }
        }
        else {
            responsePayload.error = data;
        }
        res.end(JSON.stringify(responsePayload));
    }
    parseJsonBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    resolve(body ? JSON.parse(body) : {});
                }
                catch (e) {
                    reject(e);
                }
            });
            req.on('error', (err) => {
                reject(err);
            });
        });
    }
}
exports.Router = Router;
