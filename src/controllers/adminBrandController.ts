import { Brand } from '../models/Product';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect, admin } from '../utils/authPlugin';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/admin/brands:
     *   post:
     *     summary: Create a brand
     *     tags: [Admin - Brands]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               logoUrl:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Brand created
     */
    appRouter.post('/api/v1/admin/brands', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const { name, description, logoUrl, status } = await appRouter.parseJsonBody(req);
            
            if (!name) {
                return appRouter.sendResponse(res, 400, { message: 'Brand name is required' });
            }

            const brand = await Brand.create({ name, description, logoUrl, status: status || 'ACTIVE' });
            appRouter.sendResponse(res, 201, brand);
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/admin/brands/{id}:
     *   put:
     *     summary: Update a brand
     *     tags: [Admin - Brands]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               description:
     *                 type: string
     *               logoUrl:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: Brand updated
     */
    appRouter.put('/api/v1/admin/brands/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const { name, description, logoUrl, status } = await appRouter.parseJsonBody(req);
            const brand = await Brand.findOne({ id: req.params.id });

            if (brand) {
                brand.name = name || brand.name;
                brand.description = description !== undefined ? description : brand.description;
                brand.logoUrl = logoUrl !== undefined ? logoUrl : brand.logoUrl;
                brand.status = status || brand.status;

                const updatedBrand = await brand.save();
                appRouter.sendResponse(res, 200, updatedBrand);
            } else {
                appRouter.sendResponse(res, 404, { message: 'Brand not found' });
            }
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/admin/brands/{id}:
     *   delete:
     *     summary: Delete a brand
     *     tags: [Admin - Brands]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Brand deleted
     */
    appRouter.delete('/api/v1/admin/brands/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const brand = await Brand.findOne({ id: req.params.id });

            if (brand) {
                await Brand.deleteOne({ _id: brand._id });
                appRouter.sendResponse(res, 200, { message: 'Brand removed' });
            } else {
                appRouter.sendResponse(res, 404, { message: 'Brand not found' });
            }
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
