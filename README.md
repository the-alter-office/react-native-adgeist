![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

Integrating Adgeist Mobile Ads SDK into an app is the first step toward displaying ads and earning revenue. Once you've integrated the SDK, you can choose an ad format (such as banner or display) and follow the steps to implement it.

## Before you begin

To prepare your app, complete the steps in the following sections.

### App prerequisites

Make sure that your app's build files use the following values:

**Android**

- Minimum SDK version of 23 or higher
- Compile SDK version of 35 or higher

**iOS**

- Xcode 16.0 or higher
- Deployment target of iOS 15.6 or higher

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
        android:value="YOUR_ADGEIST_APP_ID"/>
  </application>
</manifest>
```

Replace `YOUR_ADGEIST_APP_ID` with your Adgeist Publisher ID. The `android:name` attribute must stay as is.

### iOS Configuration

#### CocoaPods

Before you continue, review Using CocoaPods for information on creating and using Podfiles.

Set your Podfile deployment target to iOS 15.6 or higher. The default `min_ios_version_supported` from React Native is lower than this and will fail to install:

```ruby
platform :ios, '15.6'
```

Then, in a terminal, run:

```bash
cd ios && pod install --repo-update
```

`pod install` downloads the AdgeistKit binary framework from GitHub Releases and verifies its checksum, so the first install for a given SDK version requires network access. Later installs reuse the downloaded copy.

#### Update your Info.plist

Add your Adgeist publisher ID, as identified in the Adgeist web interface, to your app's `Info.plist` file. To do so, add an `ADGEIST_APP_ID` key with a string value of your Adgeist publisher ID.

```xml
<!-- Sample Adgeist app ID: 69326f9fbb280f9241cabc94 -->

<key>ADGEIST_APP_ID</key>
<string>YOUR_ADGEIST_APP_ID</string>
```

Replace `YOUR_ADGEIST_APP_ID` with your Adgeist Publisher ID. The `ADGEIST_APP_ID` key name must stay as is.

On iOS the publisher ID is read from `Info.plist` only. Passing it to `AdgeistProvider` has no effect.

#### Expo

If you use Expo, add the config plugin to your app config and pass your publisher ID as `adgeistAppId`. Prebuild will write the `ADGEIST_APP_ID` key into `Info.plist` for you.

```json
{
  "expo": {
    "plugins": [
      [
        "@thealteroffice/react-native-adgeist",
        { "adgeistAppId": "YOUR_ADGEIST_APP_ID" }
      ]
    ]
  }
}
```

### STEP 3: React Native Configuration and Ad Placement

### Configure AdgeistProvider

Add an `AdgeistProvider` at the root level of your app.

```tsx
import { AdgeistProvider } from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider>
      {/* Your app content */}
    </AdgeistProvider>
  );
}
```

### Implement Ad Placement

Use the `HTML5AdView` component to display banner ads anywhere in your app. Place this component where you want the ads to appear and the SDK will automatically load and render the ad content.

```tsx
import { HTML5AdView, AdTypes } from '@thealteroffice/react-native-adgeist';

// Sample Adgeist ad unit ID: 6932a4c022f6786424ce3b84
// Sample ad size: { width: 320, height: 480 }

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adSize={{ width: YOUR_AD_WIDTH, height: YOUR_AD_HEIGHT }}
  reserveSpace={true}
  onAdLoaded={}
  onAdFailedToLoad={}
  onAdOpened={}
  onAdClosed={}
  onAdClicked={}
  adType={AdTypes.DISPLAY}
/>;
```

Replace `YOUR_ADUNIT_ID` with your Adgeist Ad Unit ID, as identified in the Adgeist web interface. Each ad placement in your app requires its own ad unit ID.

Replace `YOUR_AD_WIDTH` and `YOUR_AD_HEIGHT` with the dimensions you mentioned while creating the ad space in the Adgeist web interface.

### Sizing

| Prop            | Purpose                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `adSize.width`  | Fallback width, used only if the server returns no dimensions            |
| `adSize.height` | Fallback height, used only if the server returns no dimensions           |
| `reserveSpace`  | Holds `adSize.width` × `adSize.height` until the ad resolves             |

Dimensions returned by the server always win. The `adSize` you pass is a fallback for the case where the response carries none — if the server returns no dimensions and you passed no `adSize`, the ad has no size and will not be visible.

`reserveSpace` defaults to `false`, which lets the ad take its size only once the creative resolves. Pass `reserveSpace={true}` to claim `adSize.width` × `adSize.height` from the first render instead, so surrounding content does not shift when the ad arrives. It requires both a width and a height, and is ignored when `adIsResponsive` is set.

**Responsive ads:** For responsive ads, `adSize` is not needed — passing `adIsResponsive={true}` is enough. The ad will automatically size itself to fit the available space.

```tsx
<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  onAdLoaded={}
  onAdFailedToLoad={}
  onAdOpened={}
  onAdClosed={}
  onAdClicked={}
  adType={AdTypes.DISPLAY}
/>;
```

**Ad Types:**
- `AdTypes.BANNER` - Small rectangular banner ads
- `AdTypes.DISPLAY` - Standard display ads
- `AdTypes.COMPANION` - Companion ads (requires minimum 320x320 dimensions)


## Support

If you run into any difficulties while integrating or using the Adgeist Mobile Ads SDK, reach out to beast@thealteroffice.com or kishore@thealteroffice.com and we'll help you get it sorted out.