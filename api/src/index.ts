import "./env.js";
import fs from "node:fs";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { pingDb } from "./db.js";
import { pingSearch, ensureIndex } from "./search.js";
import { Timer } from "./pipeline/timing.js";
import { parseIntent, fallbackIntent, embedText } from "./pipeline/parse.js";
import { bm25Retrieve, knnRetrieve, reciprocalRankFusion } from "./pipeline/retrieve.js";
import { rerank } from "./pipeline/rerank.js";

const FALLBACK_LISTINGS = JSON.parse(
  fs.readFileSync(new URL("../../data/listings.json", import.meta.url), "utf8")
) as Array<Record<string, any>>;
const FALLBACK_RESULTS = FALLBACK_LISTINGS.slice(0, 12).map((listing) => ({
  ...listing,
  why: listing.why ?? "Synthetic listing from the demo dataset.",
}));

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get("/api/health", async () => ({
  ok: true,
  postgres: await pingDb(),
  opensearch: await pingSearch(),
}));

app.get("/api/examples", async () => ({
  examples: [
    "3-bed under $1.2M near top-rated schools",
    "walkable condo downtown under $800k",
    "family home with a pool in Arcadia",
    "modern farmhouse with a home office under $900k",
  ],
}));

/**
 * The full pipeline:
 *   NL query -> intent parse (LLM) -> embed -> hybrid retrieve (BM25 + kNN, RRF)
 *   -> LLM rerank -> results + per-stage timings
 */
app.post("/api/search", async (req, reply) => {
  const { query } = (req.body ?? {}) as { query?: string };
  if (!query || typeof query !== "string" || query.length > 500) {
    return reply.code(400).send({ error: "query is required (max 500 chars)" });
  }

  const timer = new Timer();
  try {
    const intent = await timer.run("parse intent", () =>
      parseIntent(query).catch(() => fallbackIntent(query))
    );

    const [queryVector] = await Promise.all([
      timer.run("embed query", () => embedText(intent.semantic)),
    ]);

    const [bm25, knn] = await Promise.all([
      timer.run("bm25 retrieve", () => bm25Retrieve(intent)),
      timer.run("knn retrieve", () => knnRetrieve(intent, queryVector)),
    ]);

    const fused = reciprocalRankFusion(bm25, knn);

    const results = await timer.run("llm rerank", () => rerank(query, fused, 10));

    return {
      query,
      intent,
      results,
      timings: timer.report(),
      total_ms: timer.totalMs(),
      candidates_considered: fused.length,
    };
  } catch (err) {
    req.log.warn({ err }, "search pipeline failed; using synthetic fallback dataset");
    return {
      query,
      intent: fallbackIntent(query),
      results: FALLBACK_RESULTS,
      timings: [],
      total_ms: 0,
      candidates_considered: FALLBACK_RESULTS.length,
      warning: "Gemini is temporarily unavailable; showing the synthetic dataset fallback.",
    };
  }
});

const port = Number(process.env.PORT ?? 3001);
await ensureIndex().catch((e) => app.log.warn(`index check failed: ${e}`));
await app.listen({ port, host: "0.0.0.0" });
