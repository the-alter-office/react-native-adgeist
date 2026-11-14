![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

React Native bindings for the Adgeist Mobile Ads SDK. One component, `HTML5AdView`, serves ads on both platforms. It works with the new and the old architecture, and with Expo through the bundled config plugin.


Before ads will serve you need an Adgeist publisher account with your app registered.

## Prerequisites

| | Minimum |
|---|---|
| React Native | 0.77 |
| Expo SDK | 53 |
| iOS | Deployment target 15.6, Xcode 16 |
| Android | `minSdkVersion` 24, `compileSdkVersion` 35, JDK 17 |

## Install

```bash
npm install @thealteroffice/react-native-adgeist
# or
yarn add @thealteroffice/react-native-adgeist
```

On iOS, install the pods:

```bash
cd ios && pod install --repo-update
```

## Configure

Your publisher ID goes in each platform's native config. You'll find it in the Adgeist web interface.

On Android, add a `<meta-data>` tag to `AndroidManifest.xml`. The `android:name` attribute stays as it is; replace the value with your own ID, in quotation marks.

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

On iOS, add an `ADGEIST_APP_ID` key to `Info.plist`. The key name stays as it is.

```xml
<!-- Sample Adgeist app ID: 69326f9fbb280f9241cabc94 -->

<key>ADGEIST_APP_ID</key>
<string>YOUR_ADGEIST_APP_ID</string>
```

Expo apps on the managed workflow skip both edits. Add the config plugin to `app.json` or `app.config.js` and it writes the `Info.plist` key and the `AndroidManifest.xml` entry during prebuild.

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

`adgeistAppId` is required — prebuild fails without it. The native modules are autolinked, so nothing else is needed, but this does require a development build.

No publisher ID yet? You can still build against the SDK. [Preview](#preview) renders real ad layouts locally without an ID, an adspace or a network call, so the integration work doesn't have to wait on the dashboard.

## Initialize

Wrap your app in `AdgeistProvider`. It initializes the SDK on mount and renders your app once that settles, so an ad mounted anywhere below it finds the SDK ready.

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

## Identify the user

Optional. Attach user details for targeted ads.

```tsx
import { setUserDetails } from '@thealteroffice/react-native-adgeist';

setUserDetails({
  userId: 'user-123',
  email: 'jane@example.com',
  phone: '+919876543210',
});
```

Every field is optional, so pass only what you have. Phone numbers need the country code — `'+919876543210'`, not `'9876543210'`.

Call it when the user signs in, and again whenever one of the details changes.

On iOS, ask for [tracking permission](#ask-for-tracking-permission) before this call.

## Ask for tracking permission

iOS only, and optional. `requestTrackingAuthorization()` shows Apple's App Tracking Transparency prompt and resolves to whether the user allowed tracking. Without that permission there is no advertising identifier to target with, so ads still serve, just untargeted.

```tsx
import { requestTrackingAuthorization } from '@thealteroffice/react-native-adgeist';

const granted = await requestTrackingAuthorization();
```

The prompt only appears if `NSUserTrackingUsageDescription` is in your `Info.plist`. Without the key nothing is shown and the call resolves `false`. Write the sentence yourself — it's what the user reads, and Apple reviews it.

```xml
<key>NSUserTrackingUsageDescription</key>
<string>We use your advertising identifier to provide personalized ads and measure ad performance.</string>
```

Expo apps put the same string in `app.json` — the config plugin writes the app ID, not this.

```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "We use your advertising identifier to provide personalized ads and measure ad performance."
      }
    }
  }
}
```

iOS shows the prompt once in the lifetime of the install, so call it at a point where the ask makes sense to the user; after that the call just resolves with the answer they already gave. On Android it does nothing and resolves `false`, so you can call it unconditionally.

## Show an ad

`HTML5AdView` loads itself when it mounts. An adspace is either fixed-size or responsive, depending on what you chose while creating it on [adgeist.ai](https://adgeist.ai) — use the snippet that matches yours. Each one is complete; copy it into your screen and the ad placement is done.

A fixed-size adspace, where you entered a width and a height when you created it:

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

A responsive adspace, which takes its size from your layout and so carries no dimensions:

```tsx
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  onAdEvent={(event) => console.log(event.nativeEvent)}
/>;
```

Replace `YOUR_ADUNIT_ID` with your Adgeist ad unit ID, as identified in the Adgeist web interface. Each ad placement in your app needs its own. Replace `YOUR_AD_WIDTH` and `YOUR_AD_HEIGHT` with the exact dimensions you entered on adgeist.ai, so your layout and the adspace can never disagree — see [Sizing](#sizing). Everything the ad reports arrives through `onAdEvent`.

That's the whole surface, apart from these:

```tsx
<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"            // string, required
  adIsResponsive={false}               // boolean = false
  adSize={{ width: 320, height: 480 }} // { width?: number, height?: number }
  reserveSpace={true}                  // boolean = true
  onAdEvent={(event) => {}}
  ref={adRef}                          // { loadAd(): void, destroy(): void }
/>;

interface AdViewEvent {
  code: AdViewEventCode;  // 'AE1' and friends
  type: AdViewEventType;  // 'AD_LOADED' | 'AD_CLICKED' | 'AD_CLOSED' | …
  message: string;
  data: { reason: string };
}
```

Everything except the ID has a default, so pass only what you need.

### Custom styling

You can make display and companion ads match the look of your app: colours, corners, border, fonts and the call-to-action button. Pass `styleOptions` to `HTML5AdView`, and pass `fontUrl` if you want to load your own font.

If you change either prop after the ad has loaded, the new values are used the next time an ad loads.

```tsx
import {
  HTML5AdView,
  HTML5AdViewPreview,
  type AdStyleOptions,
} from '@thealteroffice/react-native-adgeist';

const brandStyle: AdStyleOptions = {
  backgroundColor: '#141A17',
  cornerRadius: 'MD',
  showBorder: false,
  adLabel: 'SPONSORED',
  titleColor: '#F5F7F6',
  titleFontStyle: 'BOLD',
  ctaStyle: 'OUTLINE',
  ctaShape: 'ROUNDED',
};

<HTML5AdView
  adUnitID="YOUR_ADUNIT_ID"
  adIsResponsive={true}
  styleOptions={brandStyle}
  fontUrl="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
/>;
```

To check the look before your adspace is live, pass the same style and font to a [preview](#preview):

```tsx
<HTML5AdViewPreview
  type="display"
  adSize={{ width: 300, height: 250 }}
  styleOptions={brandStyle}
  fontUrl="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
/>;
```

Good to know:

- Styling works on display and companion ads. Banner ads aren't styled.
- Anything you set here overrides the styling set for the adspace on adgeist.ai. Anything you leave out keeps that setting, or the default in the table below if there isn't one.
- Values are case-sensitive (`"MD"`, not `"md"`), and colours are hex: `#RGB` or `#RRGGBB`. If a value isn't valid, that field is skipped and the default is used.
- `fontUrl` must be a public `https` link to either a stylesheet, such as a Google Fonts URL, or a font file (`.woff2`, `.woff`, `.ttf`, `.otf`). When you set it, it replaces `fontFamily`. If the font is hosted on another domain, that server has to allow cross-origin requests (`Access-Control-Allow-Origin`), otherwise the card uses the system font.

| Field | What it changes | Values | Default |
| --- | --- | --- | --- |
| `backgroundColor` | Card background | Hex colour | `#FFFFFF` |
| `cornerRadius` | How rounded the card's corners are | `SM` (4px), `MD` (8px), `LG` (12px), `XL` (16px) | Square corners |
| `showBorder` | Whether the card has a border | `true`, `false` | `true` |
| `borderColor` | Border colour | Hex colour | `#d4d5d7` |
| `adLabel` | The label that marks the card as an ad | `AD`, `ADVERTISEMENT`, `SPONSORED`, `PROMOTED`, `PARTNER_CONTENT` | `AD` (shown as "Ad") |
| `fontFamily` | Font for all text on the card. `custom` uses the font from `fontUrl` | `system-ui`, `Roboto`, `Open Sans`, `Lato`, `Montserrat`, `Inter`, `Poppins`, `custom` | System font |
| `textAlign` | Text alignment. Display ads only | `AUTO`, `LEFT`, `CENTER` | `AUTO` |
| `titleColor` | Headline colour | Hex colour | `#000000` |
| `titleFontStyle` | Headline style | `NORMAL`, `BOLD`, `ITALIC` | `BOLD` on display, `NORMAL` on companion |
| `descriptionColor` | Body text colour | Hex colour | `#4B5563` |
| `descriptionFontStyle` | Body text style | `NORMAL`, `BOLD`, `ITALIC` | `NORMAL` |
| `ctaStyle` | How the button is drawn: filled, outlined, or as a plain link | `FILLED`, `OUTLINE`, `LINK` | `FILLED` |
| `ctaShape` | Shape of the button's corners | `SQUARE`, `ROUNDED`, `PILL` | `PILL` |
| `ctaBackgroundColor` | Button fill colour. Only used when `ctaStyle` is `FILLED` | Hex colour | `#85C896` |
| `ctaTextColor` | Button text colour | Hex colour | `#1D1D1D` |
| `ctaBorderColor` | Button border colour | Hex colour | No border |

## Preview

Sometimes you want the layout settled before the adspace exists, or you want to check a format still renders after upgrading the SDK. `HTML5AdViewPreview` renders a sample creative through the same renderer the real ads use.

No ad request goes out, no ad unit ID is involved, and your Adgeist app ID doesn't need to be set. Nothing is reported either — no impressions, no clicks, no telemetry — so your live numbers stay clean.

It runs on both platforms, but `onAdEvent` is iOS only: the Android preview renders and a tap still opens the CTA, it just reports nothing back. Don't gate anything on a preview event there.

```tsx
import { HTML5AdViewPreview } from '@thealteroffice/react-native-adgeist';

<HTML5AdViewPreview
  type="display"        // 'banner' | 'display' | 'companion'
  media="video"         // 'image' | 'gif' | 'video'
  isResponsive={true}   // true fills and crops, false letterboxes
  adSize={{ width: 300, height: 250 }}
  onAdEvent={(event) => console.log(event.nativeEvent)}
/>;
```

`adSize` and `onAdEvent` behave exactly as they do on [`HTML5AdView`](#show-an-ad): the box is taken the moment the component mounts, an axis you leave out of `adSize` fills `100%` of the parent, and every event arrives in the one callback. The ref exposes `loadAd()` to render it again; there is no `destroy()`.

`isResponsive` is not `adIsResponsive`. It decides how the sample creative fills the slot — `true` crops, `false` letterboxes — and says nothing about where the slot's size comes from.

Leave `creativeUrl` out and you get a bundled sample matched to your slot's aspect ratio. Point it at your own artwork when you have some:

```tsx
<HTML5AdViewPreview
  type="companion"
  creativeUrl="https://example.com/creative.mp4"   // 16:9 video for 'companion'
  companionUrl="https://example.com/banner.png"    // 16:3 image, 'companion' only
  title="Your headline"
  description="Your body copy"
  ctaUrl="https://example.com"
  adSize={{ width: 300, height: 250 }}
/>;
```

Media type comes from the file extension, so an `.mp4` plays as video without you saying so. `ctaUrl` and `deepLinkUrl` behave exactly as they do on a live ad: the deep link is tried first and the CTA is the fallback. Empty `title` and `description` fall back to placeholder copy written at the real character limits, which is the quickest way to see where your own text will overflow — banners render neither, so don't expect them there. `reserveSpace` exists only so the prop lists match `HTML5AdView`; it does nothing here.

When the adspace is ready, delete the preview-only props, swap the component and pass the ID. Everything about sizing and events stays put.

```tsx
<HTML5AdViewPreview type="display" media="video" adSize={{ width: 300, height: 250 }} />
<HTML5AdView        adUnitID="YOUR_ADUNIT_ID"    adSize={{ width: 300, height: 250 }} />
```

## Sizing

`adSize` is the space your layout hands the ad. The component takes that box the moment it mounts, before any ad has been fetched, so your screen is laid out correctly while the request is in flight and nothing jumps when the creative arrives.

It is not what decides the creative's size. That comes from the adspace you configured on adgeist.ai. Pass the exact dimensions you entered there and the two agree. If they differ, the ad resizes to the adspace's size, your layout shifts, and `AW7` fires with the real size in `data.reason`. Read `AW7` as "your `adSize` is wrong, here is the right one", and treat it as a bug to fix rather than a runtime condition to handle.

A responsive adspace normally needs no `adSize` at all — that's the point of it. It takes each axis independently: an axis named in `adSize` uses the value you pass, and an axis you leave out is styled `100%` and comes from the parent. You only reach for `adSize` when your layout fixes one axis and leaves the other open.

```tsx
import { View } from 'react-native';
import { HTML5AdView } from '@thealteroffice/react-native-adgeist';

// Both axes from the parent — the usual case, no adSize
<View style={{ width: 300, height: 250 }}>
  <HTML5AdView adUnitID="YOUR_ADUNIT_ID" adIsResponsive={true} />
</View>;

// Bottom banner: full width from the parent, you supply the height
<HTML5AdView adUnitID="YOUR_ADUNIT_ID" adIsResponsive={true} adSize={{ height: 50 }} />;

// Side rail: full height from the parent, you supply the width
<HTML5AdView adUnitID="YOUR_ADUNIT_ID" adIsResponsive={true} adSize={{ width: 120 }} />;
```

An axis you leave out needs an ancestor with a real size on that axis. The case that catches people out is a `ScrollView`: it gives its children no definite height, so a responsive ad inside one should declare `adSize={{ height: ... }}`. Without it the height resolves against a parent that has none, measures `0`, and `AW4` fires naming the axis.

Not every request returns an ad. By default the component holds its box after a [failed load](#event-reference), so the rest of your screen stays exactly where it was. Pass `reserveSpace={false}` if you'd rather the ad give up its place when there's nothing to show.

Only a box with a size of its own can be held. A fixed ad always has one. A responsive ad holds the axes that resolve, and an axis nothing determines measures `0`, so there's nothing to hold open. This applies to failed loads only — `destroy()` on the ref always tears the ad down, whatever `reserveSpace` is set to.

## Events

`onAdEvent` is optional, and every event arrives through it.

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

Read the payload from `event.nativeEvent`. Each event carries a `code` (`AE1` and friends), a `type` (`AdViewEventType`), a human-readable `message`, and `data`, which holds `reason` on the events marked in the reference and an empty string otherwise. Branch on `code` or `type`. The message text and `data.reason` are for your logs, not your logic.

## When ads don't show up

Attach `onAdEvent`, print the code, and check it against this list. It's almost always one of them.

**`AE1`** — no campaign is running for that ad unit. Your integration is fine; hide the placement when you see it.

**`AW1`** — the ad isn't inside an `AdgeistProvider`. Wrap your app in one, see [Initialize](#initialize).

**`AW2`** — `adUnitID` is empty.

**`AW6`** — configuration. Publisher ID missing or wrong, app not registered, or an ad unit ID that doesn't exist.

**`AE2`** — the request didn't complete. Device offline, timed out, or a server error.

**`AE3` or `AE4`** — the creative didn't render, or the response couldn't be parsed. Send us the code and `data.reason`.

**`AW4`** — a responsive ad has an axis nothing sizes. `data.reason` names it. See [Sizing](#sizing).

**`AL1`, but still a blank space** — the ad loaded into a slot with no height. See [Sizing](#sizing).

**No events at all** — the component never mounted, or `AdgeistProvider` is still initializing and hasn't rendered your app yet.

When you can't tell whether it's your layout or the delivery, render the same placement with a [preview](#preview). If the preview looks right, the layout is sound and the problem is on the request side.

## Event reference

Prefixes: `AL` lifecycle, `AI` interaction, `AE` error, `AW` warning. Codes starting with `RW` come from this React Native wrapper rather than the native SDK, so `RWAE1` is a wrapper ad error.

| Code | type | Meaning | When it occurs | Possible cause | Recommended action |
|---|---|---|---|---|---|
| AL1 | `AD_LOADED` | Ad loaded successfully | Creative rendered | — | — |
| AL2 | `AD_CLOSED` | Ad closed | `destroy()` is called on the ref | — | — |
| AI1 | `AD_CLICKED` | Ad clicked | User taps the ad | — | — |
| AE1 | `AD_NO_FILL` | No ad available | Server returns no ad | No active campaign for the ad unit | Hide the placement |
| AE2 | `AD_NETWORK_ERROR` | Ad request failed | Ad request does not complete | Device offline, timeout, server error, or connection dropped mid-response | Retry later |
| AE3 | `AD_INTERNAL_ERROR` | Ad failed to render | While rendering the creative | Web view error | Contact support with `code` and `data.reason` |
| AE4 | `AD_INTERNAL_ERROR` | Ad response could not be parsed | After the ad response | Response format not supported by this SDK version | Retry later; if it keeps happening, contact support with `code` |
| RWAE1 | `AD_INTERNAL_ERROR` | Ad failed to load | When the ad starts loading (Android only) | Starting the ad request threw an exception | Contact support with `code` and `data.reason` |
| AW1 | `AD_WARNING` | SDK not initialized | When the ad loads | The ad is not inside an `AdgeistProvider` | Wrap your app in [`AdgeistProvider`](#initialize) |
| AW2 | `AD_WARNING` | Ad unit ID is empty | When the ad loads | `adUnitID` is empty | Pass your ad unit ID as `adUnitID` |
| AW3 | `AD_WARNING` | Ad has no size | After the ad response | Fixed-size ad with no `adSize` | Pass `adSize`, or set `adIsResponsive={true}` |
| AW4 | `AD_WARNING` | Responsive ad has no width or height | During layout | Neither the parent nor `adSize` gives an axis a size, so it measures `0` | Follow `data.reason`, which names the axis and the fix |
| AW5 | `AD_WARNING` | Ad is already loading | On `loadAd()` from the ref | `loadAd()` called again before the previous load finished | Wait for the previous load's event |
| AW6 | `AD_WARNING` | Ad request rejected | During the ad request | Request rejected by the server (HTTP 4xx) | Check `adUnitID` and your publisher ID |
| AW7 | `AD_WARNING` | Ad size mismatch | After the ad response | Your `adSize` differs from the adspace's size; the ad was resized | Set `adSize` to the size in `data.reason` |
| AW8 | `AD_WARNING` | Not enough space for a companion ad | While rendering the creative | Less than 320x320 available; the ad is collapsed and not tracked | Give the ad at least 320x320 |

`data.reason` is non-empty on AE3, AW4, AW7, AW8 and RWAE1.

A load fails with AE1, AE2, AE3, AE4, AW1, AW2, AW3, AW6 or RWAE1. After a failed load the ad keeps or gives up its space according to `reserveSpace`, see [Sizing](#sizing). The other warnings do not stop the ad.

---

## Support

If you run into any difficulties while integrating or using the Adgeist Mobile Ads SDK, reach out to beast@thealteroffice.com or kishore@thealteroffice.com and we'll help you get it sorted out.
