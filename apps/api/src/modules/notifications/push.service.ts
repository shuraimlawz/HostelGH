import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PushNotificationService implements OnModuleInit {
    constructor(private configService: ConfigService) { }

    onModuleInit() {
        const serviceAccount = this.configService.get("FIREBASE_SERVICE_ACCOUNT");
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
            });
        }
    }

    async sendToUser(fcmToken: string, title: string, body: string, data?: any) {
        if (!fcmToken) return;

        try {
            await admin.messaging().send({
                token: fcmToken,
                notification: { title, body },
                data: data || {},
            });
        } catch (error) {
            console.error('Error sending push notification:', error);
        }
    }
}
