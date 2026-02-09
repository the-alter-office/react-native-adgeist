# AdgeistKit UTMTracker React Native Integration Guide

This document provides comprehensive instructions for integrating the AdgeistKit UTMTracker functionality into a React Native wrapper package.

## Overview

The UTMTracker is responsible for tracking and persisting UTM parameters from install referrers and deeplinks. It provides functionality for:

- **Install Attribution**: Track UTM parameters from app installation URLs
- **Deeplink Tracking**: Extract and track UTM parameters from deeplink URLs  
- **Data Persistence**: Store UTM parameters using UserDefaults
- **Backend Integration**: Send UTM data to analytics backend
- **Session Management**: Generate unique session identifiers

## React Native Bridge Implementation

### 1. iOS Native Module Setup

Create the iOS bridge module to expose UTMTracker functionality to React Native.

#### `AdgeistUTMTrackerModule.swift`

```swift
import Foundation
import React

@objc(AdgeistUTMTrackerModule)
class AdgeistUTMTrackerModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    // MARK: - Initialization
    
    @objc(initializeAnalytics:resolver:rejecter:)
    func initializeAnalytics(
        bidRequestBackendDomain: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        UTMTracker.shared.initializeAnalytics(bidRequestBackendDomain: bidRequestBackendDomain)
        resolve(["success": true])
    }
    
    // MARK: - Tracking Methods
    
    @objc(trackFromDeeplink:resolver:rejecter:)
    func trackFromDeeplink(
        urlString: String,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        guard let url = URL(string: urlString) else {
            reject("INVALID_URL", "Invalid URL provided", nil)
            return
        }
        
        UTMTracker.shared.trackFromDeeplink(url: url)
        resolve(["success": true])
    }
    
    @objc(initializeInstallReferrer:resolver:rejecter:)
    func initializeInstallReferrer(
        urlString: String?,
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        let url: URL? = {
            if let urlString = urlString {
                return URL(string: urlString)
            }
            return nil
        }()
        
        UTMTracker.shared.initializeInstallReferrer(url: url)
        resolve(["success": true])
    }
    
    // MARK: - Data Access Methods
    
    @objc(getUtmParameters:rejecter:)
    func getUtmParameters(
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        if let utmParams = UTMTracker.shared.getUtmParameters() {
            let result: [String: Any?] = [
                "source": utmParams.source,
                "campaign": utmParams.campaign,
                "data": utmParams.data,
                "sessionId": utmParams.sessionId
            ]
            resolve(result)
        } else {
            resolve(NSNull())
        }
    }
    
    @objc(clearUtmParameters:rejecter:)
    func clearUtmParameters(
        resolver resolve: @escaping RCTPromiseResolveBlock,
        rejecter reject: @escaping RCTPromiseRejectBlock
    ) {
        UTMTracker.shared.clearUtmParameters()
        resolve(["success": true])
    }
}
```

#### `AdgeistUTMTrackerModule.m` (Objective-C Bridge)

```objc
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AdgeistUTMTrackerModule, NSObject)

RCT_EXTERN_METHOD(initializeAnalytics:(NSString *)bidRequestBackendDomain
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(trackFromDeeplink:(NSString *)urlString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(initializeInstallReferrer:(NSString *)urlString
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getUtmParameters:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(clearUtmParameters:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
```

### 2. TypeScript Interface

Define TypeScript types for the UTM functionality.

#### `types/UTMTracker.ts`

```typescript
export interface UTMParameters {
  source?: string;      // utm_source: identifies which site sent the traffic
  campaign?: string;    // utm_campaign: identifies a specific campaign  
  data?: string;        // utm_data: identifies meta data
  sessionId?: string;   // Unique session identifier
}

export interface UTMTrackerInterface {
  /**
   * Initialize UTM analytics with backend domain
   * Must be called before other UTM methods
   */
  initializeAnalytics(bidRequestBackendDomain: string): Promise<{success: boolean}>;
  
  /**
   * Track UTM parameters from a deeplink URL
   */
  trackFromDeeplink(url: string): Promise<{success: boolean}>;
  
  /**
   * Initialize and track first launch with optional install URL
   * Call this on app startup to track install attribution
   */
  initializeInstallReferrer(url?: string): Promise<{success: boolean}>;
  
  /**
   * Get currently stored UTM parameters
   * Returns null if no UTM data exists
   */
  getUtmParameters(): Promise<UTMParameters | null>;
  
  /**
   * Clear all stored UTM parameters
   */
  clearUtmParameters(): Promise<{success: boolean}>;
}
```

