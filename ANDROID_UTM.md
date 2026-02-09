# React Native UTM Tracking Integration Guide

## Overview

The native Android SDK includes UTM tracking functionality that can be partially integrated into a React Native wrapper. This document outlines what works automatically and what requires additional implementation.

---

## What Works Automatically ✓

### Install Referrer Tracking

The install referrer tracking works automatically if you call `initializeInstallReferrer()` during SDK initialization. This captures UTM parameters from Google Play Store installations on the first app launch.

**Implementation:**

- Call `initializeInstallReferrer()` in your native module's initialization
- This only runs once on first launch (tracked via SharedPreferences)
- Captures UTM parameters from the Play Store install referrer
- Automatically sends data to backend with event type "INSTALL"

---

## What Requires Integration ✗

### Deeplink Tracking

Deeplink tracking requires manual integration between React Native and the native layer.

### Implementation Steps:

#### 1. Capture Deeplinks in React Native

Use React Native's Linking API to capture deeplinks:

```javascript
import { Linking } from "react-native";

// For cold starts (app launched via deeplink)
Linking.getInitialURL().then((url) => {
  if (url) {
    AdgeistSDK.trackDeeplinkUtm(url);
  }
});

// For warm starts (app already running, receives deeplink)
const handleDeeplink = (event) => {
  if (event.url) {
    AdgeistSDK.trackDeeplinkUtm(event.url);
  }
};

Linking.addEventListener("url", handleDeeplink);

// Don't forget to cleanup
return () => {
  Linking.removeEventListener("url", handleDeeplink);
};
```

#### 2. Create Native Bridge Method (Android)

Add a method in your React Native bridge module to expose `trackFromDeeplink`:

```kotlin
// In your React Native Android module
@ReactMethod
fun trackDeeplinkUtm(url: String) {
    val uri = Uri.parse(url)
    utmTracker.trackFromDeeplink(uri)
}
```

#### 3. Expose Method in JavaScript

```javascript
// In your RN wrapper
import { NativeModules } from "react-native";

const { AdgeistSDKModule } = NativeModules;

export const AdgeistSDK = {
  // ... other methods

  trackDeeplinkUtm: (url) => {
    if (url) {
      AdgeistSDKModule.trackDeeplinkUtm(url);
    }
  },
};
```

---

## Complete React Native Integration Example

### 1. Native Module (Kotlin)

```kotlin
package com.yourcompany.adgeistsdk

import android.net.Uri
import com.adgeistkit.core.AdgeistKit
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AdgeistSDKModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AdgeistSDKModule"
    }

    @ReactMethod
    fun initialize(apiKey: String, bidRequestBackendDomain: String) {
        val context = reactApplicationContext.applicationContext
        AdgeistKit.initialize(context, apiKey, bidRequestBackendDomain)

        // Initialize install referrer tracking automatically
        AdgeistKit.getInstance()?.utmTracker?.initializeInstallReferrer()
    }

    @ReactMethod
    fun trackDeeplinkUtm(url: String) {
        val uri = Uri.parse(url)
        AdgeistKit.getInstance()?.utmTracker?.trackFromDeeplink(uri)
    }

    @ReactMethod
    fun getUtmParameters(promise: Promise) {
        try {
            val params = AdgeistKit.getInstance()?.utmTracker?.getUtmParameters()
            val map = Arguments.createMap().apply {
                putString("source", params?.source)
                putString("campaign", params?.campaign)
                putString("data", params?.data)
                putString("sessionId", params?.sessionId)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("UTM_ERROR", e.message)
        }
    }

    @ReactMethod
    fun clearUtmParameters() {
        AdgeistKit.getInstance()?.utmTracker?.clearUtmParameters()
    }
}
```

### 2. JavaScript Wrapper

