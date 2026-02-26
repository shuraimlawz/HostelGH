package com.hostelgh

import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class MyFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d("FCM", "New token: $token")
        // TODO: send the token to the backend so owner/tenant can receive notifications
        // Example: RetrofitClient.apiService.registerPushToken(TokenRequest(token))
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        // Handle messages here. For simplicity show a log.
        Log.d("FCM", "Message from: ${remoteMessage.from}")
        remoteMessage.notification?.let {
            Log.d("FCM", "Notification title: ${it.title}, body: ${it.body}")
            // could show a local notification here
        }
    }
}
