"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const authPlugin_1 = require("../utils/authPlugin");
const multer_1 = require("../config/multer");
// Helper to run multer middleware in standard Node.js request
const runMiddleware = (req, res, fn) => {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
};
function default_1(appRouter) {
    /**
     * @swagger
     * /api/v1/admin/files/upload:
     *   post:
     *     summary: Upload an image file
     *     tags: [Admin - Files]
     *     security:
     *       - bearerAuth: []
     *     description: Upload an image to the server (Admin only)
     *     requestBody:
     *       required: true
     *       content:
     *         multipart/form-data:
     *           schema:
     *             type: object
     *             properties:
     *               image:
     *                 type: string
     *                 format: binary
     *     responses:
     *       200:
     *         description: File uploaded successfully
     *       400:
     *         description: No file uploaded or invalid format
     *       401:
     *         description: Not authorized
     *       403:
     *         description: Not admin
     */
    appRouter.post('/api/v1/admin/files/upload', async (req, res) => {
        try {
            const userId = await (0, authPlugin_1.protect)(req, res, appRouter);
            if (!userId)
                return;
            const isAdminUser = await (0, authPlugin_1.admin)(req, res, appRouter);
            if (!isAdminUser)
                return;
            // Use multer upload.single('image')
            const uploadSingle = multer_1.upload.single('image');
            try {
                await runMiddleware(req, res, uploadSingle);
            }
            catch (err) {
                return appRouter.sendResponse(res, 400, { message: err.message });
            }
            const fileReq = req;
            if (!fileReq.file) {
                return appRouter.sendResponse(res, 400, { message: 'Please upload a file' });
            }
            // Return the relative URL starting with /uploads/
            const fileUrl = `/uploads/${fileReq.file.filename}`;
            appRouter.sendResponse(res, 200, {
                message: 'File uploaded successfully',
                url: fileUrl
            });
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
