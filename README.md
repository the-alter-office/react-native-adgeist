![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

A React Native SDK that enables publishers to seamlessly integrate their ad spaces with the AdGeist marketplace. Built with TypeScript, Kotlin, and Swift, supporting both Old and New React Native architectures with TurboModule support.

## 🚀 Features

- ✅ **Cross-platform**: iOS and Android support
- ✅ **Modern Architecture**: Support for both legacy and new React Native architectures
- ✅ **TurboModule**: Enhanced performance with TurboModule implementation
- ✅ **TypeScript**: Full TypeScript support with type definitions
- ✅ **Expo Compatible**: Config plugin for seamless Expo integration
- ✅ **Analytics**: Built-in impression and click tracking
- ✅ **Customizable**: Flexible ad display options
- ✅ **Consent Management**: Support for user consent collection for personalized ads
- ✅ **User Data Platform**: Built-in CDP client for user data and event tracking

## 📦 Installation

### React Native CLI

```bash
npm install @thealteroffice/react-native-adgeist
# or
yarn add @thealteroffice/react-native-adgeist
```

For iOS, run pod install:

```bash
cd ios && pod install
```

### Expo Managed Workflow

```bash
npx expo install @thealteroffice/react-native-adgeist
```

Rebuild your app:

```bash
npx expo prebuild --clean
```

> **Note**: Requires Expo SDK 50+ and Kotlin template support.

## ⚙️ Peer Dependencies

This package uses `react-native-video` internally for media rendering.

### Why Peer Dependency?

React Native native modules like `react-native-video` should not be bundled inside libraries to prevent native build conflicts.

We declare `react-native-video` as a peer dependency, so your app controls the version.

### What You Need to Do

- **If your app already uses `react-native-video`**: No action needed.
- **If your app does not have `react-native-video` installed**: Please install it manually:

```bash
npm install react-native-video@^4.5.2
```

or

```bash
yarn add react-native-video@^4.5.2
```

### What Happens If You Skip This?

If `react-native-video` is not installed, your app will crash at runtime with:

```javascript
Error: Cannot find module 'react-native-video'
```

### Why Not Include It in dependencies?

Adding `react-native-video` to dependencies directly in this library would:

- ❌ Cause duplicate native module linking
- ❌ Lead to iOS/Android build failures
- ❌ Break compatibility with apps already using `react-native-video`

### Dependency Summary

| Package              | Install It?           | Why?                                                               |
| -------------------- | --------------------- | ------------------------------------------------------------------ |
| `react-native-video` | ✅ **Yes (required)** | Your app must install this manually to satisfy the peer dependency |

## 🔧 Setup & Configuration

### Basic Setup

Wrap your app with `AdgeistProvider` to configure global settings:

```tsx
import React from 'react';
import {
  AdgeistProvider,
  BannerAd,
} from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="your-publisher-id"
      apiKey="your-api-key"
      domain="your-domain"
      isTestEnvironment={false}
    >
      <YourAppContent />
    </AdgeistProvider>
  );
}
```

### Environment Configuration

Set `isTestEnvironment` based on your app's environment:

```tsx
const isTestMode = __DEV__ || process.env.NODE_ENV === 'development';

<AdgeistProvider
  publisherId="your-publisher-id"
  apiKey="your-api-key"
  domain="your-domain"
  isTestEnvironment={isTestMode}
>
```

## 🛡️ Consent Management for Personalized Ads

To deliver personalized ads, user data and events must be collected and sent to the AdGeist CDP platform. This requires obtaining user consent. You can use your own Consent Management Platform (CMP) or the SDK's built-in CMP.

### Using Your Own CMP

If you use your own CMP, update the consent status in the SDK by calling `updateConsentStatus(boolean)`:

```tsx
import { updateConsentStatus } from '@thealteroffice/react-native-adgeist/src/cdpclient';

const updateConsent = async (hasConsent: boolean) => {
  updateConsentStatus(hasConsent);
};
```

### Using SDK's Built-in CMP

To use the SDK's Consent Management Platform, check the consent status with `getConsentStatus` and display the consent modal if needed:

```tsx
import React, { useEffect } from 'react';
import { useAdgeistContext } from '@thealteroffice/react-native-adgeist';
import { getConsentStatus } from '@thealteroffice/react-native-adgeist/src/cdpclient';

function ConsentHandler() {
  const { setAdgeistConsentModal } = useAdgeistContext();

  useEffect(() => {
    (async () => {
      const consentStatus = await getConsentStatus();
      if (consentStatus === 'DENIED') {
        setAdgeistConsentModal(true);
      }
    })();
  }, [setAdgeistConsentModal]);

  return null;
}
```

The SDK will display a popup to collect user consent when `setAdgeistConsentModal(true)` is called.

### User Data and Event Tracking

#### Log Events

Use `logEvent` to store user interaction details for analytics:

```tsx
import { logEvent } from '@thealteroffice/react-native-adgeist/src/cdpclient';

const logUserEvent = async (
  eventType: string,
  eventProperties: Record<string, any>
) => {
  await logEvent({
    eventType,
    eventProperties,
  });
};

// Example usage
await logUserEvent('product_view', {
  productId: '12345',
  category: 'electronics',
  price: 299.99,
});
```

#### Set User Details

After user login, send user details using `setUserDetails` to associate the entire session lifecycle with the user. These details will be included with all events:

```tsx
import { setUserDetails } from '@thealteroffice/react-native-adgeist/src/cdpclient';

const setUser = async (userDetails: UserDetails) => {
  setUserDetails(userDetails);
};

// Example usage
setUser({
  userId: '12345',
  userName: 'John Doe',
  email: 'user@example.com',
  phone: '+1234567890',
});
```

## 📱 Components

### AdgeistProvider

The root provider component that configures the SDK globally.

#### Props

| Prop                | Type              | Required | Default | Description                                         |
| ------------------- | ----------------- | -------- | ------- | --------------------------------------------------- |
| `children`          | `React.ReactNode` | ✅       | -       | Child components                                    |
| `publisherId`       | `string`          | ✅       | -       | Your publisher ID from AdGeist dashboard            |
| `apiKey`            | `string`          | ✅       | -       | Your API key from AdGeist dashboard                 |
| `domain`            | `string`          | ✅       | -       | Your registered domain (e.g., "https://adgeist.ai") |
| `isTestEnvironment` | `boolean`         | ✅       | -       | Enable test mode for development                    |

#### Example

```tsx
<AdgeistProvider
  publisherId="67f8ad1350ff1e0870da3f5b"
  apiKey="7f6b3361bd6d804edfb40cecf3f42e5ebc0b11bd88d96c8a6d64188b93447ad9"
  domain="https://adgeist.ai"
  isTestEnvironment={false}
>
  <App />
</AdgeistProvider>
```

### BannerAd

Display banner or video advertisements in your app with responsive layout options.

#### Props

| Prop             | Type                               | Required | Default    | Description                                                 |
| ---------------- | ---------------------------------- | -------- | ---------- | ----------------------------------------------------------- |
| `dataAdSlot`     | `string`                           | ✅       | -          | Ad slot ID from your AdGeist dashboard                      |
| `dataSlotType`   | `'banner' \| 'video'`              | ❌       | `'banner'` | Type of ad content to display                               |
| `width`          | `number`                           | ❌       | `0`        | Width of the ad banner (ignored if `isResponsive` is true)  |
| `height`         | `number`                           | ❌       | `0`        | Height of the ad banner (ignored if `isResponsive` is true) |
| `isResponsive`   | `boolean`                          | ✅       | -          | Enable responsive layout that adapts to container           |
| `responsiveType` | `'SQUARE' \| 'VERTICAL' \| 'WIDE'` | ❌       | `'SQUARE'` | Responsive layout type (used when `isResponsive` is true)   |

#### Examples

**Basic Banner Ad:**

```tsx
import { BannerAd } from '@thealteroffice/react-native-adgeist';

function MyScreen() {
  return (
    <View>
      <BannerAd
        dataAdSlot="686149fac1fd09fff371e53c"
        dataSlotType="banner"
        width={350}
        height={250}
        isResponsive={false}
      />
    </View>
  );
}
```

**Video Ad:**

```tsx
function MyScreen() {
  return (
    <View>
      <BannerAd
        dataAdSlot="686149fac1fd09fff371e53c"
        dataSlotType="video"
        width={350}
        height={200}
        isResponsive={false}
      />
    </View>
  );
}
```

**Responsive Banner Ad:**

```tsx
function MyScreen() {
  return (
    <View style={{ padding: 16 }}>
      <BannerAd
        dataAdSlot="686149fac1fd09fff371e53c"
        dataSlotType="banner"
        isResponsive={true}
        responsiveType="WIDE"
      />
    </View>
  );
}
```

**Responsive Square Ad:**

```tsx
function MyScreen() {
  return (
    <View style={{ width: 300, height: 300 }}>
      <BannerAd
        dataAdSlot="686149fac1fd09fff371e53c"
        dataSlotType="banner"
        isResponsive={true}
        responsiveType="SQUARE"
      />
    </View>
  );
}
```

#### Responsive Types

| Type       | Description                  | Best Use Case                             |
| ---------- | ---------------------------- | ----------------------------------------- |
| `SQUARE`   | Equal width and height ratio | Social media style ads, product showcases |
| `VERTICAL` | Taller than wide (portrait)  | Sidebar ads, mobile story format          |
| `WIDE`     | Wider than tall (landscape)  | Header/footer banners, horizontal layouts |

#### Ad Slot Types

| Type     | Description                 | Requirements                                  |
| -------- | --------------------------- | --------------------------------------------- |
| `banner` | Static image advertisements | Standard image formats (JPG, PNG, WebP)       |
| `video`  | Video advertisements        | Requires `react-native-video` peer dependency |

#### Layout Behavior

- **Fixed Layout** (`isResponsive: false`): Uses exact `width` and `height` values
- **Responsive Layout** (`isResponsive: true`): Adapts to parent container size based on `responsiveType`

#### Video Ad Requirements

For video ads (`dataSlotType: 'video'`), ensure you have installed the required peer dependency:

```bash
npm install react-native-video@^4.5.2
```

Video ads automatically loop and are muted by default for better user experience.

## 🏢 CDP Client API

The SDK includes a Customer Data Platform (CDP) client for easy data management:

```tsx
import {
  setUserDetails,
  logEvent,
  getConsentStatus,
  updateConsentStatus,
} from '@thealteroffice/react-native-adgeist';
```

### CDP Client Methods

#### `setUserDetails(userDetails: UserDetails)`

Sets user details for the current session.

```tsx
setUserDetails({
  userId: '12345',
  userName: 'John Doe',
  email: 'user@example.com',
  phone: '+1234567890',
});
```

#### `logEvent(event: Event)`

Logs an event with custom properties.

```tsx
logEvent({
  eventType: 'purchase',
  eventProperties: {
    productId: '12345',
    amount: 99.99,
    currency: 'USD',
  },
});
```

#### `getConsentStatus(): Promise<'ACCEPTED' | 'DENIED'>`

Returns the current consent status.

```tsx
const status = await getConsentStatus();
```

#### `updateConsentStatus(consent: boolean)`

Updates the user's consent status.

```tsx
updateConsentStatus(true); // User granted consent
updateConsentStatus(false); // User denied consent
```

## 🎨 Customization

### Custom Event Tracking

```tsx
import { logEvent } from '@thealteroffice/react-native-adgeist';

// Track user interactions
const trackButtonClick = (buttonName: string) => {
  logEvent({
    eventType: 'button_click',
    eventProperties: {
      buttonName,
      timestamp: Date.now(),
      screen: 'home',
    },
  });
};

// Track page views
const trackPageView = (pageName: string) => {
  logEvent({
    eventType: 'page_view',
    eventProperties: {
      pageName,
      timestamp: Date.now(),
    },
  });
};
```

## 🚀 Advanced Features

### Debug Mode

Enable debug mode to see detailed logs:

```tsx
<AdgeistProvider
  publisherId="your-publisher-id"
  apiKey="your-api-key"
  domain="your-domain"
  isTestEnvironment={true} // Enable for debug logs
>
```

## 🔧 Troubleshooting

### Common Issues

#### Build Errors

- **iOS**: Run `cd ios && pod install` after installation
- **Android**: Clean and rebuild: `cd android && ./gradlew clean`

#### No Ads Showing

- Verify your `publisherId` and `apiKey` are correct
- Check if `isTestEnvironment` is set appropriately
- Ensure your ad slot ID (`dataAdSlot`) is valid
- Make sure `initializeSdk` is called before fetching ads

#### Video Not Working

- Make sure you installed `react-native-video` as described in the peer dependencies section
- For iOS: Run `cd ios && pod install` after installing `react-native-video`

#### SDK Not Initialized Error

- Ensure `AdgeistProvider` is wrapping your app
- Call `initializeSdk` before using native methods
- Check that the custom domain is correctly configured

### Debug Mode

Enable debug logging to troubleshoot issues:

```tsx
<AdgeistProvider
  publisherId="your-publisher-id"
  apiKey="your-api-key"
  domain="your-domain"
  isTestEnvironment={true}
>
```

## 📱 Migration Guide

### From v0.0.x to v0.1.x

1. Install required peer dependency: `npm install react-native-video@^4.5.2`
2. Update your `AdgeistProvider` configuration
3. Replace direct native module calls with CDP client calls:

   ```tsx
   // Before
   import Adgeist from '@thealteroffice/react-native-adgeist/src/NativeAdgeist';
   await Adgeist.setUserDetails(userDetails);

   // After
   import { setUserDetails } from '@thealteroffice/react-native-adgeist/src/cdpclient';
   setUserDetails(userDetails);
   ```

4. Run `cd ios && pod install` for iOS projects

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development Setup

```bash
git clone https://github.com/the-alter-office/react-native-adgeist.git
cd react-native-adgeist
yarn install
```

### Running the Example

```bash
yarn example ios
# or
yarn example android
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/the-alter-office/react-native-adgeist/wiki)
- **Issues**: [GitHub Issues](https://github.com/the-alter-office/react-native-adgeist/issues)
- **Discussions**: [GitHub Discussions](https://github.com/the-alter-office/react-native-adgeist/discussions)

---

Made with ❤️ by [The Alter Office](https://github.com/the-alter-office)
