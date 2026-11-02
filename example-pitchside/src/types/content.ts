export type Sport = 'CRICKET' | 'FOOTBALL' | 'KABADDI' | 'BASKETBALL';
export type HomePill = 'ALL' | Sport;

export interface IContentItem {
  id: string;
  title: string;
  subtitle: string;
  tournament: string;
  sport: Sport;
  isLive: boolean;
  isPremium: boolean;
  durationLabel: string;
  posterColor: string;
}

export type VastTagType = 'BUMPER' | 'REGULAR';

export interface IVastTag {
  vastTagId: string;
  vastTagType: VastTagType;
}

export interface IAdTagParams {
  cust_params: string;
}

export interface IVmaxExtraData {
  preRollEnabled: boolean;
  preRollTimeOut: number;
  preRollMaxDuration: number;
  midRollMaxDuration: number;
  preRollVastTagIds: IVastTag[];
  midRollVastTagIds: IVastTag[];
  adTagParams: IAdTagParams;
}

export interface IImaExtraData {
  adTagUrl: string;
  queryParams: string;
}

export type Csai =
  | { enabled: boolean; provider: 'VMAX'; extraData: IVmaxExtraData }
  | { enabled: boolean; provider: 'IMA'; extraData: IImaExtraData };

export type DaiSdkType = 'IMA_DAI_CORE' | 'IMA_DAI_EXTENSION' | 'PAL_SDK' | 'NO_SDK';

export interface ISsai {
  enabled: boolean;
  provider: 'DAI';
  extraData: { assetKey: string; sdkType: DaiSdkType; adTagParams: IAdTagParams };
}

export interface ISimulatedCue {
  id: string;
  startSec: number;
  durationSec: number;
}

export interface IVideoSource {
  url: string;
  isLive: boolean;
  csai: Csai | null;
  ssai: ISsai | null;
  timerBasedAdInterval: number;
  vodMidRollCuePoints: number[];
  simulatedScteCues: ISimulatedCue[];
}

export interface IStreamResponse {
  item: IContentItem;
  videoSource: IVideoSource;
  adFunded: { adDurationInSeconds: number } | null;
  related: IContentItem[];
}

export interface IHouseBanner {
  title: string;
  subtitle: string;
  targetContentId: string;
  color: string;
}

export type DisplayAdFormat = 'ROADBLOCK' | 'MASTHEAD' | 'BANNER_320x50' | 'MREC_300x250';

export interface IAdSlotConfig {
  adUnitId: string;
  format: DisplayAdFormat;
  defaultBanner: IHouseBanner | null;
}

export type HomeSegment =
  | { type: 'ROADBLOCK'; id: string; slot: IAdSlotConfig }
  | { type: 'HERO'; id: string; items: IContentItem[]; masthead: IAdSlotConfig | null }
  | { type: 'RAIL'; id: string; title: string; items: IContentItem[] }
  | { type: 'BANNER'; id: string; slot: IAdSlotConfig };

export interface IHomeResponse {
  pill: HomePill;
  segments: HomeSegment[];
}
