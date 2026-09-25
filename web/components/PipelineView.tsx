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
    <div className="rounded-[20px] border border-stone-200 bg-white/70 p-5 shadow-[0_4px_20px_rgba(27,29,26,0.04)]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a88f5b]">
          What the AI understood
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#2d4039] bg-[#2d4039]/10 px-2 py-0.5 rounded-full">
          Intent Parsed
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {activeFilters.length === 0 && (
          <span className="text-xs text-stone-500 italic">no hard constraints — full semantic vector match</span>
        )}
        {activeFilters.map(([k, v]) => (
          <span
            key={k}
            className="rounded-md border border-[#2d4039]/15 bg-[#2d4039]/5 px-2.5 py-1 font-mono text-xs font-medium text-[#2d4039]"
          >
            {k}: <span className="font-semibold">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
          </span>
        ))}
      </div>
      <p className="text-xs italic leading-relaxed text-stone-700 bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/60">
        “{intent.semantic}”
      </p>
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">
        <span className="text-stone-700">NL query</span>
        <span aria-hidden className="text-[#a88f5b]">→</span>
        <span className="text-stone-700">structured intent</span>
        <span aria-hidden className="text-[#a88f5b]">→</span>
        <span className="text-stone-700">hybrid BM25 + k-NN</span>
        <span aria-hidden className="text-[#a88f5b]">→</span>
        <span className="text-stone-700">RRF fusion</span>
        <span aria-hidden className="text-[#a88f5b]">→</span>
        <span className="text-[#2d4039] font-semibold">LLM rerank</span>
      </div>
    </div>
  );
}
