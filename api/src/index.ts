import "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { pingDb } from "./db.js";
import { pingSearch, ensureIndex } from "./search.js";
import { Timer } from "./pipeline/timing.js";
import { parseIntent, fallbackIntent, embedText } from "./pipeline/parse.js";
import { bm25Retrieve, knnRetrieve, reciprocalRankFusion } from "./pipeline/retrieve.js";
import { rerank } from "./pipeline/rerank.js";

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
    req.log.error(err);
    return reply.code(500).send({ error: "search failed", detail: String(err) });
  }
});

const port = Number(process.env.PORT ?? 3001);
await ensureIndex().catch((e) => app.log.warn(`index check failed: ${e}`));
await app.listen({ port, host: "0.0.0.0" });
