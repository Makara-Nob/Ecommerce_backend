"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const Product_1 = require("../models/Product");
const authPlugin_1 = require("../utils/authPlugin");
function default_1(appRouter) {
    /**
     * @swagger
     * /api/v1/admin/suppliers:
     *   get:
     *     summary: Fetch all suppliers
     *     tags: [Admin - Suppliers]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: A list of suppliers
     */
    appRouter.get('/api/v1/admin/suppliers', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const suppliers = await Product_1.Supplier.find({});
            appRouter.sendResponse(res, 200, suppliers);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/suppliers:
     *   post:
     *     summary: Create a supplier
     *     tags: [Admin - Suppliers]
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
     *               contactPerson:
     *                 type: string
     *               phone:
     *                 type: string
     *               email:
     *                 type: string
     *               address:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       201:
     *         description: Supplier created
     */
    appRouter.post('/api/v1/admin/suppliers', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const { name, contactPerson, phone, email, address, status } = await appRouter.parseJsonBody(req);
            if (!name) {
                return appRouter.sendResponse(res, 400, { message: 'Supplier name is required' });
            }
            const supplier = await Product_1.Supplier.create({ name, contactPerson, phone, email, address, status: status || 'ACTIVE' });
            appRouter.sendResponse(res, 201, supplier);
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/suppliers/{id}:
     *   put:
     *     summary: Update a supplier
     *     tags: [Admin - Suppliers]
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
     *               contactPerson:
     *                 type: string
     *               phone:
     *                 type: string
     *               email:
     *                 type: string
     *               address:
     *                 type: string
     *               status:
     *                 type: string
     *     responses:
     *       200:
     *         description: Supplier updated
     */
    appRouter.put('/api/v1/admin/suppliers/:id', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const { name, contactPerson, phone, email, address, status } = await appRouter.parseJsonBody(req);
            const supplier = await Product_1.Supplier.findOne({ id: req.params.id });
            if (supplier) {
                supplier.name = name || supplier.name;
                supplier.contactPerson = contactPerson !== undefined ? contactPerson : supplier.contactPerson;
                supplier.phone = phone !== undefined ? phone : supplier.phone;
                supplier.email = email !== undefined ? email : supplier.email;
                supplier.address = address !== undefined ? address : supplier.address;
                supplier.status = status || supplier.status;
                const updatedSupplier = await supplier.save();
                appRouter.sendResponse(res, 200, updatedSupplier);
            }
            else {
                appRouter.sendResponse(res, 404, { message: 'Supplier not found' });
            }
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
    /**
     * @swagger
     * /api/v1/admin/suppliers/{id}:
     *   delete:
     *     summary: Delete a supplier
     *     tags: [Admin - Suppliers]
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
     *         description: Supplier deleted
     */
    appRouter.delete('/api/v1/admin/suppliers/:id', async (req, res) => {
        try {
            if (!await (0, authPlugin_1.admin)(req, res, appRouter))
                return;
            const supplier = await Product_1.Supplier.findOne({ id: req.params.id });
            if (supplier) {
                await Product_1.Supplier.deleteOne({ _id: supplier._id });
                appRouter.sendResponse(res, 200, { message: 'Supplier removed' });
            }
            else {
                appRouter.sendResponse(res, 404, { message: 'Supplier not found' });
            }
        }
        catch (e) {
            appRouter.sendResponse(res, 500, { message: 'Server Error' });
        }
    });
}
