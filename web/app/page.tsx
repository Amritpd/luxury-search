"use client";

import { useMemo, useState } from "react";
import LatencyPanel, { StageTiming } from "../components/LatencyPanel";
import PipelineView, { Intent } from "../components/PipelineView";
import ListingCard, { Listing } from "../components/ListingCard";
import FALLBACK_LISTINGS from "../../data/listings.json";

// Same-origin by default: next.config.js proxies /api/* to the API server,
// so the browser never calls it cross-origin (no CORS, no port-forwarding config).
// Set NEXT_PUBLIC_API_URL only to point the browser at the API directly.
const API = process.env.NEXT_PUBLIC_API_URL ?? "";

const EXAMPLES = [
  "3-bed under $1.2M near top-rated schools",
  "walkable condo downtown under $800k",
  "family home with a pool in Arcadia",
  "modern farmhouse with a home office under $900k",
];

const DEFAULT_RESULTS: Listing[] = (FALLBACK_LISTINGS as unknown as Listing[]).slice(0, 12);

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [results, setResults] = useState<Listing[]>(DEFAULT_RESULTS);
  const [timings, setTimings] = useState<StageTiming[]>([]);
  const [totalMs, setTotalMs] = useState(0);
  const [candidates, setCandidates] = useState(0);

  const totalSyntheticCount = FALLBACK_LISTINGS.length;
  const tableRows = useMemo(() => (results.length > 0 ? results : DEFAULT_RESULTS), [results]);

  async function runSearch(q: string) {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setIntent(data.intent ?? { filters: {}, semantic: text });
        setResults((data.results ?? DEFAULT_RESULTS) as Listing[]);
        setError(data.warning ?? "Using the synthetic dataset fallback.");
        setTimings(data.timings ?? []);
        setTotalMs(data.total_ms ?? 0);
        setCandidates(data.candidates_considered ?? DEFAULT_RESULTS.length);
        return;
      }
      setIntent(data.intent ?? null);
      setResults((data.results ?? DEFAULT_RESULTS) as Listing[]);
      setTimings(data.timings ?? []);
      setTotalMs(data.total_ms ?? 0);
      setCandidates(data.candidates_considered ?? DEFAULT_RESULTS.length);
      if (data.warning) setError(data.warning);
    } catch (e) {
      setIntent({ filters: {}, semantic: text });
      setResults(DEFAULT_RESULTS);
      setError("The AI pipeline is temporarily unavailable — showing the synthetic dataset instead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-stone-900">
      <div className="rounded-[32px] border border-stone-200 bg-white/60 p-6 shadow-[0_20px_60px_rgba(27,29,26,0.08)] backdrop-blur-sm md:p-8">
        <header className="mb-8">
          <p className="mb-2 font-sans text-[11px] uppercase tracking-[0.28em] text-[#a88f5b]">
            Groundtruth · AI-powered discovery demo
          </p>
          <h1 className="text-5xl font-medium leading-[0.9] md:text-7xl">
            Describe the home.
            <br />
            <span className="text-[#2d4039]">We’ll do the searching.</span>
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-stone-700">
            Natural language in — an LLM parses intent, OpenSearch runs hybrid
            BM25 + vector retrieval, reciprocal-rank fusion merges the rankings,
            and an LLM reranks the top candidates. Built with the same stack
            choices as a production discovery team.
          </p>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            runSearch(query);
          }}
          className="flex flex-col gap-3 md:flex-row"
        >
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Try: "3-bed under $1.2M near top-rated schools"'
            className="flex-1 rounded-full border border-stone-200 bg-white/80 px-5 py-3.5 text-sm text-stone-900 shadow-sm outline-none placeholder:text-stone-500 focus:border-[#a88f5b] focus:ring-2 focus:ring-[#a88f5b]/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#2d4039] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#f7f3ee] transition hover:bg-[#24382f] disabled:opacity-60"
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => {
                setQuery(ex);
                runSearch(ex);
              }}
              className="rounded-full border border-stone-200 bg-white/40 px-3 py-1.5 text-[11px] uppercase tracking-[0.14em] text-stone-700 transition hover:border-[#a88f5b] hover:bg-[#a88f5b]/10 hover:text-stone-900"
            >
              {ex}
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-6 rounded-2xl border border-stone-300 bg-[#f2eae1] p-4 text-sm text-stone-900">
            {error}
          </p>
        )}

        {intent && (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <PipelineView intent={intent} />
            <LatencyPanel timings={timings} totalMs={totalMs} candidates={candidates} />
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-[24px] border border-stone-200 bg-white/50 shadow-[0_14px_40px_rgba(27,29,26,0.06)]">
          <div className="flex items-center justify-between border-b border-stone-200 bg-white/50 px-5 py-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88f5b]">Synthetic dataset</p>
              <h2 className="mt-1 text-2xl font-semibold text-stone-900">Available listings</h2>
            </div>
            <div className="rounded-full border border-[#2d4039]/20 bg-[#2d4039]/10 px-3 py-1.5 text-sm font-medium text-[#2d4039]">
              {totalSyntheticCount.toLocaleString()} total
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-stone-800">
              <thead className="bg-stone-100/80 text-[10px] uppercase tracking-[0.16em] text-stone-600">
                <tr>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Beds</th>
                  <th className="px-4 py-3">Baths</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Walk</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((listing) => (
                  <tr key={listing.id} className="border-t border-stone-200 hover:bg-[#a88f5b]/5">
                    <td className="px-4 py-3">
                      <div className="font-medium text-stone-900">{listing.address}</div>
                      <div className="text-xs text-stone-600">{listing.neighborhood}</div>
                    </td>
                    <td className="px-4 py-3">{listing.city}</td>
                    <td className="px-4 py-3">{listing.beds}</td>
                    <td className="px-4 py-3">{listing.baths}</td>
                    <td className="px-4 py-3 font-semibold text-[#2d4039]">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{listing.school_rating}/10</td>
                    <td className="px-4 py-3">{listing.walk_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {intent && results.length === 0 && !loading && (
          <p className="mt-8 text-sm text-stone-600">
            No listings matched those filters — try broadening the price or bed count.
          </p>
        )}

        <footer className="mt-16 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-600">
          <p>
            Demo dataset: 5,000 synthetic listings across Austin, Denver, and
            Phoenix. Every pipeline stage is swappable — see the README roadmap
            for how this evolves from off-the-shelf models to domain-trained
            joint embeddings.
          </p>
        </footer>
      </div>
    </main>
  );
}