### 3. JavaScript Interface

Create the React Native JavaScript interface.

#### `src/UTMTracker.ts`

```typescript
import { NativeModules, Platform } from 'react-native';
import type { UTMParameters, UTMTrackerInterface } from './types/UTMTracker';

const LINKING_ERROR =
  `The package 'react-native-adgeist-utm' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'cd ios && pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const AdgeistUTMTrackerModule = NativeModules.AdgeistUTMTrackerModule
  ? NativeModules.AdgeistUTMTrackerModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

class UTMTracker implements UTMTrackerInterface {
  private static instance: UTMTracker;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): UTMTracker {
    if (!UTMTracker.instance) {
      UTMTracker.instance = new UTMTracker();
    }
    return UTMTracker.instance;
  }

  /**
   * Initialize UTM analytics with backend domain
   * Must be called before other UTM methods
   */
  async initializeAnalytics(bidRequestBackendDomain: string): Promise<{success: boolean}> {
    try {
      const result = await AdgeistUTMTrackerModule.initializeAnalytics(bidRequestBackendDomain);
      this.isInitialized = true;
      return result;
    } catch (error) {
      console.error('UTMTracker: Failed to initialize analytics:', error);
      throw error;
    }
  }

  /**
   * Track UTM parameters from a deeplink URL
   */
  async trackFromDeeplink(url: string): Promise<{success: boolean}> {
    this.checkInitialization();
    try {
      return await AdgeistUTMTrackerModule.trackFromDeeplink(url);
    } catch (error) {
      console.error('UTMTracker: Failed to track deeplink:', error);
      throw error;
    }
  }

  /**
   * Initialize and track first launch with optional install URL
   * Call this on app startup to track install attribution
   */
  async initializeInstallReferrer(url?: string): Promise<{success: boolean}> {
    this.checkInitialization();
    try {
      return await AdgeistUTMTrackerModule.initializeInstallReferrer(url || null);
    } catch (error) {
      console.error('UTMTracker: Failed to initialize install referrer:', error);
      throw error;
    }
  }

  /**
   * Get currently stored UTM parameters
   * Returns null if no UTM data exists
   */
  async getUtmParameters(): Promise<UTMParameters | null> {
    this.checkInitialization();
    try {
      const result = await AdgeistUTMTrackerModule.getUtmParameters();
      return result === null ? null : result as UTMParameters;
    } catch (error) {
      console.error('UTMTracker: Failed to get UTM parameters:', error);
      throw error;
    }
  }

  /**
   * Clear all stored UTM parameters
   */
  async clearUtmParameters(): Promise<{success: boolean}> {
    this.checkInitialization();
    try {
      return await AdgeistUTMTrackerModule.clearUtmParameters();
    } catch (error) {
      console.error('UTMTracker: Failed to clear UTM parameters:', error);
      throw error;
    }
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('UTMTracker: Must call initializeAnalytics() before using other methods');
    }
  }
}

