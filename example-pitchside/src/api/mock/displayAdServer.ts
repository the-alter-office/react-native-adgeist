import type { DisplayAdFormat } from '../../types/content';

export interface IDisplayCreative {
  id: string;
  advertiser: string;
  headline: string;
  body: string;
  cta: string;
  color: string;
}

const DISPLAY_CREATIVES: Omit<IDisplayCreative, 'id'>[] = [
  { advertiser: 'Volt Energy', headline: 'Fuel every chase', body: 'Zero sugar. All innings.', cta: 'Shop now', color: '#B8860B' },
  { advertiser: 'Northwind Mobile', headline: 'Stream in 4K on 5G', body: 'Match-day data packs from ₹49.', cta: 'Recharge', color: '#1F4E8C' },
  { advertiser: 'Crestline Motors', headline: 'The all-new Crest X', body: 'Book a test drive this weekend.', cta: 'Book', color: '#6B2D2D' },
  { advertiser: 'Kitebird Travel', headline: 'Away days, sorted', body: 'Flights + tickets bundles.', cta: 'Explore', color: '#2D6B5A' },
];

const FILL_RATE: Record<DisplayAdFormat, number> = {
  ROADBLOCK: 0.7,
  MASTHEAD: 0.6,
  BANNER_320x50: 0.65,
  MREC_300x250: 0.65,
};

let displayCounter = 0;

export async function loadDisplayAd(adUnitId: string, format: DisplayAdFormat): Promise<IDisplayCreative | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 400 + Math.random() * 800));
    if (Math.random() > FILL_RATE[format]) return null;
    displayCounter += 1;
    const creative = DISPLAY_CREATIVES[Math.floor(Math.random() * DISPLAY_CREATIVES.length)];
    return { ...creative, id: `${adUnitId}#${displayCounter}` };
  } catch (error) {
    console.error('loadDisplayAd failed', adUnitId, error);
    return null;
  }
}
