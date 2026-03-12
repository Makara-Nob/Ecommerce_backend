"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router_1 = require("../utils/Router");
const authController_1 = __importDefault(require("../controllers/authController"));
const productController_1 = __importDefault(require("../controllers/productController"));
const cartController_1 = __importDefault(require("../controllers/cartController"));
const orderController_1 = __importDefault(require("../controllers/orderController"));
const swagger_1 = __importDefault(require("../config/swagger"));
const adminCategoryController_1 = __importDefault(require("../controllers/adminCategoryController"));
const adminBrandController_1 = __importDefault(require("../controllers/adminBrandController"));
const adminSupplierController_1 = __importDefault(require("../controllers/adminSupplierController"));
const adminProductController_1 = __importDefault(require("../controllers/adminProductController"));
const adminFileController_1 = __importDefault(require("../controllers/adminFileController"));
const publicPromotionController_1 = __importDefault(require("../controllers/publicPromotionController"));
const appRouter = new Router_1.Router();
// Controllers import
(0, authController_1.default)(appRouter);
(0, productController_1.default)(appRouter);
(0, cartController_1.default)(appRouter);
(0, orderController_1.default)(appRouter);
(0, publicPromotionController_1.default)(appRouter);
// Admin Controllers import
(0, adminCategoryController_1.default)(appRouter);
(0, adminBrandController_1.default)(appRouter);
(0, adminSupplierController_1.default)(appRouter);
(0, adminProductController_1.default)(appRouter);
(0, adminFileController_1.default)(appRouter);
// Swagger definition
appRouter.get('/api-docs.json', async (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(swagger_1.default));
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
    res.writeHead(200, { 'Content-Type': 'text/html' });
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
exports.default = appRouter;
