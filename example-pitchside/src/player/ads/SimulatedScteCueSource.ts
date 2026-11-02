import type { ISimulatedCue } from '../../types/content';

export interface ICueOut {
  cueId: string;
  remainingSec: number;
}

interface ICueHandlers {
  onCueOut: (cue: ICueOut) => void;
  onCueIn: (cueId: string) => void;
}

export class SimulatedScteCueSource {
  private readonly firedOut = new Set<string>();
  private readonly firedIn = new Set<string>();

  constructor(private readonly cues: ISimulatedCue[], private readonly handlers: ICueHandlers) {}

  update(currentTimeSec: number): void {
    for (const cue of this.cues) {
      const end = cue.startSec + cue.durationSec;
      if (!this.firedOut.has(cue.id) && currentTimeSec >= cue.startSec && currentTimeSec < end) {
        this.firedOut.add(cue.id);
        this.handlers.onCueOut({ cueId: cue.id, remainingSec: end - currentTimeSec });
      } else if (this.firedOut.has(cue.id) && !this.firedIn.has(cue.id) && currentTimeSec >= end) {
        this.firedIn.add(cue.id);
        this.handlers.onCueIn(cue.id);
      }
    }
  }
}
