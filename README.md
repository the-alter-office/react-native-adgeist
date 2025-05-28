![NPM Version](https://img.shields.io/npm/v/@thealteroffice/react-native-adgeist)

---

# @thealteroffice/react-native-adgeist

A React Native library that allows publishers can integrate our SDK to connect their ad spaces to the AdGeist marketplace.
Written in Kotlin, Swift and Typescript. It supports both the Old and New React Native architecture.

## Installation

### React Native Bare

You can install the package via npm or yarn:

```sh
npm install @thealteroffice/react-native-adgeist
```

```sh
yarn add @thealteroffice/react-native-adgeist
```

Don't forget to run pod-install.

### Expo

You can install the package like any other Expo package, using the following command:

```sh
npx expo install @thealteroffice/react-native-adgeist
```

## Setup

### Expo

Simply add the library plugin to your `app.json` file:

```json
{
  "expo": {
    "plugins": ["@thealteroffice/react-native-adgeist"]
  }
}
```

This way, Expo will handle the native setup for you during `prebuild`. You can prebuild using

```sh
npx expo prebuild --clean
```

> Note: only SDK 50 and above are supported, the plugin is configured to handle only the kotlin template.

## Usage

```js
import { BannerAd } from '@thealteroffice/react-native-adgeist';
import { BottomBannerAd } from '@thealteroffice/react-native-adgeist';

// ...

<BannerAd
  dataPublisherId={PUBLISHER_ID}
  dataAdSlot={ADSPACE_ID}
  width={400}
  height={300}
/>

<BottomBannerAd
  dataPublisherId={PUBLISHER_ID}
  dataAdSlot={ADSPACE_ID}
/>
```
