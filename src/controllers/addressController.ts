import { IncomingMessage, ServerResponse } from 'http';
import { Router } from '../utils/Router';
import { Address } from '../models/Address';
import { protect } from '../utils/authPlugin';

export default function(appRouter: Router) {
    /**
     * @swagger
     * /api/v1/addresses:
     *   get:
     *     summary: Get all addresses for the logged-in user
     *     tags: [Addresses]
     *     security:
     *       - bearerAuth: []
     */
    appRouter.get('/api/v1/addresses', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const addresses = await Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });

            // Format addresses
            const formattedAddresses = addresses.map((addr: any) => ({
                id: addr._id,
                title: addr.title,
                recipientName: addr.recipientName,
                phoneNumber: addr.phoneNumber,
                streetAddress: addr.streetAddress,
                city: addr.city,
                state: addr.state,
                zipCode: addr.zipCode,
                isDefault: addr.isDefault,
                createdAt: addr.createdAt,
                updatedAt: addr.updatedAt
            }));

            appRouter.sendResponse(res, 200, formattedAddresses);
        } catch (error) {
            console.error('Get Addresses Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error while fetching addresses' });
        }
    });

    /**
     * @swagger
     * /api/v1/addresses:
     *   post:
     *     summary: Create a new address
     *     tags: [Addresses]
     *     security:
     *       - bearerAuth: []
     */
    appRouter.post('/api/v1/addresses', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            let body = '';
            
            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const { title, recipientName, phoneNumber, streetAddress, city, state, zipCode, isDefault } = data;

                    if (!title || !recipientName || !phoneNumber || !streetAddress || !city) {
                        return appRouter.sendResponse(res, 400, { message: 'Missing required address fields' });
                    }

                    // If this is the user's first address, naturally make it default
                    const existingCount = await Address.countDocuments({ user: userId });
                    let shouldBeDefault = existingCount === 0 ? true : (isDefault || false);

                    // If setting to default, unset others
                    if (shouldBeDefault && existingCount > 0) {
                        await Address.updateMany({ user: userId }, { isDefault: false });
                    }

                    const newAddress = new Address({
                        user: userId,
                        title,
                        recipientName,
                        phoneNumber,
                        streetAddress,
                        city,
                        state,
                        zipCode,
                        isDefault: shouldBeDefault
                    });

                    await newAddress.save();

                    const responseAddress = {
                        id: newAddress._id,
                        title: newAddress.title,
                        recipientName: newAddress.recipientName,
                        phoneNumber: newAddress.phoneNumber,
                        streetAddress: newAddress.streetAddress,
                        city: newAddress.city,
                        state: newAddress.state,
                        zipCode: newAddress.zipCode,
                        isDefault: newAddress.isDefault
                    };

                    appRouter.sendResponse(res, 201, responseAddress);
                } catch (parseError) {
                    appRouter.sendResponse(res, 400, { message: 'Invalid JSON payload' });
                }
            });
        } catch (error) {
            console.error('Create Address Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error while creating address' });
        }
    });

    /**
     * @swagger
     * /api/v1/addresses/{id}:
     *   put:
     *     summary: Update an existing address
     *     tags: [Addresses]
     *     security:
     *       - bearerAuth: []
     */
    appRouter.put('/api/v1/addresses/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const addressId = req.params.id;

            let body = '';
            req.on('data', (chunk: Buffer) => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);
                    const address = await Address.findOne({ _id: addressId, user: userId });

                    if (!address) {
                        return appRouter.sendResponse(res, 404, { message: 'Address not found' });
                    }

                    // Update fields if provided
                    if (data.title) address.title = data.title;
                    if (data.recipientName) address.recipientName = data.recipientName;
                    if (data.phoneNumber) address.phoneNumber = data.phoneNumber;
                    if (data.streetAddress) address.streetAddress = data.streetAddress;
                    if (data.city) address.city = data.city;
                    if (data.state !== undefined) address.state = data.state;
                    if (data.zipCode !== undefined) address.zipCode = data.zipCode;

                    // Handle default status update
                    if (data.isDefault === true && !address.isDefault) {
                        await Address.updateMany({ user: userId }, { isDefault: false });
                        address.isDefault = true;
                    } else if (data.isDefault === false && address.isDefault) {
                        address.isDefault = false;
                    }

                    await address.save();

                    const responseAddress = {
                        id: address._id,
                        title: address.title,
                        recipientName: address.recipientName,
                        phoneNumber: address.phoneNumber,
                        streetAddress: address.streetAddress,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode,
                        isDefault: address.isDefault
                    };

                    appRouter.sendResponse(res, 200, responseAddress);
                } catch (err) {
                    appRouter.sendResponse(res, 400, { message: 'Invalid payload' });
                }
            });
        } catch (error) {
            console.error('Update Address Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/v1/addresses/{id}:
     *   delete:
     *     summary: Delete an address
     *     tags: [Addresses]
     *     security:
     *       - bearerAuth: []
     */
    appRouter.delete('/api/v1/addresses/:id', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const addressId = req.params.id;

            const address: any = await Address.findOneAndDelete({ _id: addressId, user: userId });

            if (!address) {
                return appRouter.sendResponse(res, 404, { message: 'Address not found' });
            }

            // If we deleted the default address, and other addresses exist, make the most recent one default
            if (address.isDefault) {
                const remaining = await Address.findOne({ user: userId }).sort({ createdAt: -1 });
                if (remaining) {
                    remaining.isDefault = true;
                    await remaining.save();
                }
            }

            appRouter.sendResponse(res, 200, { message: 'Address deleted successfully' });
        } catch (error) {
            console.error('Delete Address Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });

    /**
     * @swagger
     * /api/v1/addresses/{id}/default:
     *   put:
     *     summary: Set an address as default
     *     tags: [Addresses]
     *     security:
     *       - bearerAuth: []
     */
    appRouter.put('/api/v1/addresses/:id/default', async (req: IncomingMessage & { params?: any }, res: ServerResponse) => {
        try {
            const userId = await protect(req, res, appRouter);
            if (!userId) return;

            const addressId = req.params.id;

            const address = await Address.findOne({ _id: addressId, user: userId });

            if (!address) {
                return appRouter.sendResponse(res, 404, { message: 'Address not found' });
            }

            // Unset all others
            await Address.updateMany({ user: userId }, { isDefault: false });

            // Set this one
            address.isDefault = true;
            await address.save();

            appRouter.sendResponse(res, 200, { message: 'Address set as default', addressId: address._id });
        } catch (error) {
            console.error('Set Default Address Error:', error);
            appRouter.sendResponse(res, 500, { message: 'Server error' });
        }
    });
}
