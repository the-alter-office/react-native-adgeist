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

| Package | Install It? | Why? |
|---------|-------------|------|
| `react-native-video` | ✅ **Yes (required)** | Your app must install this manually to satisfy the peer dependency |

## 🔧 Setup & Configuration

### Basic Setup

Wrap your app with `AdgeistProvider` to configure global settings:

```tsx
import React from 'react';
import { AdgeistProvider, BannerAd } from '@thealteroffice/react-native-adgeist';

export default function App() {
  return (
    <AdgeistProvider
      publisherId="your-publisher-id"
      apiKey="your-api-key"
      domain="your-domain"
      isTestEnvironment="your-environment"
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

## 📱 Components

### AdgeistProvider

The root provider component that configures the SDK globally.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `children` | `React.ReactNode` | ✅ | - | Child components |
| `publisherId` | `string` | ✅ | - | Your publisher ID from AdGeist dashboard |
| `apiKey` | `string` | ✅ | - | Your API key from AdGeist dashboard |
| `domain` | `string` | ✅ | - | Your registered domain (e.g., "https://adgeist.ai") |
| `isTestEnvironment` | `boolean` | ✅ | - | Enable test mode for development |

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

Display banner advertisements in your app.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `dataAdSlot` | `string` | ✅ | - | Ad slot ID from your AdGeist dashboard |
| `width` | `number` | ❌ | Device width | Width of the ad banner |
| `height` | `number` | ❌ | `300` | Height of the ad banner |

#### Example

```tsx
import { BannerAd } from '@thealteroffice/react-native-adgeist';

function MyScreen() {
  return (
    <View>
      <BannerAd 
        dataAdSlot="686149fac1fd09fff371e53c"
        width={350}
        height={250}
      />
    </View>
  );
}
```

## 🔧 Native Module API

For advanced use cases, you can directly use the native module:

```tsx
import Adgeist from '@thealteroffice/react-native-adgeist/src/NativeAdgeist';

// Fetch creative data
const adData = await Adgeist.fetchCreative(
  apiKey,
  origin,
  adSpaceId,
  publisherId,
  isTestEnvironment
);

// Send analytics
await Adgeist.sendCreativeAnalytic(
  campaignId,
  adSpaceId,
  publisherId,
  eventType, // 'IMPRESSION' | 'CLICK'
  origin,
  apiKey,
  bidId,
  isTestEnvironment
);
```

### Native Module Methods

#### `fetchCreative`

Fetches ad creative data from the AdGeist API.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `apiKey` | `string` | ✅ | Your API key |
| `origin` | `string` | ✅ | App domain/origin |
| `adSpaceId` | `string` | ✅ | Ad space identifier |
| `publisherId` | `string` | ✅ | Publisher identifier |
| `isTestEnvironment` | `boolean` | ✅ | Test mode flag |

**Returns**: `Promise<AdData>`

#### `sendCreativeAnalytic`

Sends analytics data for ad interactions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | `string` | ✅ | Campaign identifier |
| `adSpaceId` | `string` | ✅ | Ad space identifier |
| `publisherId` | `string` | ✅ | Publisher identifier |
| `eventType` | `string` | ✅ | Event type ('IMPRESSION' or 'CLICK') |
| `origin` | `string` | ✅ | App domain/origin |
| `apiKey` | `string` | ✅ | Your API key |
| `bidId` | `string` | ✅ | Bid identifier |
| `isTestEnvironment` | `boolean` | ✅ | Test mode flag |

**Returns**: `Promise<Object>`

## 📊 Data Types

### AdData Interface

```tsx
interface AdData {
  id: string;
  bidId: string;
  cur: string;
  seatBid: SeatBid[];
}

interface SeatBid {
  bidId: string;
  bid: Bid[];
}

interface Bid {
  id: string;
  impId: string;
  price: number;
  ext: BidExtension;
}

interface BidExtension {
  creativeUrl: string;
  ctaUrl: string;
  creativeTitle: string;
  creativeDescription: string;
  creativeBrandName?: string;
}
```

## 🎨 Customization

### Custom Ad Loader

Create your own ad loading component:

```tsx
import React, { useState, useEffect } from 'react';
import { useAdgeistContext } from '@thealteroffice/react-native-adgeist';
import Adgeist from '@thealteroffice/react-native-adgeist/src/NativeAdgeist';

function CustomAdLoader({ adSlotId }) {
  const [adData, setAdData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { publisherId, apiKey, domain, isTestEnvironment } = useAdgeistContext();

  useEffect(() => {
    loadAd();
  }, []);

  const loadAd = async () => {
    try {
      const response = await Adgeist.fetchCreative(
        apiKey,
        domain,
        adSlotId,
        publisherId,
        isTestEnvironment
      );
      setAdData(response.data);
    } catch (error) {
      console.error('Failed to load ad:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!adData) return null;

  return <YourCustomAdDisplay data={adData} />;
}
```

```
