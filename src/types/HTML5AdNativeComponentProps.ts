import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';

export type AdViewEventType =
  | 'AD_LOADED'
  | 'AD_CLOSED'
  | 'AD_CLICKED'
  | 'AD_NO_FILL'
  | 'AD_NETWORK_ERROR'
  | 'AD_INTERNAL_ERROR'
  | 'AD_WARNING';

export type AdViewEventCode =
  | 'AL1'
  | 'AL2'
  | 'AI1'
  | 'AE1'
  | 'AE2'
  | 'AE3'
  | 'AE4'
  | 'AW1'
  | 'AW2'
  | 'AW3'
  | 'AW4'
  | 'AW5'
  | 'AW6'
  | 'AW7'
  | 'AW8';

export interface AdViewEventData {
  reason: string;
}

export interface AdViewEvent {
  code: AdViewEventCode;
  type: AdViewEventType;
  message: string;
  data: AdViewEventData;
}

/**
 * Props of `HTML5AdView`.
 */
export interface HTML5AdNativeComponentProps {
  /**
   * Ad unit ID from the Adgeist web interface. Each ad placement in your app
   * needs its own ad unit ID. Changing it loads a new ad.
   */
  adUnitID: string;

  /**
   * Set to `true` if the adspace was created as responsive on adgeist.ai.
   * A responsive ad takes its size from the parent layout, so it needs no
   * `adSize`. Leave it out for a fixed-size adspace.
   *
   * @default false
   */
  adIsResponsive?: boolean;

  /**
   * The space your layout reserves for the ad, taken as soon as the
   * component mounts so nothing shifts when the creative arrives.
   *
   * - **Fixed-size adspace:** pass both `width` and `height`, exactly as
   *   entered on adgeist.ai. If they differ, the ad resizes to the adspace's
   *   size and `AW7` fires with the correct size.
   * - **Responsive adspace:** usually left out. Pass one axis when the parent
   *   doesn't size it, e.g. `{ height: 50 }` inside a `ScrollView`. An axis
   *   you leave out fills `100%` of the parent.
   *
   * It does not decide the creative's size; the adspace on adgeist.ai does.
   *
   * @see https://github.com/the-alter-office/react-native-adgeist#what-adsize-actually-does
   */
  adSize?: AdSize;

  /**
   * What happens to the ad's space when a load fails (`AE1`–`AE4`, `AW1`,
   * `AW2`, `AW3`, `AW6`).
   *
   * - `true`: keeps its box in your layout, empty. No layout shift.
   * - `false`: removes itself from your layout.
   *
   * A responsive ad can only hold the axes that resolve to a size.
   * `destroy()` always tears the ad down, whatever this is set to.
   *
   * @default true
   */
  reserveSpace?: boolean;

  /**
   * Called for every ad event: loaded, clicked, closed, errors and
   * integration warnings. Read the payload from `event.nativeEvent`.
   *
   * @example
   * ```tsx
   * onAdEvent={(event) => {
   *   const { type, code, message, data } = event.nativeEvent;
   *   if (type === 'AD_WARNING') console.warn(`${code}: ${message}`, data.reason);
   * }}
   * ```
   *
   * @see https://github.com/the-alter-office/react-native-adgeist#ad-events
   */
  onAdEvent?: (event: NativeSyntheticEvent<AdViewEvent>) => void;
}

export interface HTML5AdViewRef {
  loadAd: () => void;
  destroy: () => void;
}
