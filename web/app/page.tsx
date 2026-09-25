"use client";

import { useState } from "react";
import LatencyPanel, { StageTiming } from "../components/LatencyPanel";
import PipelineView, { Intent } from "../components/PipelineView";
import ListingCard, { Listing } from "../components/ListingCard";

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

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [results, setResults] = useState<Listing[]>([]);
  const [timings, setTimings] = useState<StageTiming[]>([]);
  const [totalMs, setTotalMs] = useState(0);
  const [candidates, setCandidates] = useState(0);

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
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setIntent(data.intent);
      setResults(data.results ?? []);
      setTimings(data.timings ?? []);
      setTotalMs(data.total_ms ?? 0);
      setCandidates(data.candidates_considered ?? 0);
    } catch (e) {
      setError("Search failed — is the API running? (npm run dev in /api)");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-emerald-500">
          Groundtruth · AI-powered discovery demo
        </p>
        <h1 className="text-4xl font-bold leading-tight">
          Describe the home.
          <br />
          <span className="text-emerald-300">We’ll do the searching.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">
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
        className="flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try: "3-bed under $1.2M near top-rated schools"'
          className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-emerald-400/60"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => {
              setQuery(ex);
              runSearch(ex);
            }}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 hover:border-emerald-400/50 hover:text-emerald-200"
          >
            {ex}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl border border-red-500/40 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      {intent && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <PipelineView intent={intent} />
          <LatencyPanel timings={timings} totalMs={totalMs} candidates={candidates} />
        </div>
      )}

      <div className="mt-8 space-y-4">
        {results.map((l, i) => (
          <ListingCard key={l.id} listing={l} rank={i + 1} />
        ))}
      </div>

      {intent && results.length === 0 && !loading && (
        <p className="mt-8 text-sm text-white/50">
          No listings matched those filters — try broadening the price or bed count.
        </p>
      )}

      <footer className="mt-16 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/40">
        <p>
          Demo dataset: 5,000 synthetic listings across Austin, Denver, and
          Phoenix. Every pipeline stage is swappable — see the README roadmap
          for how this evolves from off-the-shelf models to domain-trained
          joint embeddings.
        </p>
      </footer>
    </main>
  );
}
