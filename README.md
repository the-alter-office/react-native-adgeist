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

### Expo

For Expo apps (managed workflow / CNG), skip the native edits above and add the config plugin to your `app.json` or `app.config.js` instead. The plugin writes the `Info.plist` key and the `AndroidManifest.xml` `<meta-data>` entry for you during prebuild.

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

Then regenerate the native projects:

```bash
npx expo prebuild
```

`adgeistAppId` is required — prebuild fails if it is missing. The SDK's native modules are autolinked, so no further native setup is needed. This requires a development build.

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
  onAdEvent={(event) => console.log(event.nativeEvent)}
/>;
```

**Responsive adspace** — it takes its size from your layout, so it carries no dimensions:

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  onAdEvent={(event) => console.log(event.nativeEvent)}
/>;
```

Replace `YOUR_ADUNIT_ID` with your Adgeist Ad Unit ID, as identified in the Adgeist web interface. Each ad placement in your app requires its own ad unit ID. Everything the ad reports arrives through `onAdEvent` — see [Ad events](#ad-events).

#### What `adSize` actually does

`adSize` is the space your layout hands the ad. The component takes that box the moment it mounts, before any ad has been fetched, so your screen is laid out correctly while the request is in flight and nothing jumps when the creative arrives.

It is **not** what decides the creative's size. That comes from the adspace you configured on adgeist.ai. When the ad arrives the SDK compares the two:

| | What happens |
|---|---|
| Your `adSize` matches the adspace | The creative fills the box you reserved. Nothing moves. |
| They differ | The ad resizes to the adspace's size, shifting your layout, and [`AW7`](#event-reference) fires with the real size in `data.reason`. Change `adSize` to that size. |

So replace `YOUR_AD_WIDTH` and `YOUR_AD_HEIGHT` with the exact dimensions you entered on adgeist.ai when you created the adspace, and the two can never disagree.

> Read `AW7` as "your `adSize` is wrong, here is the right one", and treat it as a bug to fix rather than a runtime condition to handle.

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

| `reserveSpace` | After a [failed load](#ad-events) |
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

An axis you leave out becomes `100%`, so it needs an ancestor with a real size on that axis. The case that catches people out is a `ScrollView`: it gives its children no definite height, so a responsive ad inside one should declare `adSize={{ height: ... }}`. Without it the height resolves against a parent that has none, measures `0`, and [`AW4`](#event-reference) fires naming the axis.

---

## Ad events

Every event arrives in one callback, `onAdEvent`:

```tsx
import type { NativeSyntheticEvent } from 'react-native';
import {
  HTML5AdView,
  type AdViewEvent,
} from '@thealteroffice/react-native-adgeist';

const handleAdEvent = (event: NativeSyntheticEvent<AdViewEvent>) => {
  const { type, code, message, data } = event.nativeEvent;

  switch (type) {
    case 'AD_LOADED':
    case 'AD_CLICKED':
    case 'AD_CLOSED':
    case 'AD_NO_FILL':
    case 'AD_NETWORK_ERROR':
    case 'AD_INTERNAL_ERROR':
      break;
    case 'AD_WARNING':
      console.warn(`${code}: ${message}`, data.reason);
      break;
  }
};

<HTML5AdView adUnitID="YOUR_ADUNIT_ID" onAdEvent={handleAdEvent} />;
```

### Event payload

`event.nativeEvent` is an `AdViewEvent`:

| Field | Type | Description |
|---|---|---|
| `code` | `AdViewEventCode` | SDK reference code, e.g. `'AE1'` |
| `type` | `AdViewEventType` | Event kind, e.g. `'AD_NO_FILL'` |
| `message` | `string` | Human-readable description |
| `data` | `{ reason: string }` | Extra details; always present. `data.reason` is filled on the events marked below and an empty string otherwise |

`data.reason` is a detailed description of what went wrong. Use it for diagnostics only; match on `code` or `type`, never on the text.

Code prefixes: `AL` lifecycle, `AI` interaction, `AE` error, `AW` warning.

### Event reference

| Code | type | Meaning | When it occurs | Possible cause | Recommended action |
|---|---|---|---|---|---|
| AL1 | `AD_LOADED` | Ad loaded successfully | Creative rendered | — | — |
| AL2 | `AD_CLOSED` | Ad closed | `destroy()` is called on the ref | — | — |
| AI1 | `AD_CLICKED` | Ad clicked | User taps the ad | — | — |
| AE1 | `AD_NO_FILL` | No ad available | Server returns no ad | No active campaign for the ad unit | Hide the placement |
| AE2 | `AD_NETWORK_ERROR` | Ad request failed | Ad request does not complete | Device offline, timeout, server error, or connection dropped mid-response | Retry later |
| AE3 | `AD_INTERNAL_ERROR` | Ad failed to render | While rendering the creative | Web view error | Contact support with `code` and `data.reason` |
| AE4 | `AD_INTERNAL_ERROR` | Ad response could not be parsed | After the ad response | Response format not supported by this SDK version | Retry later; if it keeps happening, contact support with `code` |
| AW1 | `AD_WARNING` | SDK not initialized | When the ad loads | The ad is not inside an `AdgeistProvider` | Wrap your app in [`AdgeistProvider`](#configure-adgeistprovider) |
| AW2 | `AD_WARNING` | Ad unit ID is empty | When the ad loads | `adUnitID` is empty | Pass your ad unit ID as `adUnitID` |
| AW3 | `AD_WARNING` | Ad has no size | After the ad response | Fixed-size ad with no `adSize` | Pass `adSize`, or set `adIsResponsive={true}` |
| AW4 | `AD_WARNING` | Responsive ad has no width or height | During layout | Neither the parent nor `adSize` gives an axis a size, so it measures `0` | Follow `data.reason`, which names the axis and the fix |
| AW5 | `AD_WARNING` | Ad is already loading | On `loadAd()` from the ref | `loadAd()` called again before the previous load finished | Wait for the previous load's event |
| AW6 | `AD_WARNING` | Ad request rejected | During the ad request | Request rejected by the server (HTTP 4xx) | Check `adUnitID` and `ADGEIST_APP_ID` in `AndroidManifest.xml` |
| AW7 | `AD_WARNING` | Ad size mismatch | After the ad response | Your `adSize` differs from the adspace's size; the ad was resized | Set `adSize` to the size in `data.reason` |
| AW8 | `AD_WARNING` | Not enough space for a companion ad | While rendering the creative | Less than 320x320 available; the ad is collapsed and not tracked | Give the ad at least 320x320 |

`data.reason` is non-empty on AE3, AW4, AW7 and AW8.

A load **fails** with AE1, AE2, AE3, AE4, AW1, AW2, AW3 or AW6. After a failed load the ad keeps or gives up its space according to [`reserveSpace`](#reservespace--keep-the-slot-when-an-ad-fails). The other warnings do not stop the ad.


## Support

If you run into any difficulties while integrating or using the Adgeist Mobile Ads SDK, reach out to beast@thealteroffice.com or kishore@thealteroffice.com and we'll help you get it sorted out.