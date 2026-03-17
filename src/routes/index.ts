import { Router } from '../utils/Router';

// Controllers import
import authController from '../controllers/authController';
import productController from '../controllers/productController';
import cartController from '../controllers/cartController';
import orderController from '../controllers/orderController';
import addressController from '../controllers/addressController';
import swaggerSpec from '../config/swagger';

import adminCategoryController from '../controllers/adminCategoryController';
import adminBrandController from '../controllers/adminBrandController';
import adminSupplierController from '../controllers/adminSupplierController';
import adminProductController from '../controllers/adminProductController';
import adminFileController from '../controllers/adminFileController';
import userController from '../controllers/userController';
import adminBannerController from '../controllers/adminBannerController';
import stockTransactionController from '../controllers/stockTransactionController';
import reportController from '../controllers/reportController';

import publicPromotionController from '../controllers/publicPromotionController';
import publicBannerController from '../controllers/publicBannerController';

const appRouter = new Router();

// Controllers import
authController(appRouter);
productController(appRouter);
cartController(appRouter);
orderController(appRouter);
addressController(appRouter);
publicPromotionController(appRouter);
publicBannerController(appRouter);

// Admin Controllers import
adminCategoryController(appRouter);
adminBrandController(appRouter);
adminSupplierController(appRouter);
adminProductController(appRouter);
adminFileController(appRouter);
userController(appRouter);
adminBannerController(appRouter);
stockTransactionController(appRouter);
reportController(appRouter);

// Swagger definition
appRouter.get('/api-docs.json', async (req, res) => {
    res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(swaggerSpec));
});

// Swagger UI using CDN
appRouter.get('/api-docs', async (req, res) => {
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
        <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin:0; background: #fafafa; }
        </style>
    </head>
    <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js" crossorigin></script>
        <script>
            window.onload = () => {
                window.ui = SwaggerUIBundle({
                    url: '/api-docs.json',
                    dom_id: '#swagger-ui',
                });
            };
        </script>
    </body>
    </html>`;

    res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(html);
});

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API Health
 *     description: Returns the health status of the API.
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Raw Node API is running
 */
appRouter.get('/api/health', async (req, res) => {
    appRouter.sendResponse(res, 200, { status: 'OK', message: 'Raw Node API is running' });
});

export default appRouter;
