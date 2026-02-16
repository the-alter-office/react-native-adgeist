import type { AdSize } from './types/AdSize';

export const PACKAGE_VERSION_TAG = 'RN';
export const PACKAGE_VERSION = '0.0.29-beta';

export const AdSizes = {
  custom: (width: number, height: number): AdSize => ({ width, height }),
  Responsive: { width: -1, height: -1 },
};

export const HTML_5_AD_NATIVE_COMPONENT_NAME = 'HTML5AdNativeComponent';
