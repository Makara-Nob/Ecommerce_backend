import 'dotenv/config';
import http, { IncomingMessage, ServerResponse } from 'http';
import connectDB from './src/config/db';
import AppRouter from './src/routes/index';

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
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
    await AppRouter.handle(req, res);
});

server.listen(PORT, () => {
    const host = 'http://localhost';
    console.log(`\n🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🌐 API        : ${host}:${PORT}`);
    console.log(`📚 Swagger UI : ${host}:${PORT}/api-docs\n`);
});
