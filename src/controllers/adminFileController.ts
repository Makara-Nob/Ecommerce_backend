import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect, admin } from '../utils/authPlugin';
import { upload } from '../config/multer';
import path from 'path';

// Helper to run multer middleware in standard Node.js request
const runMiddleware = (req: any, res: any, fn: any) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default function(appRouter: Router) {
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
  appRouter.post('/api/v1/admin/files/upload', async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const userId = await protect(req, res, appRouter);
      if (!userId) return;
      
      const isAdminUser = await admin(req, res, appRouter);
      if (!isAdminUser) return;

      // Use multer upload.single('image')
      const uploadSingle = upload.single('image');
      
      try {
        await runMiddleware(req, res, uploadSingle);
      } catch (err: any) {
        return appRouter.sendResponse(res, 400, { message: err.message });
      }

      const fileReq = req as any;
      if (!fileReq.file) {
        return appRouter.sendResponse(res, 400, { message: 'Please upload a file' });
      }

      // Return the relative URL starting with /uploads/
      const targetFolder = (req as any).query?.folder || "";
      const fileUrl = targetFolder 
        ? `/uploads/${targetFolder}/${fileReq.file.filename}`
        : `/uploads/${fileReq.file.filename}`;

      appRouter.sendResponse(res, 200, { 
          message: 'File uploaded successfully',
          url: fileUrl 
      });

    } catch (e) {
      appRouter.sendResponse(res, 500, { message: 'Server Error' });
    }
  });
}
