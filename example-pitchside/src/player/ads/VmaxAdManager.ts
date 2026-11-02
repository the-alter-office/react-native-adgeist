import { requestVmaxAd } from '../../api/mock/adServer';
import { track } from '../../analytics/eventBus';
import type { IVmaxExtraData, IVideoSource, IVastTag } from '../../types/content';
import type { AdBreakPosition, AdBreakTriggerType, IAdPlaybackHost, IAdsManager } from '../../types/ads';
import { AdBreakRunner } from './AdBreakRunner';
import { createSlotRequest, sleep, type IAdSlotRequest } from './AdSlotRequest';
import { PausableTimer } from './PausableTimer';
import { SimulatedScteCueSource, type ICueOut } from './SimulatedScteCueSource';

const PREROLL_POLL_INTERVAL_MS = 1000;
const PREROLL_START_DELAY_MS = 500;
const MIDROLL_REFETCH_DELAY_MS = 2000;
const VOD_CUE_WINDOW_SEC = 1.5;

const playedPreRolls = new Set<string>();

interface IVmaxOptions {
  contentId: string;
  source: IVideoSource;
  config: IVmaxExtraData;
  host: IAdPlaybackHost;
  minLiveBreakSec: number;
  forcePreRoll: boolean;
}

export class VmaxAdManager implements IAdsManager {
  readonly label = 'VMAX (CSAI)';
  private disposed = false;
  private firstFrameSeen = false;
  private activeBreak: AdBreakRunner | null = null;
  private midRollPod: IAdSlotRequest[] = [];
  private cueSource: SimulatedScteCueSource | null = null;
  private intervalTimer: PausableTimer | null = null;
  private readonly firedVodCues = new Set<number>();
  private refetchHandle: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly options: IVmaxOptions) {}

  async startPreRoll(): Promise<void> {
    const { config, contentId, source, host, forcePreRoll } = this.options;
    try {
      if (!config.preRollEnabled || config.preRollVastTagIds.length === 0) return;
      const dedupe = source.timerBasedAdInterval === 0 && !forcePreRoll;
      if (dedupe && playedPreRolls.has(contentId)) return;

      track('adOpportunity', { adBreakPosition: 'preroll', adBreakDuration: config.preRollMaxDuration });
      track('preroll_loading_start', { tagCount: config.preRollVastTagIds.length });
      host.showAdLoading(true);
      const slots = this.requestPod(config.preRollVastTagIds);

      let ready = false;
      for (let poll = 0; poll < config.preRollTimeOut; poll += 1) {
        await sleep(PREROLL_POLL_INTERVAL_MS);
        if (this.disposed) return;
        if (slots.some((slot) => slot.creative)) {
          ready = true;
          break;
        }
      }
      track('preroll_loading_end', { filled: ready });
      if (!ready) {
        host.showAdLoading(false);
        return;
      }
      await sleep(PREROLL_START_DELAY_MS);
      if (this.disposed) return;
      playedPreRolls.add(contentId);
      await this.runBreak('preroll', 'NORMAL', `preroll-${contentId}`, config.preRollMaxDuration, slots);
    } catch (error) {
      console.error('Pre-roll failed', error);
    } finally {
      host.showAdLoading(false);
    }
  }

  onFirstFrame(): void {
    const { source } = this.options;
    if (this.firstFrameSeen || this.disposed) return;
    this.firstFrameSeen = true;
    if (!source.isLive) return;
    this.midRollPod = this.requestPod(this.options.config.midRollVastTagIds);
    if (source.timerBasedAdInterval > 0) {
      this.startIntervalTimer();
    } else if (source.simulatedScteCues.length > 0) {
      this.cueSource = new SimulatedScteCueSource(source.simulatedScteCues, {
        onCueOut: (cue) => this.handleCueOut(cue),
        onCueIn: (cueId) => this.handleCueIn(cueId),
      });
    }
  }

  onContentTime(currentTimeSec: number): void {
    if (this.disposed) return;
    this.cueSource?.update(currentTimeSec);
    if (!this.options.source.isLive) this.checkVodCuePoints(currentTimeSec);
  }

  onContentPlayingChange(isPlaying: boolean): void {
    if (!this.intervalTimer || this.activeBreak) return;
    if (isPlaying) this.intervalTimer.start();
    else this.intervalTimer.pause();
  }

  dispose(): void {
    this.disposed = true;
    this.activeBreak?.cancel();
    this.intervalTimer?.cancel();
    if (this.refetchHandle) clearTimeout(this.refetchHandle);
  }

  private requestPod(tags: IVastTag[]): IAdSlotRequest[] {
    const custParams = this.options.config.adTagParams.cust_params;
    return tags.map((tag) => createSlotRequest(tag.vastTagId, () => requestVmaxAd(tag, custParams)));
  }

  private async runBreak(
    position: AdBreakPosition,
    triggerType: AdBreakTriggerType,
    breakId: string,
    maxDurationSec: number,
    slots: IAdSlotRequest[],
  ): Promise<void> {
    const runner = new AdBreakRunner(this.options.host, { breakId, position, triggerType, maxDurationSec, slots });
    this.activeBreak = runner;
    try {
      await runner.run();
    } finally {
      this.activeBreak = null;
    }
  }

  private scheduleMidRollRefetch(): void {
    if (this.refetchHandle) clearTimeout(this.refetchHandle);
    this.refetchHandle = setTimeout(() => {
      if (!this.disposed) this.midRollPod = this.requestPod(this.options.config.midRollVastTagIds);
    }, MIDROLL_REFETCH_DELAY_MS);
  }

  private async handleCueOut(cue: ICueOut): Promise<void> {
    const { host, minLiveBreakSec, config } = this.options;
    const breakDuration = Math.round(cue.remainingSec);
    track('adOpportunity', { adBreakPosition: 'midroll', adBreakId: cue.cueId, adBreakDuration: breakDuration });
    const skipReason = !host.isAppActive()
      ? 'app_backgrounded'
      : breakDuration < minLiveBreakSec
        ? 'below_min_duration'
        : this.activeBreak
          ? 'break_in_progress'
          : null;
    if (skipReason) {
      track('adBreakSkipped', { adBreakId: cue.cueId, reason: skipReason });
      return;
    }
    try {
      host.setContentMuted(true);
      await this.runBreak('midroll', 'SCTE', cue.cueId, Math.min(breakDuration, config.midRollMaxDuration), this.midRollPod);
    } catch (error) {
      console.error('SCTE mid-roll failed', error);
    } finally {
      host.setContentMuted(false);
      this.scheduleMidRollRefetch();
    }
  }

  private handleCueIn(cueId: string): void {
    if (this.activeBreak?.position === 'midroll') {
      track('adBreakSkipped', { adBreakId: cueId, reason: 'cue_in_truncated_break' });
      this.activeBreak.cancel();
    }
  }

  private startIntervalTimer(): void {
    const intervalSec = this.options.source.timerBasedAdInterval;
    this.intervalTimer = new PausableTimer(intervalSec * 1000, () => {
      this.runTimerBreak();
    });
    this.intervalTimer.start();
    track('ad_timer_start', { intervalSec });
  }

  private async runTimerBreak(): Promise<void> {
    const { host, config } = this.options;
    if (this.disposed) return;
    try {
      track('adOpportunity', { adBreakPosition: 'midroll', adBreakDuration: config.midRollMaxDuration, adBreakTriggerType: 'TIMER_BASED' });
      if (!host.isAppActive()) {
        track('adBreakSkipped', { reason: 'app_backgrounded' });
      } else {
        host.pauseContent();
        await this.runBreak('midroll', 'TIMER_BASED', `timer-${Date.now()}`, config.midRollMaxDuration, this.midRollPod);
        host.resumeContent();
      }
    } catch (error) {
      console.error('Timer mid-roll failed', error);
    } finally {
      this.scheduleMidRollRefetch();
      if (!this.disposed) this.startIntervalTimer();
    }
  }

  private async checkVodCuePoints(currentTimeSec: number): Promise<void> {
    const { source, config, host } = this.options;
    const cue = source.vodMidRollCuePoints.find(
      (point) => !this.firedVodCues.has(point) && currentTimeSec >= point && currentTimeSec < point + VOD_CUE_WINDOW_SEC,
    );
    if (cue === undefined || this.activeBreak) return;
    this.firedVodCues.add(cue);
    try {
      track('adOpportunity', { adBreakPosition: 'midroll', adBreakDuration: config.midRollMaxDuration, cuePointSec: cue });
      host.pauseContent();
      const slots = this.requestPod(config.preRollVastTagIds.filter((tag) => tag.vastTagType === 'REGULAR'));
      await this.runBreak('midroll', 'NORMAL', `vod-cue-${cue}`, config.midRollMaxDuration, slots);
    } catch (error) {
      console.error('VOD mid-roll failed', error);
    } finally {
      if (!this.disposed) host.resumeContent();
    }
  }
}
