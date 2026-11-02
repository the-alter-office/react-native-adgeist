import { track } from '../../analytics/eventBus';
import type { AdBreakPosition, AdBreakTriggerType, IAdPlaybackHost } from '../../types/ads';
import type { IAdSlotRequest } from './AdSlotRequest';
import { PausableTimer } from './PausableTimer';

export interface IAdBreakOptions {
  breakId: string;
  position: AdBreakPosition;
  triggerType: AdBreakTriggerType;
  maxDurationSec: number;
  slots: IAdSlotRequest[];
}

export interface IAdBreakResult {
  adCount: number;
  filledSec: number;
  endReason: 'pod_exhausted' | 'timer_expired' | 'cancelled';
}

export class AdBreakRunner {
  private stopped: 'timer_expired' | 'cancelled' | null = null;
  private resolveStop: () => void = () => undefined;
  private readonly stopSignal: Promise<null>;
  private readonly timer: PausableTimer;

  constructor(private readonly host: IAdPlaybackHost, private readonly options: IAdBreakOptions) {
    this.stopSignal = new Promise<null>((resolve) => {
      this.resolveStop = () => resolve(null);
    });
    this.timer = new PausableTimer(options.maxDurationSec * 1000, () => this.stop('timer_expired'));
  }

  get position(): AdBreakPosition {
    return this.options.position;
  }

  cancel(): void {
    this.stop('cancelled');
  }

  async run(): Promise<IAdBreakResult> {
    const { breakId, position, triggerType, maxDurationSec, slots } = this.options;
    let adCount = 0;
    let filledMs = 0;
    try {
      track('adBreakStarted', { adBreakId: breakId, adBreakPosition: position, adBreakTriggerType: triggerType, maxDurationSec });
      this.timer.start();
      for (const [slotIndex, slot] of slots.entries()) {
        if (this.stopped) break;
        const creative = slot.settled ? slot.creative : await Promise.race([slot.promise, this.stopSignal]);
        if (this.stopped) break;
        if (!creative) {
          track('onAdError', { adBreakId: breakId, tagId: slot.tagId, reason: 'no_fill' });
          continue;
        }
        const remaining = slots.slice(slotIndex + 1).filter((candidate) => !candidate.settled || candidate.creative).length;
        const startedAt = Date.now();
        track('adStarted', { adBreakId: breakId, adId: creative.adId, creativeId: creative.creativeId, firstAdSystem: creative.adSystem, advertiser: creative.advertiser, isBumper: creative.isBumper });
        const outcome = await this.host.playAd(creative, { breakId, breakPosition: position, index: adCount + 1, total: adCount + 1 + remaining });
        if (outcome !== 'error') {
          filledMs += Date.now() - startedAt;
          adCount += 1;
        }
        if (outcome === 'completed') track('adEnded', { adBreakId: breakId, adId: creative.adId });
        if (outcome === 'skipped') track('adSkipped', { adBreakId: breakId, adId: creative.adId });
        if (outcome === 'error') track('onAdError', { adBreakId: breakId, adId: creative.adId, reason: 'media_error_or_timeout' });
      }
    } catch (error) {
      console.error('Ad break failed', breakId, error);
    } finally {
      this.timer.cancel();
    }
    const filledSec = Math.round(filledMs / 100) / 10;
    const endReason = this.stopped ?? 'pod_exhausted';
    track('adBreakEnded', { adBreakId: breakId, adBreakPosition: position, adCount, filledSec, endReason });
    return { adCount, filledSec, endReason };
  }

  private stop(reason: 'timer_expired' | 'cancelled'): void {
    if (this.stopped) return;
    this.stopped = reason;
    this.resolveStop();
    this.host.stopAd();
  }
}
