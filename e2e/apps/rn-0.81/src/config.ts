import {
  ADGEIST_E2E_AD1_UNIT_ID,
  ADGEIST_E2E_AD1_RESPONSIVE,
  ADGEIST_E2E_AD1_WIDTH,
  ADGEIST_E2E_AD1_HEIGHT,
  ADGEIST_E2E_AD2_UNIT_ID,
  ADGEIST_E2E_AD2_RESPONSIVE,
  ADGEIST_E2E_AD2_WIDTH,
  ADGEIST_E2E_AD2_HEIGHT,
  ADGEIST_E2E_AD3_UNIT_ID,
  ADGEIST_E2E_AD3_RESPONSIVE,
  ADGEIST_E2E_AD3_WIDTH,
  ADGEIST_E2E_AD3_HEIGHT,
} from '@env';

export type AdKind = 'companion' | 'banner' | 'display';

export type AdSizeConfig = {
  width?: number;
  height?: number;
};

export type AdConfig = {
  adUnitId: string;
  adIsResponsive?: boolean;
  adSize?: AdSizeConfig;
};

function toPositiveNumber(raw?: string) {
  if (!raw) {
    return undefined;
  }
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

function readAd(unitId?: string, responsive?: string, width?: string, height?: string) {
  if (!unitId) {
    return undefined;
  }

  const ad: AdConfig = { adUnitId: unitId.trim() };

  if (responsive === 'true' || responsive === 'false') {
    ad.adIsResponsive = responsive === 'true';
  }

  const adSize: AdSizeConfig = {};
  const parsedWidth = toPositiveNumber(width);
  const parsedHeight = toPositiveNumber(height);
  if (parsedWidth !== undefined) {
    adSize.width = parsedWidth;
  }
  if (parsedHeight !== undefined) {
    adSize.height = parsedHeight;
  }
  if (adSize.width !== undefined || adSize.height !== undefined) {
    ad.adSize = adSize;
  }

  return ad;
}

const ads: (AdConfig | undefined)[] = [
  readAd(
    ADGEIST_E2E_AD1_UNIT_ID,
    ADGEIST_E2E_AD1_RESPONSIVE,
    ADGEIST_E2E_AD1_WIDTH,
    ADGEIST_E2E_AD1_HEIGHT
  ),
  readAd(
    ADGEIST_E2E_AD2_UNIT_ID,
    ADGEIST_E2E_AD2_RESPONSIVE,
    ADGEIST_E2E_AD2_WIDTH,
    ADGEIST_E2E_AD2_HEIGHT
  ),
  readAd(
    ADGEIST_E2E_AD3_UNIT_ID,
    ADGEIST_E2E_AD3_RESPONSIVE,
    ADGEIST_E2E_AD3_WIDTH,
    ADGEIST_E2E_AD3_HEIGHT
  ),
];

export const AD_KINDS: AdKind[] = ['companion', 'banner', 'display'];

export function adFor(kind: AdKind): AdConfig | undefined {
  return ads[AD_KINDS.indexOf(kind)];
}

export function adNumber(kind: AdKind): number {
  return AD_KINDS.indexOf(kind) + 1;
}
