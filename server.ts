import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import connectDB from './src/config/db';
import AppRouter from './src/routes/index';
import path from 'path';

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const app = express();

// Standard express middleware for REST APIs
app.use(cors());

// Parse JSON bodies (with a rawBody fallback for webhook verification just in case)
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount the converted AppRouter logic
app.use('/', AppRouter.expressRouter);

app.listen(PORT, () => {
    const host = 'http://localhost';
    console.log(`\n🚀 Server is running in ${process.env.NODE_ENV || 'development'} mode (Express Engine!)`);
    console.log(`🌐 API        : ${host}:${PORT}`);
    console.log(`📚 Swagger UI : ${host}:${PORT}/api-docs\n`);
});
