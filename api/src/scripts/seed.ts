/**
 * Seed script: loads listings.json into Postgres (source of truth) and
 * OpenSearch (text + vector index). Embeddings via Gemini.
 *
 * Free-tier friendly:
 *  - Disk cache (data/.embedding-cache.json) keyed by text hash, so an
 *    interrupted run resumes without re-embedding (and re-paying for) texts.
 *  - Exponential backoff with jitter on rate-limit / server errors.
 *  - SEED_LIMIT env var to seed a subset, e.g. SEED_LIMIT=500 npm run seed
 *
 *   npm run seed
 */
import "../env.js";
import fs from "node:fs";
import crypto from "node:crypto";
import pg from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { osClient, ensureIndex, INDEX } from "../search.js";

// Data files live at the repo root, but `npm run seed` executes with api/ as cwd.
const ROOT = new URL("../../..", import.meta.url);
const CACHE_PATH = new URL("data/.embedding-cache.json", ROOT);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const keyOf = (text: string) =>
  crypto.createHash("sha256").update(text).digest("hex");

function loadCache(): Map<string, number[]> {
  try {
    const raw = JSON.parse(
      fs.readFileSync(CACHE_PATH, "utf8")
    ) as Record<string, number[]>;
    return new Map(Object.entries(raw));
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, number[]>) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(Object.fromEntries(cache)));
}

async function embedWithRetry(
  model: any,
  text: string,
  attempt = 0
): Promise<number[]> {
  try {
    const res = await model.embedContent(text);
    return res.embedding.values as number[];
  } catch (e: any) {
    const status = e?.status ?? e?.code;
    const msg = String(e?.message ?? e);
    const retryable =
      status === 429 ||
      (typeof status === "number" && status >= 500 && status < 600) ||
      /429|quota|rate limit|resource exhausted/i.test(msg);
    if (retryable && attempt < 8) {
      const wait =
        Math.min(60_000, 2_000 * 2 ** attempt) + Math.random() * 1_000;
      process.stdout.write(
        `\nRate limited — waiting ${(wait / 1000).toFixed(0)}s (retry ${attempt + 1}/8)...\n`
      );
      await sleep(wait);
      return embedWithRetry(model, text, attempt + 1);
    }
    throw new Error(
      `Embedding failed after ${attempt + 1} attempt(s): ${msg}\n` +
        `Tip: set SEED_LIMIT to embed a subset, e.g. SEED_LIMIT=500 npm run seed`
    );
  }
}

async function embedBatch(
  texts: string[],
  cache: Map<string, number[]>
): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const out: number[][] = new Array(texts.length);
  const CONCURRENCY = 4;
  let done = 0;
  let hits = 0;
  for (let i = 0; i < texts.length; i += CONCURRENCY) {
    const chunk = texts.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (t, j) => {
        const k = keyOf(t);
        const cached = cache.get(k);
        if (cached) {
          out[i + j] = cached;
          hits++;
          return;
        }
        const v = await embedWithRetry(model, t);
        cache.set(k, v);
        out[i + j] = v;
      })
    );
    done += chunk.length;
    if (done % 200 === 0 || done === texts.length) saveCache(cache);
    process.stdout.write(`\rEmbedded ${done}/${texts.length} (${hits} from cache)`);
    await sleep(1000); // stay friendly to the free tier between batches
  }
  process.stdout.write("\n");
  saveCache(cache);
  return out;
}

async function main() {
  for (const k of ["GEMINI_API_KEY", "PG_URL", "OPENSEARCH_NODE"]) {
    if (!process.env[k])
      throw new Error(
        `${k} is not set — copy api/.env.example to api/.env and fill it in.`
      );
  }
  const all = JSON.parse(
    fs.readFileSync(new URL("data/listings.json", ROOT), "utf8")
  ) as any[];
  const limit = parseInt(process.env.SEED_LIMIT || "", 10);
  const listings =
    Number.isFinite(limit) && limit > 0 ? all.slice(0, limit) : all;
  console.log(
    `Seeding ${listings.length} listings...${listings.length < all.length ? ` (SEED_LIMIT=${listings.length} of ${all.length})` : ""}`
  );
  const cache = loadCache();
  if (cache.size > 0) console.log(`Loaded ${cache.size} cached embeddings.`);

  // Postgres
  const pool = new pg.Pool({ connectionString: process.env.PG_URL });
  await pool.query(fs.readFileSync(new URL("data/seed.sql", ROOT), "utf8"));
  console.log("Postgres seeded.");

  // Embeddings (one-time cost, cached in the index afterwards)
  const texts = listings.map(
    (l: any) => `${l.description} ${l.neighborhood}, ${l.city}`
  );
  const vectors = await embedBatch(texts, cache);

  // OpenSearch bulk index
  await ensureIndex();
  const body: unknown[] = [];
  listings.forEach((l: any, i: number) => {
    body.push({ index: { _index: INDEX, _id: l.id } });
    body.push({ ...l, embedding: vectors[i] });
  });
  for (let i = 0; i < body.length; i += 200) {
    await osClient.bulk({
      body: body.slice(i, i + 200) as any,
      refresh: "wait_for",
    });
    process.stdout.write(
      `\rIndexed ${Math.min(i + 200, body.length) / 2}/${listings.length}`
    );
  }
  process.stdout.write("\nDone.\n");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
