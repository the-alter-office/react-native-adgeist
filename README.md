![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

Integrating Adgeist Mobile Ads SDK into an app is the first step toward displaying ads and earning revenue. Once you've integrated the SDK, you can choose an ad format (such as banner or display) and follow the steps to implement it.

## Before you begin

To prepare your app, complete the steps in the following sections.

### App prerequisites

Make sure that your app's build file uses the following values:

- Minimum SDK version of 24 or higher
- Compile SDK version of 35 or higher

## Configure your app

### STEP 1: Initiate the Installation Process for the SDK

Install the Adgeist SDK in your React Native project using npm or yarn. This step sets up the necessary package for ad integration.

```bash
npm install @thealteroffice/react-native-adgeist
# or
yarn add @thealteroffice/react-native-adgeist
```

### Android Configuration

Add your Adgeist publisher ID, api key and package id, as identified in the Adgeist web interface, to your app's `AndroidManifest.xml` file. To do so, add a `<meta-data>` tag with `android:name="com.adgeistkit.ads.ADGEIST_APP_ID"`, `android:name="com.adgeistkit.ads.ADGEIST_API_KEY"`, and `android:name="com.adgeistkit.ads.ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID"`.

You can find your app ID in the Adgeist web interface. For `android:value`, insert your own Adgeist publisher ID, surrounded by quotation marks.

```xml
<manifest>
  <application>
    <!-- Sample Adgeist app ID: 69326f9fbb280f9241cabc94 -->
    <!-- Sample Adgeist api key: b4e33bb73061d4e33670f229033f14bf770d35b15512dc1f106529e38946e49c -->
    <!-- Sample Adgeist package id: https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com -->

    <meta-data
        android:name="com.adgeistkit.ads.ADGEIST_APP_ID"
        android:value="ADGEIST_APP_ID"/>

    <meta-data
        android:name="com.adgeistkit.ads.ADGEIST_API_KEY"
        android:value="ADGEIST_API_KEY"/>

    <meta-data
        android:name="com.adgeistkit.ads.ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID"
        android:value="ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID"/>
  </application>
</manifest>
```

Replace `ADGEIST_APP_ID`, `ADGEIST_API_KEY`, `ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID` with your Adgeist IDs.

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

A `ADGEIST_APP_ID`, `ADGEIST_API_KEY`, `ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID` key with a string value of your Adgeist IDs found in the Adgeist UI.

```xml
<key>ADGEIST_API_KEY</key>
<string>e31edf10067897a3904b64b6a4b5f18b1260470183ae203cc521b0479166d597</string>
<key>ADGEIST_APP_ID</key>
<string>69326f9fbb280f9241cabc94</string>
<key>ADGEIST_CUSTOM_PACKAGE_OR_BUNDLE_ID</key>
<string>https://adgeist-ad-integration.d49kd6luw1c4m.amplifyapp.com/</string>
```

## Perform the Configuration of AdgeistProvider

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

## Implement the Embedding of Ad Slots

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
