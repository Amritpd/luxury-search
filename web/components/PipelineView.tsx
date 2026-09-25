export interface Intent {
  filters: Record<string, string | number | string[] | undefined>;
  school_rating_min?: number;
  walk_score_min?: number;
  semantic: string;
  sort?: string;
}

export default function PipelineView({ intent }: { intent: Intent }) {
  const activeFilters = Object.entries(intent.filters ?? {}).filter(
    ([, v]) => v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
  );
  if (intent.school_rating_min)
    activeFilters.push(["school_rating_min", intent.school_rating_min]);
  if (intent.walk_score_min)
    activeFilters.push(["walk_score_min", intent.walk_score_min]);

  return (
    <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/30 p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-emerald-300">
        What the AI understood
      </h3>
      <div className="mb-3 flex flex-wrap gap-2">
        {activeFilters.length === 0 && (
          <span className="text-xs text-emerald-500">no hard filters — pure semantic search</span>
        )}
        {activeFilters.map(([k, v]) => (
          <span
            key={k}
            className="rounded-full bg-emerald-900/60 px-3 py-1 font-mono text-xs text-emerald-200"
          >
            {k}: {Array.isArray(v) ? v.join(", ") : String(v)}
          </span>
        ))}
      </div>
      <p className="text-xs italic leading-relaxed text-emerald-100/70">
        “{intent.semantic}”
      </p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-emerald-500">
        <span>NL query</span>
        <span aria-hidden>→</span>
        <span>structured intent</span>
        <span aria-hidden>→</span>
        <span>hybrid BM25 + k-NN</span>
        <span aria-hidden>→</span>
        <span>RRF fusion</span>
        <span aria-hidden>→</span>
        <span>LLM rerank</span>
      </div>
    </div>
  );
}
