export type AdBreakPosition = 'preroll' | 'midroll';
export type AdBreakTriggerType = 'NORMAL' | 'TIMER_BASED' | 'SCTE';
export type AdSystem = 'Direct' | 'GAM' | 'InMobi' | 'PubMatic' | 'Fallback' | 'IMA';
export type AdPlayOutcome = 'completed' | 'skipped' | 'error' | 'aborted';

export interface IAdCreative {
  adId: string;
  creativeId: string;
  adSystem: AdSystem;
  advertiser: string;
  headline: string;
  mediaUrl: string;
  durationSec: number;
  skipOffsetSec: number | null;
  clickThroughUrl: string;
  isBumper: boolean;
}

export interface IAdPosition {
  breakId: string;
  breakPosition: AdBreakPosition;
  index: number;
  total: number;
}

export interface IAdPlaybackHost {
  showAdLoading: (visible: boolean) => void;
  playAd: (creative: IAdCreative, position: IAdPosition) => Promise<AdPlayOutcome>;
  stopAd: () => void;
  setContentMuted: (muted: boolean) => void;
  pauseContent: () => void;
  resumeContent: () => void;
  isAppActive: () => boolean;
}

export interface IAdsManager {
  readonly label: string;
  startPreRoll: () => Promise<void>;
  onFirstFrame: () => void;
  onContentTime: (currentTimeSec: number) => void;
  onContentPlayingChange: (isPlaying: boolean) => void;
  dispose: () => void;
}
