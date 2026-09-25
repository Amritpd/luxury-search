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
    <div className="rounded-[20px] border border-stone-200 bg-white/70 p-5 shadow-[0_4px_20px_rgba(27,29,26,0.04)]">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a88f5b]">
          Pipeline latency
        </h3>
        <span className="text-xs font-mono font-medium text-[#2d4039] bg-[#2d4039]/10 px-2 py-0.5 rounded-full">
          {candidates} candidates · {totalMs}ms total
        </span>
      </div>
      <div className="space-y-2.5">
        {timings.map((t) => (
          <div key={t.label} title={STAGE_HINTS[t.label] ?? t.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-stone-700 capitalize font-medium">{t.label}</span>
              <span className="font-mono text-[#2d4039] font-semibold">{t.ms}ms</span>
            </div>
            <div className="h-1.5 rounded-full bg-stone-200/80 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-[#a88f5b] to-[#2d4039] transition-all duration-500"
                style={{ width: `${Math.max(6, (t.ms / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] leading-relaxed text-stone-500 border-t border-stone-200/60 pt-2.5">
        At 1B req/month this pipeline leverages parsed-intent caching, precomputed
        embeddings, and an SLM parser to minimize latency &amp; token spend.
      </p>
    </div>
  );
}
