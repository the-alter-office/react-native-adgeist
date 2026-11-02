import type { IAdsManager } from '../../types/ads';

export class NoopAdsManager implements IAdsManager {
  constructor(readonly label: string) {}
  async startPreRoll(): Promise<void> {}
  onFirstFrame(): void {}
  onContentTime(): void {}
  onContentPlayingChange(): void {}
  dispose(): void {}
}
