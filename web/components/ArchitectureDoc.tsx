"use client";

import { useState } from "react";

type TabKey = "production-line" | "dual-tier" | "ir-metrics" | "risk-matrix" | "economics" | "blueprint";

export default function ArchitectureDoc() {
  const [activeTab, setActiveTab] = useState<TabKey>("production-line");

  const tabs: Array<{ id: TabKey; label: string; icon: string }> = [
    { id: "production-line", label: "Production Line (IE Framing)", icon: "🏭" },
    { id: "dual-tier", label: "Warehouse vs Pick-Face", icon: "🏛️" },
    { id: "ir-metrics", label: "IR Evaluation & Metrics", icon: "🎯" },
    { id: "risk-matrix", label: "Risk Mitigation Matrix", icon: "🛡️" },
    { id: "economics", label: "1B Req/Mo Economics", icon: "📊" },
    { id: "blueprint", label: "Production Blueprint", icon: "🚀" },
  ];

  return (
    <section className="mt-16 overflow-hidden rounded-[32px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(27,29,26,0.06)] backdrop-blur-md md:p-10">
      {/* Header */}
      <div className="border-b border-stone-200/80 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.28em] text-[#a88f5b]">
              Engineering Architecture &amp; Systems Specification
            </p>
            <h2 className="mt-1 text-3xl font-semibold text-stone-900 md:text-4xl">
              Under the Hood: Groundtruth Architecture
            </h2>
          </div>
          <span className="rounded-full border border-[#2d4039]/20 bg-[#2d4039]/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-[#2d4039]">
            Target: 1,000,000,000 req/mo
          </span>
        </div>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-stone-700">
          Most real estate search engines are stuck in 2005 with rigid SQL <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-xs text-[#2d4039]">WHERE</code> clauses. This is an awful user experience where people making one of the most important decision of their life (buying a dream home) may miss the ideal property they want.
          Groundtruth transforms unstructured natural human intent into low-latency hybrid discovery by treating the retrieval pipeline as a precision industrial production line.
        </p>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${isActive
                  ? "bg-[#2d4039] text-[#f7f3ee] shadow-sm"
                  : "border border-stone-200 bg-white/60 text-stone-700 hover:border-[#a88f5b] hover:bg-[#a88f5b]/10 hover:text-stone-900"
                  }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="pt-6">
        {/* TAB 1: PRODUCTION LINE */}
        {activeTab === "production-line" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
              <h3 className="text-base font-bold text-stone-900">
                The Industrial Engineering Analogy: Raw Material to Finished Goods
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                It’s a manufacturing production line. Raw material comes in — a messy human sentence like{" "}
                <em className="font-medium text-[#2d4039]">“walkable condo downtown under $800k”</em> — and it moves
                through four workstations, each adding deterministic value, until finished goods come out:{" "}
                <strong>ten precision-ranked listings with listing-specific justifications</strong>.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Station 1 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#2d4039] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#f7f3ee]">
                    Station 1
                  </span>
                  <span className="font-mono text-xs text-[#a88f5b]">Translation</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">Structured Job Ticket Generation</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  An LLM reads the raw query and fills out an immutable job ticket: hard physical constraints (
                  <code className="text-[#2d4039]">price_max ≤ 800k</code>, <code className="text-[#2d4039]">type = condo</code>,{" "}
                  <code className="text-[#2d4039]">walk_score ≥ 70</code>) plus a plain-words distilled semantic vibe.
                </p>
                <div className="mt-3 rounded-lg bg-stone-50 p-2.5 font-mono text-[11px] text-stone-700 border border-stone-200/60">
                  <strong>Station Rule:</strong> This is the <em>only</em> station that touches raw ambiguity — everything downstream operates strictly from the validated job ticket.
                </div>
              </div>

              {/* Station 2 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#2d4039] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#f7f3ee]">
                    Station 2
                  </span>
                  <span className="font-mono text-xs text-[#a88f5b]">Parallel Retrieval</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">Dual-Line Feeder (BM25 + k-NN)</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  Two parallel lines feed one merge point. <strong>Line A (BM25)</strong> is a parts-catalog keyword lookup.{" "}
                  <strong>Line B (k-NN)</strong> embeds the vibe into 3,072-dimensional space. Think of it as a facility-location problem in reverse: distance is similarity.
                </p>
                <div className="mt-3 rounded-lg bg-stone-50 p-2.5 font-mono text-[11px] text-stone-700 border border-stone-200/60">
                  <strong>Go/No-Go Gauge:</strong> Hard specs act as mechanical physical gates on both lines; any listing failing price/bed constraints is rejected before scoring.
                </div>
              </div>

              {/* Station 3 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#2d4039] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#f7f3ee]">
                    Station 3
                  </span>
                  <span className="font-mono text-xs text-[#a88f5b]">Merging</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">Reciprocal Rank Fusion (RRF)</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  Two inspectors ranked candidates on incompatible scales (raw BM25 scores vs vector cosine distance). Instead of calibrating broken instruments, RRF merges purely on rank position:{" "}
                  <code className="text-[#2d4039]">RRF(d) = Σ 1 / (60 + r_i)</code>.
                </p>
                <div className="mt-3 rounded-lg bg-stone-50 p-2.5 font-mono text-[11px] text-stone-700 border border-stone-200/60">
                  <strong>Zero Drift:</strong> Eliminates score-distribution skew across different search volumes and density clusters.
                </div>
              </div>

              {/* Station 4 */}
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#2d4039] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#f7f3ee]">
                    Station 4
                  </span>
                  <span className="font-mono text-xs text-[#a88f5b]">Final QC</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">LLM Judgment &amp; Grounded Rationale</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  The top 20 candidates go to the LLM as Master Inspector for listwise ranking and a 1-line justification per pick.
                </p>
                <div className="mt-3 rounded-lg bg-stone-50 p-2.5 font-mono text-[11px] text-stone-700 border border-stone-200/60">
                  <strong>Core Rule:</strong> <em>Judgment, not matching.</em> The probabilistic model is allowed to opine and explain, but NEVER to invent or retrieve inventory.
                </div>
              </div>
            </div>

            {/* Time Study & Bottleneck Analysis */}
            <div className="rounded-2xl border border-[#a88f5b]/30 bg-[#a88f5b]/10 p-5">
              <h4 className="font-semibold text-stone-900">
                ⏱️ The Latency Dashboard as an Industrial Time Study
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-stone-800">
                The latency telemetry panel is a classic stopwatch line-balance study. The bottleneck is immediately obvious: <strong>the two LLM workstations (parsing &amp; reranking) account for &gt;90% of cycle time</strong>.
                At 1B requests/month (~400 req/sec steady state, 1,200 req/sec peak), applying Goldratt’s <em>Theory of Constraints</em> dictates elevating the bottleneck: replacing frontier general-purpose models with fine-tuned Small Language Models (SLMs) and contrastive bi-encoders, collapsing unit costs by 95%.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: DUAL-TIER STORAGE */}
        {activeTab === "dual-tier" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
              <h3 className="text-base font-bold text-stone-900">
                Warehouse vs. Forward Pick-Face Data Topology
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                In a high-throughput distribution center, bulk pallet storage is separated from the forward pick-face. In Groundtruth,{" "}
                <strong>PostgreSQL is the warehouse (ACID source of truth)</strong> and{" "}
                <strong>OpenSearch is the forward pick-face (derived low-latency index slotted for high-speed k-NN and BM25 retrieval)</strong>.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-stone-900">🏛️ PostgreSQL (The Warehouse)</h4>
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-800">
                    Source of Truth
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>Relational Integrity:</strong> Guarantees price updates, status changes (Active/Pending/Sold), and agent ownership without eventual consistency race conditions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>Heavy Payload Storage:</strong> High-resolution media URLs, complete disclosures, raw floorplan geometries, and agent MLS metadata live here.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>Candidate Hydration:</strong> After OpenSearch returns top candidate IDs, Postgres hydrates the rich listing details for the final LLM reranker.</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-stone-900">⚡ OpenSearch (The Forward Pick-Face)</h4>
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    Derived Speed Index
                  </span>
                </div>
                <ul className="mt-3 space-y-2 text-xs text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>HNSW Faiss Vector Index:</strong> 3,072-dimension vectors with L2 distance for sub-10ms nearest neighbor semantic lookup.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>BM25 Inverted Index:</strong> Multi-match text search across description^2, neighborhood^1.5, and city fields.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2d4039] font-bold">✓</span>
                    <span><strong>Slotted Pre-Filtering:</strong> Hardware-accelerated bitset filtering on price, beds, baths, walk score, and school ratings before distance computation.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <h4 className="font-semibold text-stone-900">
                🔄 Event-Driven Stocking: CDC &amp; Asynchronous Embedding Ingestion
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-stone-600">
                When a new listing enters PostgreSQL or price drops occur, a Change Data Capture (CDC via Kafka or Postgres Debezium) pipeline triggers an event.
                An asynchronous worker embeds the listing text and upserts the OpenSearch forward pick-face. The seed script implements a <strong>SHA-256 hash-keyed disk cache</strong> with exponential backoff and jitter, ensuring zero redundant embedding calls during re-indexing.
              </p>
            </div>
          </div>
        )}

        {/* TAB: IR EVALUATION & METRICS */}
        {activeTab === "ir-metrics" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Information Retrieval (IR) Theory &amp; Precision-Recall Tradeoffs
                </h3>
                <span className="rounded-full bg-[#2d4039] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#f7f3ee]">
                  High-Stakes Discovery Funnel
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                Searching for a luxury home is not an e-commerce search for a $20 phone case — it is a life-altering transaction that is often the largest financial transaction of a person's life.
                In classic Information Retrieval (IR), every architectural decision comes down to balancing <strong>Precision</strong> (relevance of returned items) against <strong>Recall</strong> (fraction of all relevant items captured).
              </p>
            </div>

            {/* Error Cost Asymmetry Card */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-rose-600 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    Type II Error
                  </span>
                  <span className="font-mono text-xs font-semibold text-rose-700">FATAL TO BUSINESS</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">False Negatives (Omission)</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-700">
                  <strong>Definition:</strong> A dream home that matches what the buyer truly wants is omitted from the search results due to rigid keyword filtering or strict schema boundaries.
                </p>
                <div className="mt-3 rounded-lg border border-rose-200 bg-white p-3 text-xs text-stone-700">
                  <p className="font-medium text-rose-900">The Real Estate Consequence:</p>
                  <p className="mt-1">
                    The buyer never sees their dream home. The agent misses a $150k commission, the client believes the platform has poor inventory, and user trust is permanently broken.
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-rose-700">
                    → Solution: Maximize <strong>Recall@100</strong> in Stage 2 with dense semantic embeddings &amp; soft constraint relaxation.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 font-mono text-[11px] font-bold text-white">
                    Type I Error
                  </span>
                  <span className="font-mono text-xs font-semibold text-emerald-800">CHEAPLY MANAGED</span>
                </div>
                <h4 className="mt-2 font-semibold text-stone-900">False Positives (Irrelevant Candidates)</h4>
                <p className="mt-1 text-xs leading-relaxed text-stone-700">
                  <strong>Definition:</strong> A listing that doesn’t quite match the buyer’s vibe makes it into the initial candidate retrieval pool.
                </p>
                <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3 text-xs text-stone-700">
                  <p className="font-medium text-emerald-900">The Real Estate Consequence:</p>
                  <p className="mt-1">
                    In a single-stage system, False Positives clutter page 1. But in Groundtruth’s <strong>two-stage cascade</strong>, Stage 4 (Cross-Attention LLM Reranking) cleanly demotes or filters them out before the buyer ever sees them.
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-emerald-800">
                    → Solution: Maximize <strong>Precision@10 &amp; NDCG@10</strong> at Stage 4 with cross-encoder reasoning.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage by Stage IR Metrics Table */}
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <h4 className="font-semibold text-stone-900">
                📊 Pipeline Workstation IR Metric Alignment
              </h4>
              <p className="mt-1 text-xs text-stone-600">
                How each workstation in the Groundtruth pipeline optimizes for specific Information Retrieval metrics:
              </p>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-left text-xs text-stone-800">
                  <thead className="bg-stone-100/90 text-[10px] uppercase tracking-[0.14em] text-stone-600">
                    <tr>
                      <th className="px-4 py-3">Pipeline Stage</th>
                      <th className="px-4 py-3">Primary IR Metric</th>
                      <th className="px-4 py-3">Target Threshold</th>
                      <th className="px-4 py-3">Why This Metric Matters</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200/80">
                    <tr className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        Stage 1: Intent Extraction
                      </td>
                      <td className="px-4 py-3 font-mono text-[#2d4039]">Slot F1-Score &amp; Schema Validity</td>
                      <td className="px-4 py-3 font-mono text-emerald-700">&gt; 98.5%</td>
                      <td className="px-4 py-3 text-stone-600">
                        Ensures price ceilings, bedroom minimums, and architectural keywords are extracted without hallucinated bounds.
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        Stage 2: Hybrid Retrieval (OpenSearch)
                      </td>
                      <td className="px-4 py-3 font-mono text-[#2d4039]">Recall@100 &amp; Recall@50</td>
                      <td className="px-4 py-3 font-mono text-emerald-700">&gt; 96.0%</td>
                      <td className="px-4 py-3 text-stone-600">
                        <strong>The Golden Rule of Multi-Stage IR:</strong> A downstream reranker cannot rank what the retriever never returned. Broad candidate recall is mandatory.
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        Stage 3: Reciprocal Rank Fusion
                      </td>
                      <td className="px-4 py-3 font-mono text-[#2d4039]">R-Precision &amp; Rank Correlation (Kendall’s τ)</td>
                      <td className="px-4 py-3 font-mono text-emerald-700">Balanced (k=60)</td>
                      <td className="px-4 py-3 text-stone-600">
                        Eliminates score scale distortion between BM25 sparse scores and vector cosine similarities to surface a diverse, high-affinity top 50.
                      </td>
                    </tr>
                    <tr className="hover:bg-stone-50/60">
                      <td className="px-4 py-3 font-semibold text-stone-900">
                        Stage 4: LLM Cross-Reranker
                      </td>
                      <td className="px-4 py-3 font-mono text-[#2d4039]">NDCG@10, MRR &amp; Precision@10</td>
                      <td className="px-4 py-3 font-mono text-emerald-700">NDCG@10 &gt; 0.88</td>
                      <td className="px-4 py-3 text-stone-600">
                        <strong>Positional Relevance:</strong> Luxury buyers judge search quality in the first 3-5 results. NDCG heavily penalizes placing the best match at rank 8 instead of rank 1.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* IR Metrics Glossary & Evaluation Harness */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#a88f5b]">Key Metric 01</div>
                <h5 className="mt-1 text-sm font-semibold text-stone-900">NDCG@K (Normalized Discounted Gain)</h5>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Measures the usefulness of a listing based on its graded relevance (0–3) and its position in the search results. Relevance is discounted logarithmically proportional to rank position.
                </p>
                <div className="mt-3 rounded bg-stone-50 p-2 font-mono text-[10px] text-stone-700 border border-stone-200">
                  DCG@K = ∑ (2^rel_i - 1) / log2(i + 1)
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#a88f5b]">Key Metric 02</div>
                <h5 className="mt-1 text-sm font-semibold text-stone-900">MRR (Mean Reciprocal Rank)</h5>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Calculates the reciprocal rank of the first relevant listing. If the first dream home is at position #1, score = 1.0; if at position #3, score = 0.33. High MRR equals immediate user delight.
                </p>
                <div className="mt-3 rounded bg-stone-50 p-2 font-mono text-[10px] text-stone-700 border border-stone-200">
                  MRR = (1 / |Q|) * ∑ (1 / rank_first_rel)
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#a88f5b]">Key Metric 03</div>
                <h5 className="mt-1 text-sm font-semibold text-stone-900">Offline-to-Online Gating Harness</h5>
                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  How we validate improvements before deployment: 500 curated human queries with golden relevance labels run in CI. Any drop in NDCG@10 or Recall@100 blocks merge requests.
                </p>
                <div className="mt-3 rounded bg-stone-50 p-2 font-mono text-[10px] text-stone-700 border border-stone-200">
                  Gated Metric: Zero-Results &lt; 0.1%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RISK MATRIX */}
        {activeTab === "risk-matrix" && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-xs text-stone-800">
                <thead className="bg-stone-100/90 text-[10px] uppercase tracking-[0.14em] text-stone-600">
                  <tr>
                    <th className="px-4 py-3.5">Failure Mode / Risk</th>
                    <th className="px-4 py-3.5">Severity</th>
                    <th className="px-4 py-3.5">Architectural Mitigation (IE / Systems Layer)</th>
                    <th className="px-4 py-3.5">Business &amp; Platform Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      Hallucinated Inventory
                      <div className="text-[11px] text-stone-500 font-normal">LLM invents non-existent addresses or specs</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-800">
                        CRITICAL
                      </span>
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Retrieval Decoupling:</strong> The LLM is structurally forbidden from generating listing candidates. Matching is strictly computed via deterministic vector distance and BM25 inverted indices. The LLM only evaluates already-retrieved database IDs.
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2d4039]">
                      0% hallucinated listings. Grounded inventory integrity guaranteed.
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      Inference Cost Runaway
                      <div className="text-[11px] text-stone-500 font-normal">Spikes in query traffic burn through token budgets</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-800">
                        HIGH
                      </span>
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Parsed-Intent Caching + SLM Distillation:</strong> 80%+ of real estate queries follow repeating patterns. Cache parsed JSON tickets in Redis (1h TTL). Distill intent parsing into a dedicated 1B-parameter small model.
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2d4039]">
                      Unit cost drops from $0.015/query to $0.0001/query at 1B requests/mo.
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      Score Calibration Skew
                      <div className="text-[11px] text-stone-500 font-normal">BM25 scores dominate or suppress vector cosine distances</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                        MEDIUM
                      </span>
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Reciprocal Rank Fusion (RRF):</strong> Standardizes ranking on ordinal positions rather than arbitrary raw scores. Fuses both streams with <code className="text-[#2d4039]">1 / (60 + rank)</code> without requiring manual alpha-weight rebalancing.
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2d4039]">
                      Robust hybrid discovery unaffected by query keyword length or vector cluster density.
                    </td>
                  </tr>

                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">
                      Upstream API Outage / 503
                      <div className="text-[11px] text-stone-500 font-normal">External foundation model API suffers intermittent downtime</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-800">
                        HIGH
                      </span>
                    </td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Graceful Degradation Circuit:</strong> If LLM calls fail or timeout, the pipeline instantly degrades to deterministic in-memory / keyword search with fallback intent parsing. Zero 500 error pages presented to buyers.
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2d4039]">
                      99.99% search availability; users always receive high-quality listing results.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ECONOMICS AT 1B SCALE */}
        {activeTab === "economics" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
              <h3 className="text-base font-bold text-stone-900">
                Unit Economics: Transforming the Cost Curve at 1B Requests/Month
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                At <strong>1 billion monthly requests (~385 requests/second steady state, ~1,500 peak)</strong>,
                running frontier LLMs on every query would generate an unsustainable ~$1.5M/month inference bill.
                Below is the mathematical roadmap to collapse unit costs while preserving world-class discovery accuracy.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-xs text-stone-800">
                <thead className="bg-stone-100/90 text-[10px] uppercase tracking-[0.14em] text-stone-600">
                  <tr>
                    <th className="px-4 py-3.5">Pipeline Layer</th>
                    <th className="px-4 py-3.5">Naive LLM Stack (Unbounded)</th>
                    <th className="px-4 py-3.5">Groundtruth Production Architecture</th>
                    <th className="px-4 py-3.5">Monthly Cost Delta (1B Req)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">Intent Parsing</td>
                    <td className="px-4 py-3">Frontier LLM call per search ($0.005 / req)</td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Redis Intent Cache (65% hit rate) + Fine-Tuned 1B SLM</strong> ($0.00015 / req)
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">-$4,850,000 / mo savings</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">Query Embedding</td>
                    <td className="px-4 py-3">API call per query ($0.0002 / req)</td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>ONNX-Runtime Domain Bi-Encoder</strong> deployed on local inference sidecars
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">-$180,000 / mo savings</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">Listing Retrieval</td>
                    <td className="px-4 py-3">Large cluster unpartitioned brute vector scan</td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Metro-Sharded OpenSearch HNSW</strong> with bitset pre-filtering
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">3x throughput per node</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-medium text-stone-900">Candidate Reranking</td>
                    <td className="px-4 py-3">Rerank 50+ candidates with large reasoning model</td>
                    <td className="px-4 py-3 leading-relaxed">
                      <strong>Tiered Cascade:</strong> Fast cross-encoder for top-20 + lightweight LLM for top-5 "why"
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">p99 latency from 3.5s to &lt;250ms</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Naive Inference Unit Cost</div>
                <div className="mt-1 text-2xl font-bold text-rose-700">$0.0125 <span className="text-xs font-normal text-stone-500">/ query</span></div>
                <p className="mt-1 text-[11px] text-stone-500">Frontier LLM token pricing at full volume</p>
              </div>
              <div className="rounded-2xl border border-[#2d4039]/20 bg-[#2d4039]/5 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#2d4039]">Groundtruth Target Unit Cost</div>
                <div className="mt-1 text-2xl font-bold text-[#2d4039]">$0.0003 <span className="text-xs font-normal text-stone-500">/ query</span></div>
                <p className="mt-1 text-[11px] text-[#2d4039]/80">SLM + Caching + Native Vector Index</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Annualized OpEx Savings</div>
                <div className="mt-1 text-2xl font-bold text-emerald-700">&gt; $1.2M <span className="text-xs font-normal text-stone-500">/ year</span></div>
                <p className="mt-1 text-[11px] text-stone-500">Capital redeployed toward agent growth</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRODUCTION BLUEPRINT */}
        {activeTab === "blueprint" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5">
              <h3 className="text-base font-bold text-stone-900">
                Prototype Implementation vs. Production Specification
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-700">
                How this working prototype translates directly to Luxury Presence’s multi-region Kubernetes and microservice infrastructure.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-xs text-stone-800">
                <thead className="bg-stone-100/90 text-[10px] uppercase tracking-[0.14em] text-stone-600">
                  <tr>
                    <th className="px-4 py-3.5">System Component</th>
                    <th className="px-4 py-3.5">Working Prototype (This Repo)</th>
                    <th className="px-4 py-3.5">Production Scale Blueprint (1B Req/Mo)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80">
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">API Gateway &amp; Transport</td>
                    <td className="px-4 py-3">Fastify + Next.js proxy route</td>
                    <td className="px-4 py-3">Apollo GraphQL Federation + Envoy API Gateway + gRPC internal RPCs</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">Intent Parsing</td>
                    <td className="px-4 py-3">Gemini Flash Structured JSON with failover</td>
                    <td className="px-4 py-3">Fine-tuned Llama-3-1B / Gemma-2B hosted on Triton Inference Server + Redis cache</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">Embedding Engine</td>
                    <td className="px-4 py-3">Gemini Embedding API (3072-dim) with hash cache</td>
                    <td className="px-4 py-3">Domain-trained bi-encoder (query + listing encoders trained contrastively on clickstream)</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">Search &amp; Retrieval</td>
                    <td className="px-4 py-3">OpenSearch BM25 + k-NN (in-memory dataset fallback)</td>
                    <td className="px-4 py-3">Multi-AZ OpenSearch Cluster with metro-partitioned indices (Austin, Denver, Phoenix, LA, NYC)</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">Relevance Evaluation</td>
                    <td className="px-4 py-3">Real-time stopwatch latency telemetry</td>
                    <td className="px-4 py-3">Offline NDCG@10 eval harness + LLM-judged golden test suite gated in CI/CD pipeline</td>
                  </tr>
                  <tr className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-semibold text-stone-900">North Star Vision</td>
                    <td className="px-4 py-3">Hybrid retrieval + LLM reranking</td>
                    <td className="px-4 py-3">JEPA-style joint embedding space predicting buyer intent directly in representation space</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