export default UTMTracker.getInstance();
export { UTMParameters, UTMTrackerInterface };
```

### 4. Main Export File

#### `src/index.ts`

```typescript
import UTMTracker from './UTMTracker';
export { UTMParameters, UTMTrackerInterface } from './types/UTMTracker';
export default UTMTracker;
```

## Integration Steps

### 1. iOS Project Configuration

#### Add to Podfile

```ruby
# In your React Native app's ios/Podfile
pod 'AdgeistKit', '~> 1.0'
```

#### Install Dependencies

```bash
cd ios && pod install
```

#### Add Module Files

1. Add `AdgeistUTMTrackerModule.swift` to your iOS project
2. Add `AdgeistUTMTrackerModule.m` to your iOS project  
3. Ensure proper bridging header setup if needed

### 2. React Native Package Setup

#### Package Structure

```
react-native-adgeist-utm/
├── src/
│   ├── types/
│   │   └── UTMTracker.ts
│   ├── UTMTracker.ts
│   └── index.ts
├── ios/
│   ├── AdgeistUTMTrackerModule.swift
│   └── AdgeistUTMTrackerModule.m
├── package.json
└── react-native-adgeist-utm.podspec
```

#### `package.json`

```json
{
  "name": "react-native-adgeist-utm",
  "version": "1.0.0",
  "description": "React Native wrapper for AdgeistKit UTMTracker",
  "main": "lib/commonjs/index",
  "module": "lib/module/index",
  "types": "lib/typescript/index.d.ts",
  "react-native": "src/index",
  "source": "src/index",
  "files": [
    "src",
    "lib",
    "ios",
    "react-native-adgeist-utm.podspec"
  ],
  "keywords": [
    "react-native",
    "ios",
    "utm",
    "tracking",
    "attribution",
    "deeplink"
  ],
  "peerDependencies": {
    "react": "*",
    "react-native": "*"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-native": "^0.71.0",
    "typescript": "^4.9.0"
  }
}
```

#### `react-native-adgeist-utm.podspec`

```ruby
require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-adgeist-utm"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platforms    = { :ios => "12.0" }
  s.source       = { :git => "https://github.com/your-org/react-native-adgeist-utm.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,m,mm,swift}"

  s.dependency "React-Core"
  s.dependency "AdgeistKit"
end
```

## Usage Examples

### 1. App Initialization

```typescript
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import UTMTracker from 'react-native-adgeist-utm';

const App = () => {
  useEffect(() => {
    initializeUTMTracking();
  }, []);

  const initializeUTMTracking = async () => {
    try {
      // Initialize with your backend domain
      await UTMTracker.initializeAnalytics('https://api.yourdomain.com');
      
      // Track first launch for install attribution
      await UTMTracker.initializeInstallReferrer();
      
      console.log('UTM Tracker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize UTM Tracker:', error);
    }
  };

  useEffect(() => {
    // Handle deeplinks for UTM tracking
    const handleDeepLink = async (url: string) => {
      try {
        await UTMTracker.trackFromDeeplink(url);
        console.log('UTM parameters tracked from deeplink:', url);
      } catch (error) {
        console.error('Failed to track UTM from deeplink:', error);
      }
    };

    // Listen for deeplink events
    const linkingListener = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    // Handle initial URL if app was opened via deeplink
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    return () => {
      linkingListener?.remove();
    };
  }, []);

  return (
    // Your app components
  );
};
```

### 2. UTM Data Retrieval

```typescript
import React, { useState, useCallback } from 'react';
import { View, Text, Button } from 'react-native';
import UTMTracker, { UTMParameters } from 'react-native-adgeist-utm';

const UTMDataScreen = () => {
  const [utmData, setUtmData] = useState<UTMParameters | null>(null);

  const fetchUTMData = useCallback(async () => {
    try {
      const data = await UTMTracker.getUtmParameters();
      setUtmData(data);
      console.log('Current UTM data:', data);
    } catch (error) {
      console.error('Failed to fetch UTM data:', error);
    }
  }, []);

  const clearUTMData = useCallback(async () => {
    try {
      await UTMTracker.clearUtmParameters();
      setUtmData(null);
      console.log('UTM data cleared');
    } catch (error) {
      console.error('Failed to clear UTM data:', error);
    }
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Button title="Get UTM Data" onPress={fetchUTMData} />
      <Button title="Clear UTM Data" onPress={clearUTMData} />
      
      {utmData && (
        <View style={{ marginTop: 20 }}>
          <Text>UTM Source: {utmData.source || 'N/A'}</Text>
          <Text>UTM Campaign: {utmData.campaign || 'N/A'}</Text>
          <Text>UTM Data: {utmData.data || 'N/A'}</Text>
          <Text>Session ID: {utmData.sessionId || 'N/A'}</Text>
        </View>
      )}
    </View>
  );
};
```

### 3. Custom Deeplink Handling

```typescript
import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';
import UTMTracker from 'react-native-adgeist-utm';

const useDeeplinkHandler = () => {
  useEffect(() => {
    const handleURL = async (url: string) => {
      console.log('Received deeplink:', url);

      try {
        // Track UTM parameters
        await UTMTracker.trackFromDeeplink(url);

        // Get the tracked parameters
        const utmData = await UTMTracker.getUtmParameters();
        
        if (utmData) {
          Alert.alert(
            'UTM Tracked',
            `Source: ${utmData.source}\nCampaign: ${utmData.campaign}`
          );
        }

        // Handle your app's routing logic here
        // Example: navigate to specific screen based on URL
        
      } catch (error) {
        console.error('Deeplink handling error:', error);
      }
    };

    // Listen for incoming links when app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleURL(event.url);
    });

    // Check if app was opened with a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleURL(url);
      }
    });

    return () => subscription?.remove();
  }, []);
};

