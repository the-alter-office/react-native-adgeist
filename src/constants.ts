import type { AdSize } from './types/AdSize';

export const AdSizes = {
  custom: (width: number, height: number): AdSize => ({ width, height }),
};

export const HTML_5_AD_NATIVE_COMPONENT_NAME = 'HTML5AdNativeComponent';
