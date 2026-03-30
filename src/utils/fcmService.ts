import admin from 'firebase-admin';
import { DeviceToken } from '../models/DeviceToken';
import Notification from '../models/Notification';

// Safely initialize Firebase so it only happens once
if (process.env.FIREBASE_PROJECT_ID && !admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace hardcoded newlines in the string
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin Initialized Successfully");
    } catch (e) {
        console.error("Firebase Admin Initialization Error:", e);
    }
}

export const sendPushNotification = async (userId: number, title: string, body: string, data = {}) => {
    try {
        // Skip if Firebase wasn't initialized
        if (!admin.apps.length) return;

        // Fetch user's device tokens
        const deviceTokens = await DeviceToken.find({ userId });
        if (!deviceTokens || deviceTokens.length === 0) return;

        const tokens = deviceTokens.map(dt => dt.token);

        const message: admin.messaging.MulticastMessage = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens,
        };

        // 3. Save to History Database
        await Notification.create({
            userId,
            title,
            body,
            data,
        });

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Notification sent to user ${userId}. Success: ${response.successCount}, Failed: ${response.failureCount}`);
        
        // Optional: Clean up failed tokens (unregistered devices)
        response.responses.forEach((res, idx) => {
            if (!res.success && res.error?.code === 'messaging/registration-token-not-registered') {
                 DeviceToken.deleteOne({ token: tokens[idx] }).exec();
            }
        });
    } catch (error) {
        console.error('[FCM] Error sending push notification:', error);
    }
};
