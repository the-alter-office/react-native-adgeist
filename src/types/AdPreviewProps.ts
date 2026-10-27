import type { NativeSyntheticEvent } from 'react-native';
import type { AdSize } from './AdSize';
import type { AdViewEvent } from './HTML5AdNativeComponentProps';

/**
 * Preview card layout.
 * - `banner` / `display` — single creative
 * - `companion` — video with a companion banner strip beneath it
 */
export type AdPreviewType = 'banner' | 'display' | 'companion';

/** Asset kind used to pick a built-in sample creative. */
export type AdPreviewMedia = 'image' | 'gif' | 'video';

/**
 * Props for `HTML5AdViewPreview`.
 *
 * Renders a sample creative for layout work. No ad request, no impression,
 * no reporting. Replace with `HTML5AdView` before release.
 */
export interface HTML5AdViewPreviewProps {
  /** @default 'banner' */
  type?: AdPreviewType;

  /**
   * Picks the built-in sample when `creativeUrl` is omitted.
   * Ignored when `type` is `'companion'` (always a sample video).
   *
   * @default 'image'
   */
  media?: AdPreviewMedia;

  /**
   * Primary creative. Omit to use a sample matching the container aspect ratio.
   * Asset kind is inferred from the file extension, not from `media`.
   */
  creativeUrl?: string;

  /**
   * Companion banner shown under the video. Read only when `type` is `'companion'`.
   * Omit for the built-in sample.
   */
  companionUrl?: string;

  /** Headline. @default '' */
  title?: string;

  /** Body copy. @default '' */
  description?: string;

  /** Opened on click when `deepLinkUrl` is absent or fails. @default 'https://adgeist.ai' */
  ctaUrl?: string;

  /** Tried first on click; falls back to `ctaUrl` when it cannot open. */
  deepLinkUrl?: string;

  /**
   * `true` — creative fills the container within its min/max bounds.
   * `false` — fixed to `adSize` pixels.
   *
   * @default true
   */
  isResponsive?: boolean;

  /** Requested size. A missing or non-positive axis fills the container. */
  adSize?: AdSize;

  /**
   * @default false
   * @deprecated No effect — ignored by the native preview on both platforms.
   */
  reserveSpace?: boolean;

  /**
   * Native preview events: `AD_LOADED`, `AD_CLICKED`, `AD_NO_FILL`, `AD_NETWORK_ERROR`, `AD_WARNING`.
   *
   * @platform ios — never called on Android, where the preview reports nothing.
   */
  onAdEvent?: (event: NativeSyntheticEvent<AdViewEvent>) => void;
}

/** Imperative handle for `HTML5AdViewPreview`. */
export interface HTML5AdViewPreviewRef {
  /** Re-renders the preview. Called automatically once the native view mounts. */
  loadAd: () => void;
}
