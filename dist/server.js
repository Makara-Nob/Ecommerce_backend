"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const db_1 = __importDefault(require("./src/config/db"));
const index_1 = __importDefault(require("./src/routes/index"));
// Connect to Database
(0, db_1.default)();
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(async (req, res) => {
    // Basic CORS handler for Preflight OPTIONS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        });
        res.end();
        return;
    }
    // Handle all other routing
    await index_1.default.handle(req, res);
});
server.listen(PORT, () => {
    const host = 'http://localhost';
    console.log(`\n🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 API        : ${host}:${PORT}`);
    console.log(`📚 Swagger UI : ${host}:${PORT}/api-docs\n`);
});
