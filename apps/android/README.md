# HostelGH Android App

This folder contains the native Android application that replaced the earlier Expo/React Native prototype.

## Getting Started

1. **Open in Android Studio**
   - File → Open → select this `apps/android` directory.
   - Sync Gradle and run on an emulator or connected device.

2. **Command line**
   ```bash
   cd apps/android
   ./gradlew assembleDebug    # build debug APK
   ./gradlew installDebug     # compile & install on connected device/emulator
   ```

3. **Backend configuration**
   - By default, network calls use `http://10.0.2.2:3000/api/` which resolves to localhost on the Android emulator.
   - If testing on a physical device, update `BASE_URL` in `RetrofitClient.kt` to your machine's IP address or use a tunneling tool (e.g., ngrok).

## Firebase Push Notifications

This app uses Firebase Cloud Messaging (FCM) for notifications. To enable:

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add an Android app with package name `com.hostelgh`.
3. Download the generated `google-services.json` and place it in `apps/android/app/`.
4. Your `app/build.gradle` already applies the `com.google.gms.google-services` plugin; rebuild the project.
5. Implement backend endpoint to accept device tokens from `MyFirebaseMessagingService.onNewToken`.

## Signing & Release

- Create a keystore:
  ```bash
  cd apps/android
  keytool -genkey -v -keystore release.keystore -alias hostelgh_key \
    -keyalg RSA -keysize 2048 -validity 10000
  ```
- Add the keystore credentials to `apps/android/gradle.properties`:
  ```properties
  RELEASE_KEYSTORE_PASSWORD=yourPassword
  RELEASE_KEY_PASSWORD=yourPassword
  RELEASE_KEY_ALIAS=hostelgh_key
  RELEASE_STORE_FILE=release.keystore
  ```
- Build a signed package:
  ```bash
  ./gradlew assembleRelease   # APK in app/build/outputs/apk/release
  ./gradlew bundleRelease     # AAB in app/build/outputs/bundle/release
  ```
- Upload the generated AAB to Google Play Console or distribute the APK directly.

## Features

- Authentication (login/register/forgot password)
- Explore hostels with images, ratings, and prices
- View hostel details and available room types
- Request booking with automatic 4‑month term
- View booking history (no cancellation in-app)
- Edit profile
- Logout and token management with interceptor

## Dependencies

- Kotlin 1.8.21
- Retrofit 2.9.0, Gson converter
- Coroutines 1.7.3
- RecyclerView 1.3.0
- Glide 4.16.0

## Notes

- The app is built using a simple MVP-style pattern with activities/fragments and coroutines.
- All API communication requires a valid JWT obtained from the backend upon login/register.
- 401 responses trigger automatic logout and redirect to login.

## Future Work

- Add push notifications (Firebase Cloud Messaging)
- Implement cancellation/booking interactions per backend updates
- Create iOS version (Swift/Kotlin Multiplatform) as needed

---

For developer questions, look at existing code or ask the original authors.