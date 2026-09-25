export interface StageTiming {
  label: string;
  ms: number;
}

const STAGE_HINTS: Record<string, string> = {
  "parse intent": "LLM translates the query into structured filters + semantic intent",
  "embed query": "query embedded for vector search",
  "bm25 retrieve": "keyword retrieval over 5k listings",
  "knn retrieve": "vector retrieval over listing embeddings",
  "llm rerank": "LLM orders the top candidates + explains each pick",
};

export default function LatencyPanel({
  timings,
  totalMs,
  candidates,
}: {
  timings: StageTiming[];
  totalMs: number;
  candidates: number;
}) {
  const max = Math.max(...timings.map((t) => t.ms), 1);
  return (
    <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
          Pipeline latency
        </h3>
        <span className="text-xs text-emerald-500">
          {candidates} candidates fused · {totalMs}ms total
        </span>
      </div>
      <div className="space-y-2">
        {timings.map((t) => (
          <div key={t.label} title={STAGE_HINTS[t.label] ?? t.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-emerald-100/80">{t.label}</span>
              <span className="font-mono text-emerald-300">{t.ms}ms</span>
            </div>
            <div className="h-1.5 rounded bg-emerald-950">
              <div
                className="h-1.5 rounded bg-emerald-400/80"
                style={{ width: `${Math.max(4, (t.ms / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-emerald-500/80">
        At 1B req/month this pipeline would need parsed-intent caching, precomputed
        embeddings (already cached at index time), and a fine-tuned small model
        replacing the frontier LLM — see README roadmap.
      </p>
    </div>
  );
}
