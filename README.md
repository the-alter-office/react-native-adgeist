![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

Integrating Adgeist Mobile Ads SDK into an app is the first step toward displaying ads and earning revenue. Once you've integrated the SDK, you can choose an ad format (such as banner or display) and follow the steps to implement it.

## Before you begin

To prepare your app, complete the steps in the following sections.

### App prerequisites

Make sure that your app's build file uses the following values:

- Minimum SDK version of 23 or higher
- Compile SDK version of 35 or higher

## Configure your app

### STEP 1: Initiate the Installation Process for the SDK

Install the Adgeist SDK in your React Native project using npm or yarn. This step sets up the necessary package for ad integration.

```bash
npm install @thealteroffice/react-native-adgeist
# or
yarn add @thealteroffice/react-native-adgeist
```

### STEP 2: Update Configuration for Android and iOS

### Android Configuration

Add your Adgeist publisher ID as identified in the Adgeist web interface, to your app's `AndroidManifest.xml` file. To do so, add a `<meta-data>` tag with `android:name="com.adgeistkit.ads.ADGEIST_APP_ID"`

You can find your app ID in the Adgeist web interface. For `android:value`, insert your own Adgeist publisher ID, surrounded by quotation marks.

```xml
<manifest>
  <application>
    <!-- Sample Adgeist app ID: 69326f9fbb280f9241cabc94 -->

    <meta-data
        android:name="com.adgeistkit.ads.ADGEIST_APP_ID"
        android:value="ADGEIST_APP_ID"/>
  </application>
</manifest>
```

Replace `ADGEIST_APP_ID` with your Adgeist Publisher ID.

### iOS Configuration

#### CocoaPods

Before you continue, review Using CocoaPods for information on creating and using Podfiles.

To use CocoaPods, follow these steps:

In a terminal, run:

```bash
cd ios && pod install --repo-update
```

#### Update your Info.plist

Update your app's `Info.plist` file to add three keys:

A `ADGEIST_APP_ID` key with a string value of your Adgeist ID found in the Adgeist UI.

```xml
<key>ADGEIST_APP_ID</key>
<string>69326f9fbb280f9241cabc94</string>
```

### STEP 3: React Native Configuration and Ad Placement

### Configure AdgeistProvider

Add an `AdgeistProvider` at the root level of your app.

```tsx
import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider isTestEnvironment={false}>
      {/* Your app content */}
    </AdgeistProvider>
  );
}
```

### Implement Ad Placement

Use the `HTML5AdView` component to display banner ads anywhere in your app. Place this component where you want the ads to appear and the SDK will automatically load and render the ad content.

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

<HTML5AdView
  adUnitID="6932a4c022f6786424ce3b84"
  adSize={{ width: 320, height: 480 }}
  onAdLoaded={}
  onAdFailedToLoad={}
  onAdOpened={}
  onAdClosed={}
  onAdClicked={}
  adType="display"
/>;
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


## �📱 Components

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
  trackDeeplinkUtm,
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

#### `trackDeeplinkUtm(url: string)`

Tracks deeplink UTM parameters for attribution and analytics. This method should be called whenever your app is opened via a deeplink to capture campaign attribution data.

```tsx
// Track deeplink when app opens from external link
const handleDeeplink = (url: string) => {
  trackDeeplinkUtm(url);
};

// Example usage with React Navigation
import { Linking } from 'react-native';

useEffect(() => {
  const handleUrl = (url: string) => {
    trackDeeplinkUtm(url);
    // Continue with your normal deeplink handling
  };

  // Handle initial URL if app was opened from link
  Linking.getInitialURL().then((url) => {
    if (url) {
      handleUrl(url);
    }
  });

  // Handle URL changes while app is running
  const subscription = Linking.addEventListener('url', (event) => {
    handleUrl(event.url);
  });

  return () => subscription?.remove();
}, []);
```

**Important**: This method should be called as early as possible when handling deeplinks to ensure accurate attribution tracking.

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


## � Deeplink Tracking Integration

The SDK provides deeplink tracking capabilities to attribute campaign data and track user acquisition through external links. This is essential for measuring the effectiveness of your advertising campaigns and understanding user acquisition sources.

### Why Deeplink Tracking Matters

- **Campaign Attribution**: Track which campaigns drive app opens and user engagement
- **UTM Parameter Capture**: Automatically capture and process UTM parameters from marketing links
- **Cross-platform Analytics**: Unified tracking across different marketing channels and platforms
- **ROI Measurement**: Measure return on investment for different advertising campaigns

### Implementation

You need to integrate deeplink tracking in your app's main navigation setup to ensure all incoming deeplinks are captured:

#### React Navigation Integration

```tsx
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { trackDeeplinkUtm } from '@thealteroffice/react-native-adgeist';

function App() {
  useEffect(() => {
    const handleDeeplink = (url: string) => {
      // Track the deeplink first for attribution
      trackDeeplinkUtm(url);
      
      // Then handle your normal navigation logic
      // Example: navigate to specific screen based on URL
      handleNavigation(url);
    };

    // Handle initial URL if app was opened from a deeplink
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeeplink(url);
      }
    });

    // Handle deeplinks while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeeplink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  return (
    <AdgeistProvider
      publisherId="your-publisher-id"
      apiKey="your-api-key"
      domain="your-domain"
      isTestEnvironment={false}
    >
      {/* Your app content */}
    </AdgeistProvider>
  );
}
```

#### Expo Integration

For Expo projects, use the `expo-linking` module:

```tsx
import * as Linking from 'expo-linking';
import { trackDeeplinkUtm } from '@thealteroffice/react-native-adgeist';

function App() {
  useEffect(() => {
    const handleDeeplink = (url: string) => {
      trackDeeplinkUtm(url);
      // Your navigation logic here
    };

    // Handle initial URL
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeeplink(url);
      }
    });

    // Listen for URL changes
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url) {
        handleDeeplink(event.url);
      }
    });

    return () => subscription?.remove();
  }, []);

  // Rest of your app...
}
```

### Supported UTM Parameters

The SDK automatically extracts and tracks these common UTM parameters:

- `utm_source`: Identifies the advertiser, site, publication, etc.
- `utm_medium`: Advertising or marketing medium (e.g., email, banner, social)
- `utm_campaign`: Campaign name, slogan, promo code, etc.
- `utm_term`: Paid search keywords
- `utm_content`: Used to differentiate ads or links that point to the same URL

### Example Deeplink URLs

```
myapp://product/123?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale
myapp://home?utm_source=facebook&utm_medium=social&utm_campaign=brand_awareness
https://myapp.com/special-offer?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_deals
```

### Best Practices

1. **Call Early**: Always call `trackDeeplinkUtm()` before any other navigation logic to ensure accurate attribution
2. **Handle All Entry Points**: Track both cold app launches and warm app resumes from deeplinks
3. **Test Thoroughly**: Test deeplink tracking with various UTM parameter combinations
4. **Monitor Analytics**: Use the AdGeist dashboard to monitor deeplink performance and attribution data


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
