/**
 * Defines the supported ad types for AdGeist SDK.
 * Publishers must use these predefined values when configuring ads.
 */
export type AdType = 'BANNER' | 'DISPLAY' | 'COMPANION';

export const AdTypes = {
  /** Small rectangular banner ads typically displayed at the top or bottom of the screen */
  BANNER: 'BANNER' as AdType,

  /** Standard display advertisements */
  DISPLAY: 'DISPLAY' as AdType,

  /** Companion ads displayed alongside other content (requires minimum 320x320 dimensions) */
  COMPANION: 'COMPANION' as AdType,
} as const;
