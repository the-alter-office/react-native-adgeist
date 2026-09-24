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
        android:value="YOUR_ADGEIST_APP_ID"/>
  </application>
</manifest>
```

Replace `YOUR_ADGEIST_APP_ID` with your Adgeist Publisher ID. The `android:name` attribute must stay as is.

### iOS Configuration

#### CocoaPods

Before you continue, review Using CocoaPods for information on creating and using Podfiles.

To use CocoaPods, follow these steps:

In a terminal, run:

```bash
cd ios && pod install --repo-update
```

#### Update your Info.plist

Add your Adgeist publisher ID, as identified in the Adgeist web interface, to your app's `Info.plist` file. To do so, add an `ADGEIST_APP_ID` key with a string value of your Adgeist publisher ID.

```xml
<!-- Sample Adgeist app ID: 69326f9fbb280f9241cabc94 -->

<key>ADGEIST_APP_ID</key>
<string>YOUR_ADGEIST_APP_ID</string>
```

Replace `YOUR_ADGEIST_APP_ID` with your Adgeist Publisher ID. The `ADGEIST_APP_ID` key name must stay as is.

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

An adspace is either **fixed-size** or **responsive**, depending on what you chose while creating it on [adgeist.ai](https://adgeist.ai). Use the snippet below that matches yours. Each one is complete — copy it into your screen and the ad placement is done.

**Fixed-size adspace** — you entered a width and a height when you created it:

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

// Sample Adgeist ad unit ID: 6932a4c022f6786424ce3b84
// Sample ad size: { width: 320, height: 480 }

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adSize={{ width: YOUR_AD_WIDTH, height: YOUR_AD_HEIGHT }}
  onAdLoaded={}
  onAdFailedToLoad={}
  onAdOpened={}
  onAdClosed={}
  onAdClicked={}
  onAdWarning={}
/>;
```

**Responsive adspace** — it takes its size from your layout, so it carries no dimensions:

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  onAdLoaded={}
  onAdFailedToLoad={}
  onAdOpened={}
  onAdClosed={}
  onAdClicked={}
  onAdWarning={}
/>;
```

Replace `YOUR_ADUNIT_ID` with your Adgeist Ad Unit ID, as identified in the Adgeist web interface. Each ad placement in your app requires its own ad unit ID.

#### What `adSize` actually does

`adSize` is the space your layout hands the ad. The component takes that box the moment it mounts, before any ad has been fetched, so your screen is laid out correctly while the request is in flight and nothing jumps when the creative arrives.

It is **not** what decides the creative's size. That comes from the adspace you configured on adgeist.ai. When the ad arrives the SDK compares the two:

| | What happens |
|---|---|
| Your `adSize` matches the adspace | The creative fills the box you reserved. Nothing moves. |
| They differ | [`onAdWarning`](#ad-events) fires, naming the real size. Change `adSize` to that size. |

So replace `YOUR_AD_WIDTH` and `YOUR_AD_HEIGHT` with the exact dimensions you entered on adgeist.ai when you created the adspace, and the two can never disagree.

> On React Native your styles own the layout, so the SDK cannot resize the slot on your behalf — it reports the mismatch instead of silently correcting it. Read `onAdWarning` as "your `adSize` is wrong, here is the right one", and treat it as a bug to fix rather than a runtime condition to handle.

---

## Extra options

The options below are not part of the snippet adgeist.ai gives you. Your ad placement works without them — reach for one only when your layout calls for it.

### `reserveSpace` — keep the slot when an ad fails

Optional. **Defaults to `true`** — leave it out entirely unless you specifically want `false`.

Not every request returns an ad. By default the component holds its box after a failed load, so the rest of your screen stays exactly where it was:

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

// Default. Identical to leaving reserveSpace out.
<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adSize={{ width: 320, height: 480 }}
  reserveSpace={true}
/>;
```

Pass `false` if you would rather the ad give up its place when there is nothing to show:

| `reserveSpace` | After `onAdFailedToLoad` |
|---|---|
| `true` (default) | The ad keeps its full box in your layout, empty. No layout shift. |
| `false` | The ad view detaches itself from your layout. |

**Whether there is any space to reserve depends on how the ad is sized:**

| Ad | Does reserving work? |
|---|---|
| Fixed (`adSize` with both `width` and `height`) | Always. The box has a size of its own to hold, ad or no ad. |
| Responsive | Only on the axes that actually resolve. An axis that nothing determines measures `0`, and there is no space to hold open. See [Responsive ads and `adSize`](#responsive-ads-and-adsize). |

This applies to **failed loads only**. `destroy()` on the component ref always tears the ad down, whatever `reserveSpace` is set to.

### Responsive ads and `adSize`

Optional. A responsive adspace normally needs no `adSize` at all — that is the point of it. You only reach for this when your layout fixes one axis and leaves the other open.

A responsive ad takes each axis independently:

| Axis | Where its size comes from |
|---|---|
| Named in `adSize` | The value you pass |
| Left out of `adSize` | The parent — `HTML5AdView` styles that axis `100%` |

**Both axes from the parent** — the usual case, no `adSize`:

```tsx
import { View } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

<View style={{ width: 300, height: 250 }}>
  <HTML5AdView adUnitID="YOUR_ADUNIT_ID" adIsResponsive={true} />
</View>;
```

**One axis from the parent, one from you:**

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

// Bottom banner: full width from the parent, you supply the height
<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  adSize={{ height: 50 }}
/>;

// Side rail: full height from the parent, you supply the width
<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  adSize={{ width: 120 }}
/>;
```

An axis you leave out becomes `100%`, so it needs an ancestor with a real size on that axis. The case that catches people out is a `ScrollView`: it gives its children no definite height, so a responsive ad inside one should declare `adSize={{ height: ... }}`. Without it the height resolves against a parent that has none, and the ad will not be the size you expected.

---

## Ad events

| Callback | Fires when |
|---|---|
| `onAdLoaded` | The ad finished loading. |
| `onAdFailedToLoad` | The request failed. `event.nativeEvent.error` carries the reason. |
| `onAdOpened` | The ad opened an overlay covering the screen. |
| `onAdClosed` | The ad was removed from the screen. |
| `onAdClicked` | The user clicked the ad. |
| `onAdWarning` | The SDK found a problem that did not stop the ad from loading, but that you should fix. `event.nativeEvent.warning` carries the message, describing the problem and what to change. |


## Support

If you run into any difficulties while integrating or using the Adgeist Mobile Ads SDK, reach out to beast@thealteroffice.com or kishore@thealteroffice.com and we'll help you get it sorted out.