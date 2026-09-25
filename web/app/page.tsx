"use client";

import { useMemo, useState } from "react";
import LatencyPanel, { StageTiming } from "../components/LatencyPanel";
import PipelineView, { Intent } from "../components/PipelineView";
import ListingCard, { Listing } from "../components/ListingCard";
import ArchitectureDoc from "../components/ArchitectureDoc";
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
  const [mainView, setMainView] = useState<"search" | "architecture">("search");
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
        {/* Main Brand Header */}
        <header className="mb-6 border-b border-stone-200/80 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-[#a88f5b] font-bold">
                Groundtruth · AI Discovery Platform
              </p>
              <h1 className="mt-1 text-4xl font-medium leading-[0.9] text-stone-900 md:text-6xl">
                Describe the home.
                <br />
                <span className="text-[#2d4039]">We’ll do the searching.</span>
              </h1>
            </div>
            <div className="flex flex-col sm:items-end gap-1">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#2d4039] bg-[#2d4039]/10 px-3 py-1 rounded-full border border-[#2d4039]/20">
                Maps &amp; Search Prototype
              </span>
              <span className="text-[11px] text-stone-500 font-mono">
                1B req/mo target architecture
              </span>
            </div>
          </div>

          {/* Top-Level Navigation Switcher */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setMainView("search")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                mainView === "search"
                  ? "bg-[#2d4039] text-[#f7f3ee] shadow-sm ring-2 ring-[#2d4039]/20"
                  : "border border-stone-200 bg-white/70 text-stone-700 hover:border-[#a88f5b] hover:bg-[#a88f5b]/10 hover:text-stone-900"
              }`}
            >
              <span>🔍</span>
              <span>Live Discovery Engine</span>
            </button>

            <button
              onClick={() => setMainView("architecture")}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                mainView === "architecture"
                  ? "bg-[#2d4039] text-[#f7f3ee] shadow-sm ring-2 ring-[#2d4039]/20"
                  : "border border-stone-200 bg-white/70 text-stone-700 hover:border-[#a88f5b] hover:bg-[#a88f5b]/10 hover:text-stone-900"
              }`}
            >
              <span>📐</span>
              <span>Systems Architecture &amp; IE Framing</span>
              <span className="rounded-full bg-[#a88f5b]/20 px-2 py-0.5 text-[10px] font-bold text-[#a88f5b]">
                Deep Dive
              </span>
            </button>
          </div>
        </header>

        {/* TAB 1: SEARCH DISCOVERY ENGINE */}
        {mainView === "search" && (
          <div>
            <p className="max-w-3xl text-sm leading-relaxed text-stone-700">
              Natural language in — an LLM parses intent, OpenSearch runs hybrid
              BM25 + vector retrieval, reciprocal-rank fusion merges the rankings,
              and an LLM reranks the top candidates. Built with the same stack
              choices as a production discovery team.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
              className="mt-6 flex flex-col gap-3 md:flex-row"
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

            {results.length > 0 && intent && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88f5b]">Search Results</p>
                    <h2 className="mt-0.5 text-2xl font-semibold text-stone-900">
                      AI Ranked Candidates ({results.length})
                    </h2>
                  </div>
                  <span className="text-xs font-medium text-stone-500">
                    Sorted by multimodal intent &amp; LLM rationale
                  </span>
                </div>
                <div className="grid gap-4">
                  {results.map((listing, i) => (
                    <ListingCard key={listing.id} listing={listing} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 overflow-hidden rounded-[24px] border border-stone-200 bg-white/50 shadow-[0_14px_40px_rgba(27,29,26,0.06)]">
              <div className="flex items-center justify-between border-b border-stone-200 bg-white/50 px-5 py-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#a88f5b]">Full Inventory</p>
                  <h2 className="mt-1 text-2xl font-semibold text-stone-900">Synthetic dataset</h2>
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
          </div>
        )}

        {/* TAB 2: SYSTEMS ARCHITECTURE & IE FRAMING */}
        {mainView === "architecture" && (
          <div>
            <ArchitectureDoc />
          </div>
        )}

        <footer className="mt-16 border-t border-stone-200 pt-6 text-xs leading-relaxed text-stone-600">
          <p>
            Demo dataset: 5,000 synthetic listings across Austin, Denver, and
            Phoenix. Every pipeline stage is swappable — see the Architecture
            tab for how this evolves from off-the-shelf models to domain-trained
            joint embeddings.
          </p>
        </footer>
      </div>
    </main>
  );
}
