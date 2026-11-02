import type { IVastTag } from '../../types/content';
import type { AdSystem, IAdCreative } from '../../types/ads';

const SAMPLE_BASE = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample';

interface IDemandSource {
  adSystem: AdSystem;
  fillRate: number;
}

const WATERFALL: IDemandSource[] = [
  { adSystem: 'Direct', fillRate: 0.45 },
  { adSystem: 'GAM', fillRate: 0.4 },
  { adSystem: 'InMobi', fillRate: 0.3 },
  { adSystem: 'PubMatic', fillRate: 0.3 },
  { adSystem: 'Fallback', fillRate: 0.5 },
];

const CREATIVES = [
  { advertiser: 'Volt Energy', headline: 'Charge the last over', media: 'ForBiggerBlazes.mp4' },
  { advertiser: 'Northwind Mobile', headline: 'Unlimited data for match day', media: 'ForBiggerEscapes.mp4' },
  { advertiser: 'Crestline Motors', headline: 'Test drive the new Crest X', media: 'ForBiggerJoyrides.mp4' },
  { advertiser: 'Kitebird Travel', headline: 'Fly to the away game', media: 'ForBiggerFun.mp4' },
];

const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

let adCounter = 0;

function buildCreative(tag: IVastTag | null, adSystem: AdSystem): IAdCreative {
  adCounter += 1;
  const isBumper = tag?.vastTagType === 'BUMPER';
  const creative = isBumper
    ? { advertiser: 'Pitchside Premier League', headline: 'Presented by Volt Energy', media: 'ForBiggerMeltdowns.mp4' }
    : pick(CREATIVES);
  return {
    adId: `ad-${adCounter}`,
    creativeId: `cr-${creative.media.replace('.mp4', '').toLowerCase()}`,
    adSystem,
    advertiser: creative.advertiser,
    headline: creative.headline,
    mediaUrl: `${SAMPLE_BASE}/${creative.media}`,
    durationSec: isBumper ? 5 : 15,
    skipOffsetSec: isBumper ? null : adSystem === 'Direct' ? null : 5,
    clickThroughUrl: 'https://example.com/advertiser',
    isBumper,
  };
}

export async function requestVmaxAd(tag: IVastTag, custParams: string): Promise<IAdCreative | null> {
  try {
    await sleep(randomBetween(300, 2500));
    if (tag.vastTagType === 'BUMPER') return buildCreative(tag, 'Direct');
    for (const source of WATERFALL) {
      if (Math.random() < source.fillRate) return buildCreative(tag, source.adSystem);
    }
    return null;
  } catch (error) {
    console.error('requestVmaxAd failed', tag.vastTagId, custParams, error);
    return null;
  }
}

export async function requestImaVast(adTagUrl: string, timeoutMs: number): Promise<IAdCreative | null> {
  try {
    const latency = randomBetween(200, 3000);
    if (latency > timeoutMs) {
      await sleep(timeoutMs);
      return null;
    }
    await sleep(latency);
    return Math.random() < 0.8 ? buildCreative(null, 'IMA') : null;
  } catch (error) {
    console.error('requestImaVast failed', adTagUrl, error);
    return null;
  }
}
