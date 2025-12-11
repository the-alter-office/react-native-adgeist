import type { AdSize, AdSizeType } from './types/AdSize';

export const AdSizes = {
  BANNER: { type: 'BANNER' as AdSizeType, width: 320, height: 50 },
  LARGE_BANNER: { type: 'LARGE_BANNER' as AdSizeType, width: 320, height: 100 },
  MEDIUM_RECTANGLE: {
    type: 'MEDIUM_RECTANGLE' as AdSizeType,
    width: 300,
    height: 250,
  },
  FULL_BANNER: { type: 'FULL_BANNER' as AdSizeType, width: 468, height: 60 },
  LEADERBOARD: { type: 'LEADERBOARD' as AdSizeType, width: 728, height: 90 },
  WIDE_SKYSCRAPER: {
    type: 'WIDE_SKYSCRAPER' as AdSizeType,
    width: 160,
    height: 600,
  },
  custom: (width: number, height: number): AdSize => ({ width, height }),
};

export const HTML_5_AD_NATIVE_COMPONENT_NAME = 'HTML5AdNativeComponent';
