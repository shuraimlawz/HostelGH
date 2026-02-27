# Firebase Cloud Messaging (FCM) Setup Guide

Complete guide to set up Firebase Cloud Messaging for HostelGH push notifications across web and mobile platforms.

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Backend Configuration](#backend-configuration)
3. [Web Frontend Setup](#web-frontend-setup)
4. [Android App Setup](#android-app-setup)
5. [Testing Notifications](#testing-notifications)
6. [Troubleshooting](#troubleshooting)

---

## Firebase Project Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `HostelGH` (or your preference)
4. Select your region
5. Enable Google Analytics (optional)
6. Click "Create project"

### Step 2: Add Android App to Firebase

1. In Firebase Console, click "Add app" → "Android"
2. Enter package name: `com.hostelgh`
3. Download `google-services.json`
4. Place file in `apps/android/app/` directory
5. Follow on-screen instructions to add Firebase dependencies

### Step 3: Add Web App to Firebase

1. Click "Add app" → "Web"
2. Enter app name: `HostelGH Web`
3. Copy the Firebase config (you'll use this next)
4. No file download needed for web

### Step 4: Generate Service Account Key

1. Go to "Project Settings" → "Service Accounts"
2. Click "Generate New Private Key"
3. JSON file downloads automatically
4. Keep this secure - it's used by backend

---

## Backend Configuration

### Installation

```bash
npm install firebase-admin
```

### Environment Variables

Add to `apps/api/.env`:

```bash
# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY=your-private-key-from-json
FIREBASE_CLIENT_EMAIL=your-service-account-email@...
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=your-cert-url
```

Or create `apps/api/firebase-service-account.json` from downloaded key file.

### Firebase Service Implementation

Update `apps/api/src/modules/notifications/firebase.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as serviceAccount from '../../../firebase-service-account.json';

@Injectable()
export class FirebaseService {
  private firebase: admin.app.App;
  private messaging: admin.messaging.Messaging;

  constructor() {
    this.firebase = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });

    this.messaging = admin.messaging(this.firebase);
  }

  /**
   * Send notification to single device
   */
  async sendToDevice(deviceToken: string, message: any) {
    return this.messaging.send({
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data || {},
      token: deviceToken,
    });
  }

  /**
   * Send notification to multiple devices
   */
  async sendToDevices(deviceTokens: string[], message: any) {
    const messages = deviceTokens.map((token) => ({
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data || {},
      token,
    }));

    return this.messaging.sendAll(messages);
  }

  /**
   * Send to all users with a topic
   */
  async sendToTopic(topic: string, message: any) {
    return this.messaging.send({
      notification: {
        title: message.title,
        body: message.body,
        imageUrl: message.imageUrl,
      },
      data: message.data || {},
      topic,
    });
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(deviceTokens: string[], topic: string) {
    return this.messaging.subscribeToTopic(deviceTokens, topic);
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(deviceTokens: string[], topic: string) {
    return this.messaging.unsubscribeFromTopic(deviceTokens, topic);
  }

  /**
   * Batch send with custom options
   */
  async sendMulticast(tokens: string[], message: admin.messaging.BaseMessage) {
    return this.messaging.sendMulticast({
      tokens,
      ...message,
    });
  }
}
```

### Notifications Module

Create `apps/api/src/modules/notifications/notifications.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { UserRole } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * Register device token
   */
  @Post('device-token')
  async registerDeviceToken(
    @Req() req: any,
    @Body() { token, platform }: { token: string; platform: 'ios' | 'android' | 'web' },
  ) {
    return this.notificationsService.registerDeviceToken(
      req.user.id,
      token,
      platform,
    );
  }

  /**
   * Get user's notification preferences
   */
  @Get('preferences')
  async getPreferences(@Req() req: any) {
    return this.notificationsService.getPreferences(req.user.id);
  }

  /**
   * Update notification preferences
   */
  @Post('preferences')
  async updatePreferences(@Req() req: any, @Body() preferences: any) {
    return this.notificationsService.updatePreferences(req.user.id, preferences);
  }

  /**
   * Get notification history
   */
  @Get('history')
  async getNotificationHistory(
    @Req() req: any,
    @Query('limit') limit: number = 20,
  ) {
    return this.notificationsService.getNotificationHistory(req.user.id, limit);
  }

  /**
   * Admin: Send broadcast notification
   */
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Post('broadcast')
  async sendBroadcast(
    @Body()
    {
      title,
      body,
      target,
    }: { title: string; body: string; target: 'all' | 'tenants' | 'owners' },
  ) {
    return this.notificationsService.sendBroadcast(title, body, target);
  }

  /**
   * Mark notification as read
   */
  @Post(':notificationId/read')
  async markAsRead(@Req() req: any, @Param('notificationId') id: string) {
    return this.notificationsService.markAsRead(req.user.id, id);
  }
}
```

Create `apps/api/src/modules/notifications/notifications.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { FirebaseService } from './firebase.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
  ) {}

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: 'ios' | 'android' | 'web',
  ) {
    return this.prisma.deviceToken.upsert({
      where: { token },
      update: { lastUsed: new Date() },
      create: { userId, token, platform },
    });
  }

  /**
   * Send notification after booking approval
   */
  async sendBookingApprovedNotification(
    bookingId: string,
    tenantId: string,
    hostelName: string,
  ) {
    const deviceTokens = await this.getUserDeviceTokens(tenantId);

    if (deviceTokens.length === 0) return;

    await this.firebase.sendToDevices(deviceTokens, {
      title: 'Booking Approved! 🎉',
      body: `Your booking at ${hostelName} has been approved. You can now proceed to payment.`,
      data: {
        type: 'booking_approved',
        bookingId,
        action: 'view_booking',
      },
      imageUrl: 'https://example.com/booking-approved.png',
    });

    // Log notification
    await this.logNotification({
      userId: tenantId,
      type: 'booking_approved',
      title: 'Booking Approved!',
      body: `Your booking at ${hostelName} has been approved.`,
      relatedId: bookingId,
    });
  }

  /**
   * Send notification for new booking request (to owner)
   */
  async sendNewBookingNotification(
    bookingId: string,
    ownerId: string,
    tenantName: string,
    hostelName: string,
  ) {
    const deviceTokens = await this.getUserDeviceTokens(ownerId);

    if (deviceTokens.length === 0) return;

    await this.firebase.sendToDevices(deviceTokens, {
      title: 'New Booking Request! 📝',
      body: `${tenantName} requested a booking at ${hostelName}. Please review and approve.`,
      data: {
        type: 'new_booking',
        bookingId,
        action: 'view_booking',
      },
    });

    await this.logNotification({
      userId: ownerId,
      type: 'new_booking',
      title: 'New Booking Request',
      body: `${tenantName} requested a booking at ${hostelName}.`,
      relatedId: bookingId,
    });
  }

  /**
   * Send payment reminder notification
   */
  async sendPaymentReminderNotification(bookingId: string, tenantId: string) {
    const deviceTokens = await this.getUserDeviceTokens(tenantId);

    if (deviceTokens.length === 0) return;

    await this.firebase.sendToDevices(deviceTokens, {
      title: 'Payment Reminder 💰',
      body: 'Your booking payment is pending. Complete it now to secure your spot.',
      data: {
        type: 'payment_reminder',
        bookingId,
        action: 'make_payment',
      },
    });

    await this.logNotification({
      userId: tenantId,
      type: 'payment_reminder',
      title: 'Payment Reminder',
      body: 'Complete your booking payment now.',
      relatedId: bookingId,
    });
  }

  /**
   * Send check-in reminder (24 hours before)
   */
  async sendCheckInReminder(bookingId: string, tenantId: string) {
    const deviceTokens = await this.getUserDeviceTokens(tenantId);

    if (deviceTokens.length === 0) return;

    await this.firebase.sendToDevices(deviceTokens, {
      title: 'Check-in Tomorrow! 🏠',
      body: 'Your hostel check-in is scheduled for tomorrow. Prepare your documents.',
      data: {
        type: 'checkin_reminder',
        bookingId,
        action: 'view_booking',
      },
    });
  }

  /**
   * Send broadcast to all users or specific role
   */
  async sendBroadcast(title: string, body: string, target: 'all' | 'tenants' | 'owners') {
    const roleFilter =
      target === 'tenants' ? 'TENANT' : target === 'owners' ? 'OWNER' : null;

    const users = await this.prisma.user.findMany({
      where: roleFilter ? { role: roleFilter } : {},
      include: { deviceTokens: true },
    });

    const allTokens = users.flatMap((u) => u.deviceTokens.map((t) => t.token));

    if (allTokens.length > 0) {
      await this.firebase.sendToDevices(allTokens, {
        title,
        body,
        data: { type: 'broadcast' },
      });
    }

    // Log broadcast
    await this.prisma.notification.create({
      data: {
        type: 'broadcast',
        title,
        body,
        scope: target,
      },
    });
  }

  /**
   * Get user's device tokens
   */
  private async getUserDeviceTokens(userId: string) {
    const records = await this.prisma.deviceToken.findMany({
      where: { userId, active: true },
    });
    return records.map((r) => r.token);
  }

  /**
   * Log notification to history
   */
  private async logNotification(data: any) {
    return this.prisma.notification.create({
      data: {
        ...data,
        read: false,
      },
    });
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(userId: string, limit: number = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    });
  }

  /**
   * Get/update notification preferences
   */
  async getPreferences(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async updatePreferences(userId: string, preferences: any) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: preferences,
      create: { userId, ...preferences },
    });
  }
}
```

### Update Prisma Schema

Add to `prisma/schema.prisma`:

```prisma
model DeviceToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  platform  String   // ios, android, web
  active    Boolean  @default(true)
  lastUsed  DateTime @default(now())
  createdAt DateTime @default(now())

  @@index([userId])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  type      String   // booking_approved, new_booking, payment_reminder, etc.
  title     String
  body      String
  relatedId String?  // bookingId, hostelId, etc.
  read      Boolean  @default(false)
  scope     String?  // all, tenants, owners
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}

model NotificationPreference {
  id                    String  @id @default(cuid())
  userId                String  @unique
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailNotifications    Boolean @default(true)
  pushNotifications     Boolean @default(true)
  bookingUpdates        Boolean @default(true)
  paymentReminders      Boolean @default(true)
  newsAndOffers         Boolean @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([userId])
}
```

Run migrations:
```bash
npx prisma migrate dev --name add_firebase_notifications
```

---

## Web Frontend Setup

### Installation

```bash
cd web
npm install firebase
```

### Firebase Configuration

Create `web/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

/**
 * Request notification permission and get token
 */
export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      });
      return token;
    }
  } catch (error) {
    console.error('Notification permission error:', error);
  }
  return null;
}

/**
 * Handle incoming messages
 */
export function setupMessageListener(callback: (message: any) => void) {
  onMessage(messaging, (message) => {
    console.log('Foreground message:', message);
    callback(message);
  });
}
```

### Service Worker for Background Messages

Create `web/public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png',
    badge: '/badge.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.notification.data.action;
  const bookingId = event.notification.data.bookingId;

  if (action === 'view_booking' && bookingId) {
    clients.openWindow(`/bookings/${bookingId}`);
  }
});
```

### Integration in Layout

Update `web/app/layout.tsx`:

```typescript
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { requestNotificationPermission, setupMessageListener } from '@/lib/firebase';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function RootLayout({ children }) {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Request notification permission
    requestNotificationPermission().then((token) => {
      if (token) {
        // Save token to backend
        api.post('/notifications/device-token', {
          token,
          platform: 'web',
        }).catch((err) => {
          console.error('Failed to register device token:', err);
        });
      }
    });

    // Listen for foreground messages
    setupMessageListener((message) => {
      toast.success(message.notification.title, {
        description: message.notification.body,
      });

      // Optional: redirect based on notification type
      if (message.data.action === 'view_booking') {
        window.location.href = `/bookings/${message.data.bookingId}`;
      }
    });
  }, [user]);

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### Environment Variables

Add to `web/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key-from-fcm
```

---

## Android App Setup

### Dependencies Already Added

In `apps/android/app/build.gradle`:

```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.4.1'
    implementation 'com.google.firebase:firebase-auth:22.3.1'
}

plugins {
    id 'com.google.gms.google-services'
}
```

### Firebase Service Implementation

Create `apps/android/app/src/main/kotlin/com/hostelgh/firebase/FirebaseMessagingService.kt`:

```kotlin
package com.hostelgh.firebase

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.hostelgh.R
import com.hostelgh.HostelDetailActivity
import com.hostelgh.BookingsActivity

class FirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Send token to backend
        sendTokenToBackend(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: "HostelGH"
        val body = remoteMessage.notification?.body ?: ""
        val data = remoteMessage.data

        showNotification(title, body, data)
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        // Create notification channel for Android 8+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "hostelgh_notifications",
                "HostelGH Notifications",
                NotificationManager.IMPORTANCE_HIGH
            )
            notificationManager.createNotificationChannel(channel)
        }

        // Determine where to navigate based on notification type
        val intent = when (data["type"]) {
            "booking_approved", "new_booking", "payment_reminder" -> {
                Intent(this, BookingsActivity::class.java).apply {
                    putExtra("bookingId", data["bookingId"])
                }
            }
            "hostel_featured" -> {
                Intent(this, HostelDetailActivity::class.java).apply {
                    putExtra("hostelId", data["hostelId"])
                }
            }
            else -> null
        }

        val notification = NotificationCompat.Builder(this, "hostelgh_notifications")
            .setSmallIcon(R.drawable.ic_logo)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .apply {
                if (intent != null) {
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    val pendingIntent = android.app.PendingIntent.getActivity(
                        this@FirebaseMessagingService,
                        0,
                        intent,
                        android.app.PendingIntent.FLAG_UPDATE_CURRENT or android.app.PendingIntent.FLAG_IMMUTABLE
                    )
                    setContentIntent(pendingIntent)
                }
            }
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun sendTokenToBackend(token: String) {
        // Implementation will depend on your auth context
        // For now, store token and send after next login
        val sharedPref = getSharedPreferences("hostelgh_prefs", MODE_PRIVATE)
        sharedPref.edit().putString("fcm_token", token).apply()
    }
}
```

### Register in AndroidManifest.xml

```xml
<service
    android:name=".firebase.FirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

### Send Token on Login

Update `RetrofitClient.kt`:

```kotlin
private fun sendFCMTokenToBackend(context: Context, token: String) {
    val sharedPref = context.getSharedPreferences("hostelgh_prefs", Context.MODE_PRIVATE)
    val userId = sharedPref.getString("user_id", null) ?: return

    val requestBody = mapOf("token" to token, "platform" to "android")

    apiService.registerDeviceToken(requestBody).enqueue(object : Callback<Void> {
        override fun onResponse(call: Call<Void>, response: Response<Void>) {
            if (response.isSuccessful) {
                Log.d("FCM", "Token registered successfully")
                sharedPref.edit().putString("fcm_token_sent", "true").apply()
            }
        }

        override fun onFailure(call: Call<Void>, t: Throwable) {
            Log.e("FCM", "Failed to register token: ${t.message}")
        }
    })
}
```

---

## Testing Notifications

### Send Test Notification from Firebase Console

1. Go to Firebase Console → Messaging
2. Click "Send your first message"
3. Enter title and text
4. Click "Send test message"
5. Select web app / Android device
6. Click "Send test message"

### Send via API

```bash
curl -X POST http://localhost:3000/api/admin/broadcast \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "This is a test notification",
    "type": "info",
    "target": "all"
  }'
```

### Monitor in Firebase Console

1. Go to Messaging → All messages
2. View delivery status and analytics
3. See which devices received notification

---

## Troubleshooting

### Firebase Not Initializing

**Error**: `FirebaseApp is not initialized`

**Solution**:
```bash
# Ensure google-services.json is in correct location
ls apps/android/app/google-services.json

# Rebuild
./gradlew clean build
```

### Notifications Not Received

1. **Check device token registration**
   ```bash
   # In database
   SELECT token, platform FROM device_tokens WHERE user_id = 'user-id';
   ```

2. **Verify notification preferences**
   ```bash
   curl -X GET http://localhost:3000/api/notifications/preferences \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check FCM quota**
   - Go to Firebase Console → Quotas
   - Ensure you haven't hit rate limits

### Service Worker Issues (Web)

**Error**: `Service Worker registration failed`

**Solution**:
```bash
# Ensure firebase-messaging-sw.js is in public/ folder
ls web/public/firebase-messaging-sw.js

# Check console for CORS errors
```

### Android App Not Receiving Notifications

1. Verify FCM token is registered
2. Check app has notification permission: Settings → Notifications
3. Ensure Firebase module is added to build.gradle
4. Check logcat for errors: `adb logcat | grep FCM`

---

## Production Checklist

- [ ] Firebase project created
- [ ] Service account key secured (use environment variables)
- [ ] Web app VAPID key generated
- [ ] Android google-services.json added
- [ ] Backend notification services deployed
- [ ] Web service worker deployed
- [ ] Android app with FCM deployed
- [ ] Test notifications sent and received
- [ ] User notification preferences saved
- [ ] Monitoring & alerts configured
- [ ] Privacy policy updated for data collection