```javascript
// AdgeistSDK.js
import { NativeModules, Linking } from "react-native";

const { AdgeistSDKModule } = NativeModules;

class AdgeistSDK {
  static isInitialized = false;

  /**
   * Initialize the SDK
   * @param {string} apiKey - Your API key
   * @param {string} bidRequestBackendDomain - Backend domain
   */
  static async initialize(apiKey, bidRequestBackendDomain) {
    await AdgeistSDKModule.initialize(apiKey, bidRequestBackendDomain);
    this.isInitialized = true;

    // Automatically set up deeplink tracking
    this.setupDeeplinkTracking();
  }

  /**
   * Automatically set up deeplink tracking
   * Call this after initialize()
   */
  static setupDeeplinkTracking() {
    // Handle cold start deeplinks
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          this.trackDeeplinkUtm(url);
        }
      })
      .catch((err) => console.error("Error getting initial URL", err));

    // Handle warm start deeplinks
    this.deeplinkListener = Linking.addEventListener("url", (event) => {
      if (event.url) {
        this.trackDeeplinkUtm(event.url);
      }
    });
  }

  /**
   * Track UTM parameters from a deeplink URL
   * @param {string} url - The deeplink URL
   */
  static trackDeeplinkUtm(url) {
    if (!this.isInitialized) {
      console.warn("AdgeistSDK: Cannot track deeplink. SDK not initialized.");
      return;
    }
    AdgeistSDKModule.trackDeeplinkUtm(url);
  }

  /**
   * Get stored UTM parameters
   * @returns {Promise<Object>} UTM parameters object
   */
  static async getUtmParameters() {
    return await AdgeistSDKModule.getUtmParameters();
  }

  /**
   * Clear stored UTM parameters
   */
  static clearUtmParameters() {
    AdgeistSDKModule.clearUtmParameters();
  }

  /**
   * Clean up listeners
   */
  static cleanup() {
    if (this.deeplinkListener) {
      this.deeplinkListener.remove();
    }
  }
}

export default AdgeistSDK;
```

### 3. Usage in React Native App

```javascript
// App.js
import React, { useEffect } from "react";
import AdgeistSDK from "./AdgeistSDK";

function App() {
  useEffect(() => {
    // Initialize SDK on app launch
    AdgeistSDK.initialize("your-api-key", "https://your-backend.com");

    // Cleanup on unmount
    return () => {
      AdgeistSDK.cleanup();
    };
  }, []);

  const handleCheckUtm = async () => {
    const utmParams = await AdgeistSDK.getUtmParameters();
    console.log("Current UTM params:", utmParams);
  };

  return <View>{/* Your app content */}</View>;
}
```

---

## UTM Parameter Flow

### Installation Flow:

1. User installs app from Play Store with UTM-tagged link
2. `initializeInstallReferrer()` called on first launch
3. UTM parameters extracted from install referrer
4. Parameters saved to SharedPreferences
5. Data sent to backend with event type "INSTALL"

### Deeplink Flow:

1. User clicks deeplink with UTM parameters
2. React Native's Linking API captures the URL
3. URL passed to native `trackDeeplinkUtm()` method
4. UTM parameters extracted and parsed
5. Parameters saved to SharedPreferences (overwriting previous)
6. Data sent to backend with event type "VISIT"

---

## Supported UTM Parameters

The SDK tracks the following UTM parameters:

- `utm_source` - The source of the traffic (e.g., "google", "facebook")
- `utm_campaign` - The campaign name (e.g., "summer_sale")
- `utm_data` - Custom data field for additional tracking information

Example deeplink:

```
myapp://landing?utm_source=facebook&utm_campaign=winter_promo&utm_data=custom_123
```

---

## Best Practices

1. **Initialize Early**: Call `initialize()` as early as possible in your app lifecycle
2. **Automatic Setup**: The provided wrapper automatically sets up deeplink tracking
3. **Error Handling**: Always wrap UTM operations in try-catch blocks
4. **Testing**: Test both cold start and warm start deeplink scenarios
5. **Privacy**: Inform users about UTM tracking in your privacy policy
6. **Cleanup**: Always call `cleanup()` when component unmounts

---

## Testing

### Test Install Referrer:

```bash
# Using ADB to simulate install referrer (for testing only)
adb shell am broadcast -a com.android.vending.INSTALL_REFERRER \
  -n com.yourpackage/com.android.installreferrer.InstallReferrerReceiver \
  --es "referrer" "utm_source=test&utm_campaign=test_campaign"
```

### Test Deeplinks:

```bash
# Using ADB to test deeplink
adb shell am start -W -a android.intent.action.VIEW \
  -d "myapp://landing?utm_source=test&utm_campaign=deeplink_test" \
  com.yourpackage
```

---

## iOS Considerations

For a complete cross-platform solution, you'll need to:

1. Implement similar UTM tracking logic for iOS
2. Use iOS's Universal Links for deeplink handling
3. Use iOS's AppTrackingTransparency framework if collecting IDFA
4. Consider using Branch.io or Firebase Dynamic Links for easier cross-platform deeplink management

---

## Troubleshooting

**Issue**: Install referrer not captured

- Ensure the app is installed via Play Store (not sideloaded)
- Check that `initializeInstallReferrer()` is called on first launch
- Verify Google Play Install Referrer Library is added to dependencies

**Issue**: Deeplinks not tracked

- Verify deeplink intent filters are configured in AndroidManifest.xml
- Check that Linking API is properly set up in React Native
- Ensure SDK is initialized before tracking deeplinks

**Issue**: UTM parameters not persisting

- Check SharedPreferences permissions
- Verify app is not cleared between launches
- Check for conflicts with other SharedPreferences usage
