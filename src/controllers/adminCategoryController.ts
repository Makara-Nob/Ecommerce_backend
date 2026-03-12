import { Category } from '../models/Product';
import { Router } from '../utils/Router';
import { IncomingMessage, ServerResponse } from 'http';
import { protect, admin } from '../utils/authPlugin';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/admin/categories:
     *   post:
     *     summary: Create a category
     *     tags: [Admin - Categories]
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
     *               code:
     *                 type: string
     *     responses:
     *       201:
     *         description: Category created
     */
    appRouter.post('/api/v1/admin/categories', async (req: IncomingMessage, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const { name, description, code } = await appRouter.parseJsonBody(req);
            
            if (!name) {
                return appRouter.sendResponse(res, 400, { message: 'Category name is required' });
            }

            const categoryExists = await Category.findOne({ name });
            if (categoryExists) {
                return appRouter.sendResponse(res, 400, { message: 'Category already exists' });
            }

            const category = await Category.create({ name, description, code });
            appRouter.sendResponse(res, 201, category);
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/admin/categories/{id}:
     *   put:
     *     summary: Update a category
     *     tags: [Admin - Categories]
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
     *               code:
     *                 type: string
     *     responses:
     *       200:
     *         description: Category updated
     */
    appRouter.put('/api/v1/admin/categories/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const { name, description, code } = await appRouter.parseJsonBody(req);
            const category = await Category.findOne({ id: req.params.id });

            if (category) {
                category.name = name || category.name;
                category.description = description !== undefined ? description : category.description;
                category.code = code || category.code;

                const updatedCategory = await category.save();
                appRouter.sendResponse(res, 200, updatedCategory);
            } else {
                appRouter.sendResponse(res, 404, { message: 'Category not found' });
            }
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

    /**
     * @swagger
     * /api/v1/admin/categories/{id}:
     *   delete:
     *     summary: Delete a category
     *     tags: [Admin - Categories]
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
     *         description: Category deleted
     */
    appRouter.delete('/api/v1/admin/categories/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            if (!await admin(req, res, appRouter)) return;

            const category = await Category.findOne({ id: req.params.id });

            if (category) {
                await Category.deleteOne({ _id: category._id });
                appRouter.sendResponse(res, 200, { message: 'Category removed' });
            } else {
                appRouter.sendResponse(res, 404, { message: 'Category not found' });
            }
        } catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });

}
