# AGT Product AI Android APK

This project wraps the deployed AGT Product AI web app in an Android WebView.

## Build

Requires JDK 17 and Gradle 8.10.2+.

    gradle assembleRelease -PappUrl=https://agt-product-ai.vercel.app

APK:

    app/build/outputs/apk/release/app-release.apk

To use another deployment:

    gradle assembleRelease -PappUrl=https://YOUR-DOMAIN.example
