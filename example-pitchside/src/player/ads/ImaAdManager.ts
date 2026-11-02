import { requestImaVast } from '../../api/mock/adServer';
import { track } from '../../analytics/eventBus';
import type { IImaExtraData } from '../../types/content';
import type { IAdPlaybackHost, IAdsManager } from '../../types/ads';
import { AdBreakRunner } from './AdBreakRunner';
import { createSlotRequest } from './AdSlotRequest';

const VAST_LOAD_TIMEOUT_MS = 2000;
const BREAK_HEADROOM_SEC = 5;

export class ImaAdManager implements IAdsManager {
  readonly label = 'IMA (CSAI)';
  private activeBreak: AdBreakRunner | null = null;
  private disposed = false;

  constructor(private readonly contentId: string, private readonly config: IImaExtraData, private readonly host: IAdPlaybackHost) {}

  async startPreRoll(): Promise<void> {
    try {
      this.host.showAdLoading(true);
      track('adOpportunity', { adBreakPosition: 'preroll', adBreakDuration: 15 });
      const url = `${this.config.adTagUrl}&${this.config.queryParams}`;
      const slot = createSlotRequest(url, () => requestImaVast(url, VAST_LOAD_TIMEOUT_MS));
      const creative = await slot.promise;
      track('CSAILoaded', { filled: Boolean(creative) });
      if (!creative || this.disposed) return;
      this.activeBreak = new AdBreakRunner(this.host, {
        breakId: `ima-preroll-${this.contentId}`,
        position: 'preroll',
        triggerType: 'NORMAL',
        maxDurationSec: creative.durationSec + BREAK_HEADROOM_SEC,
        slots: [slot],
      });
      await this.activeBreak.run();
    } catch (error) {
      console.error('IMA pre-roll failed', error);
    } finally {
      this.activeBreak = null;
      this.host.showAdLoading(false);
    }
  }

  onFirstFrame(): void {}
  onContentTime(): void {}
  onContentPlayingChange(): void {}

  dispose(): void {
    this.disposed = true;
    this.activeBreak?.cancel();
  }
}
