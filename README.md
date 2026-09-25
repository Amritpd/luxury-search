# Groundtruth — natural-language home search

A technical demo of **AI-powered discovery for real estate search**: type what you want
in plain English, and a pipeline of intent parsing → hybrid retrieval → reranking
returns the best listings, with per-stage latency shown.

Built with the stack a production discovery team would choose:
**TypeScript/Node.js · OpenSearch (BM25 + k-NN) · PostgreSQL · Gemini · Next.js**

## The pipeline

```
"3-bed under $1.2M near top-rated schools"
        │
        ▼  parse intent (LLM, structured JSON)
{ beds_min: 3, price_max: 1200000, school_rating_min: 8,
  semantic: "family-friendly home near highly-rated schools…" }
        │
        ├──► BM25 keyword retrieval (OpenSearch multi_match)
        └──► k-NN vector retrieval (listing embeddings, same filters)
        │
        ▼  reciprocal-rank fusion (no score-normalization headaches)
        ▼  LLM rerank of top candidates (+ one-line "why" per pick)
        ▼  results + per-stage latency dashboard
```

The core architectural bet: **probabilistic LLMs are for understanding, not matching.**
The LLM translates intent and judges candidates — but relevance itself lives in a
learned similarity space (embeddings), not in generated tokens. Matching by
generation hallucinates; matching by distance doesn't.

## Quickstart

```bash
# 1. Infra (needs Docker; Linux hosts: set vm.max_map_count=262144)
docker compose up -d

# 2. Data → Postgres + OpenSearch (one-time Gemini embedding cost, ~pennies)
cd data && python3 generate_listings.py && cd ..
cd api && cp .env.example .env   # add GEMINI_API_KEY
npm install && npm run seed

# 3. Run
npm run dev          # api on :3001
cd ../web && npm install && npm run dev   # ui on :3000
```

Open http://localhost:3000 and try: *"walkable condo downtown under $800k"*.

## Roadmap — every piece is swappable

**Phase 1 — this demo (prove the pipeline).** Off-the-shelf everywhere: Gemini for
parsing, `text-embedding-004` for vectors, LLM rerank. Proves the shape of the system.

**Phase 2 — production hardening (cost × latency reality).**
- Swap frontier-LLM parsing for a **fine-tuned small model**. Intent parsing doesn't
  need a frontier model — this is the move that takes the AI infra bill from scary
  to boring at 1B requests/month. Cache parsed intents for repeated queries.
- Swap generic embeddings for a **domain-trained bi-encoder**: query encoder +
  listing encoder trained jointly with contrastive loss on clickstream
  (query → clicked-listing pairs). Off-the-shelf embeddings don't know that
  "good schools" lives in specific neighborhoods — yours will.
- Add a **relevance eval harness**: NDCG on judged query sets, click-through
  proxies, regression gates in CI. The unsexy thing that makes AI search shippable.

**Phase 3 — the north star (JEPA-style joint embeddings).** A joint-embedding
predictive model of the real-estate domain itself: encode listings and buyer
behavior into one representation space, predict the *embedding* of what a buyer
wants rather than generating tokens about it. Unlocks predictive discovery
(surface listings before the buyer searches), listing anomaly detection, and a
matching core that can't hallucinate — because it never generates, it only
predicts in representation space.

## What I'd do at 1B requests/month

Parsed-intent cache (most queries repeat) · precomputed embeddings at index time
(already done here) · small fine-tuned parser · index sharding by metro ·
result caching with listing-version invalidation · p99 latency budgets per stage,
not just averages.

## Dataset

5,000 synthetic listings across Austin, Denver, and Phoenix. Deterministic seed —
regenerate any time with `python3 data/generate_listings.py`.
