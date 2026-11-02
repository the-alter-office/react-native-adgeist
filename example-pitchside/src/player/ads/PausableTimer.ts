export class PausableTimer {
  private remainingMs: number;
  private startedAt: number | null = null;
  private handle: ReturnType<typeof setTimeout> | null = null;

  constructor(durationMs: number, private readonly onFire: () => void) {
    this.remainingMs = durationMs;
  }

  start(): void {
    if (this.handle !== null || this.remainingMs <= 0) return;
    this.startedAt = Date.now();
    this.handle = setTimeout(() => {
      this.handle = null;
      this.startedAt = null;
      this.remainingMs = 0;
      this.onFire();
    }, this.remainingMs);
  }

  pause(): void {
    if (this.handle === null || this.startedAt === null) return;
    clearTimeout(this.handle);
    this.handle = null;
    this.remainingMs -= Date.now() - this.startedAt;
    this.startedAt = null;
  }

  cancel(): void {
    if (this.handle !== null) clearTimeout(this.handle);
    this.handle = null;
    this.startedAt = null;
  }
}