export default useDeeplinkHandler;
```

## Best Practices

### 1. Error Handling

```typescript
const safeUTMOperation = async <T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    console.error(`UTM ${operationName} failed:`, error);
    
    // You might want to send this to your error tracking service
    // crashlytics().recordError(error);
    
    return null;
  }
};

// Usage
const utmData = await safeUTMOperation(
  () => UTMTracker.getUtmParameters(),
  'get parameters'
);
```

### 2. Initialization State Management

```typescript
class UTMManager {
  private static isInitialized = false;
  private static initPromise: Promise<void> | null = null;

  static async ensureInitialized(backendDomain: string): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize(backendDomain);
    return this.initPromise;
  }

  private static async initialize(backendDomain: string): Promise<void> {
    try {
      await UTMTracker.initializeAnalytics(backendDomain);
      await UTMTracker.initializeInstallReferrer();
      this.isInitialized = true;
    } catch (error) {
      this.initPromise = null; // Allow retry
      throw error;
    }
  }
}
```

### 3. Testing Considerations

```typescript
// Mock for testing environments
const createMockUTMTracker = () => ({
  initializeAnalytics: jest.fn().mockResolvedValue({ success: true }),
  trackFromDeeplink: jest.fn().mockResolvedValue({ success: true }),
  initializeInstallReferrer: jest.fn().mockResolvedValue({ success: true }),
  getUtmParameters: jest.fn().mockResolvedValue(null),
  clearUtmParameters: jest.fn().mockResolvedValue({ success: true }),
});

// In your test setup
if (__DEV__ || process.env.NODE_ENV === 'test') {
  jest.mock('react-native-adgeist-utm', () => createMockUTMTracker());
}
```

## Troubleshooting

### Common Issues

1. **Module not found error**
   - Ensure pod install was run after adding AdgeistKit dependency
   - Verify bridging files are properly added to Xcode project

2. **Initialization errors**
   - Check that `initializeAnalytics()` is called before other methods
   - Verify backend domain URL is valid and accessible

3. **UTM parameters not persisting**
   - Ensure app has proper UserDefaults access
   - Check for threading issues (all calls should be from main thread)

4. **Deeplink URL parsing fails**
   - Verify URL format includes proper UTM parameters
   - Check URL encoding for special characters

### Debug Mode

```typescript
const DEBUG_UTM = __DEV__;

const debugLog = (message: string, data?: any) => {
  if (DEBUG_UTM) {
    console.log(`[UTM Debug] ${message}`, data);
  }
};

// Use throughout your UTM tracking implementation
await UTMTracker.trackFromDeeplink(url);
debugLog('Tracked deeplink', { url });
```

## Security Considerations

1. **Data Validation**: Always validate UTM parameter content before processing
2. **URL Sanitization**: Sanitize deeplink URLs to prevent injection attacks  
3. **Backend Communication**: Ensure HTTPS for all backend communications
4. **Data Retention**: Implement appropriate UTM data retention policies

## Support

For issues related to:
- **iOS Native Module**: Check Xcode console for Swift/Objective-C errors
- **React Native Bridge**: Use React Native debugger and console logs
- **AdgeistKit SDK**: Refer to AdgeistKit documentation and support channels

This integration guide provides a complete foundation for integrating AdgeistKit's UTMTracker into React Native applications with robust error handling, TypeScript support, and production-ready patterns.