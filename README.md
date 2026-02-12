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


### Campaign Conversion Analytics

Tracks deeplink UTM parameters for attribution and analytics. This method should be called whenever your app is opened via a deeplink to capture campaign attribution data.

```tsx
// Example usage with React Navigation
import { Linking } from 'react-native';
import { trackConversionsWithDeepLinks } from '@thealteroffice/react-native-adgeist';

useEffect(() => {
  const handleUrl = (url: string) => {
    trackConversionsWithDeepLinks(url);
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