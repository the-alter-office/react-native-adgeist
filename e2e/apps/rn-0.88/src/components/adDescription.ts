import type { AdConfig } from '../config';
import { isFixedSize } from './AdSlot';

export function adCode(ad: AdConfig) {
  if (isFixedSize(ad)) {
    return `adSize={{ width: ${ad.adSize?.width}, height: ${ad.adSize?.height} }}`;
  }
  const axes = [
    ad.adSize?.width !== undefined ? `width: ${ad.adSize.width}` : null,
    ad.adSize?.height !== undefined ? `height: ${ad.adSize.height}` : null,
  ].filter(Boolean);
  return axes.length > 0 ? `adIsResponsive\nadSize={{ ${axes.join(', ')} }}` : 'adIsResponsive\n// no adSize';
}
