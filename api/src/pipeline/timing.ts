/** Tiny per-stage latency instrumentation. Every pipeline stage gets timed,
 *  and the UI renders it — the "I think about 1B req/month" detail. */

export interface StageTiming {
  label: string;
  ms: number;
}

export async function timed<T>(
  label: string,
  fn: () => Promise<T>
): Promise<{ result: T; timing: StageTiming }> {
  const t0 = performance.now();
  const result = await fn();
  return { result, timing: { label, ms: Math.round((performance.now() - t0) * 10) / 10 } };
}

export class Timer {
  private stages: StageTiming[] = [];
  async run<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const { result, timing } = await timed(label, fn);
    this.stages.push(timing);
    return result;
  }
  report(): StageTiming[] {
    return this.stages;
  }
  totalMs(): number {
    return Math.round(this.stages.reduce((s, t) => s + t.ms, 0) * 10) / 10;
  }
}
