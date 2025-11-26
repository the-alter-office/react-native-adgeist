import { AdgeistAdView } from '@thealteroffice/react-native-adgeist';
import { AdSizes } from '../../src/constants';

export default function AdViewExample() {
  return (
    <AdgeistAdView
      adUnitId="691af20e4d10c63aa7ba7140"
      adSize={AdSizes.custom(360, 360)}
      isTestMode={true}
      onAdLoaded={() => {}}
      onAdFailedToLoad={() => {}}
      onAdOpened={() => {}}
      onAdClosed={() => {}}
      onAdClicked={() => {}}
    />
  );
}
