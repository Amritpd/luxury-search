/**
 * Seed script: loads listings.json into Postgres (source of truth) and
 * OpenSearch (text + vector index). Embeddings via Gemini.
 *
 * Free-tier friendly:
 *  - Uses Gemini batchEmbedContents (up to 50 texts per API call) for ultra-fast seeding
 *  - Disk cache (data/.embedding-cache.json) keyed by text hash, so an
 *    interrupted run resumes without re-embedding texts.
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

const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
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

async function batchEmbedWithRetry(
  model: any,
  texts: string[],
  attempt = 0
): Promise<number[][]> {
  try {
    const res = await model.batchEmbedContents({
      requests: texts.map((t) => ({
        content: { parts: [{ text: t }] },
      })),
    });
    return res.embeddings.map((e: any) => e.values as number[]);
  } catch (e: any) {
    const status = e?.status ?? e?.code;
    const msg = String(e?.message ?? e);
    const retryable =
      status === 429 ||
      (typeof status === "number" && status >= 500 && status < 600) ||
      /429|quota|rate limit|resource exhausted/i.test(msg);
    if (retryable && attempt < 6) {
      const wait =
        Math.min(30_000, 2_000 * 2 ** attempt) + Math.random() * 1_000;
      process.stdout.write(
        `\n[Rate limit/quota] Waiting ${(wait / 1000).toFixed(1)}s (retry ${attempt + 1}/6)...\n`
      );
      await sleep(wait);
      return batchEmbedWithRetry(model, texts, attempt + 1);
    }
    throw new Error(
      `Batch embedding failed after ${attempt + 1} attempt(s): ${msg}\n` +
        `Tip: you can resume anytime — existing embeddings are cached in data/.embedding-cache.json`
    );
  }
}

async function embedBatch(
  texts: string[],
  cache: Map<string, number[]>
): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
  const out: number[][] = new Array(texts.length);
  const BATCH_SIZE = 50; // Gemini supports up to 100 per batch call
  let done = 0;
  let hits = 0;

  // Identify what needs embedding
  const missingIndices: number[] = [];
  const missingTexts: string[] = [];

  for (let i = 0; i < texts.length; i++) {
    const k = keyOf(texts[i]);
    const cached = cache.get(k);
    if (cached) {
      out[i] = cached;
      hits++;
    } else {
      missingIndices.push(i);
      missingTexts.push(texts[i]);
    }
  }

  done = hits;
  process.stdout.write(
    `Initial cache status: ${hits}/${texts.length} (${((hits / texts.length) * 100).toFixed(1)}%) already cached.\n`
  );

  for (let i = 0; i < missingTexts.length; i += BATCH_SIZE) {
    const chunkTexts = missingTexts.slice(i, i + BATCH_SIZE);
    const chunkIndices = missingIndices.slice(i, i + BATCH_SIZE);

    const vectors = await batchEmbedWithRetry(model, chunkTexts);

    for (let j = 0; j < chunkTexts.length; j++) {
      const globalIdx = chunkIndices[j];
      const vector = vectors[j];
      const k = keyOf(chunkTexts[j]);
      cache.set(k, vector);
      out[globalIdx] = vector;
    }

    done += chunkTexts.length;
    saveCache(cache);
    process.stdout.write(
      `\rEmbedded ${done}/${texts.length} listings (${hits} hits from disk cache)...`
    );

    // Polite pause between batch API requests
    await sleep(400);
  }

  process.stdout.write("\nAll listings embedded successfully!\n");
  saveCache(cache);
  return out;
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in api/.env.");
  }

  const all = JSON.parse(
    fs.readFileSync(new URL("data/listings.json", ROOT), "utf8")
  ) as any[];
  const limit = parseInt(process.env.SEED_LIMIT || "", 10);
  const listings =
    Number.isFinite(limit) && limit > 0 ? all.slice(0, limit) : all;

  console.log(
    `\n=== Groundtruth Seeding Pipeline ===\nTarget: ${listings.length} listings${
      listings.length < all.length ? ` (SEED_LIMIT=${listings.length})` : ""
    } using ${EMBEDDING_MODEL}`
  );

  const cache = loadCache();
  if (cache.size > 0) console.log(`Loaded ${cache.size} total hashes from disk cache.`);

  // 1. Embeddings Generation (Fast batched Gemini API)
  const texts = listings.map(
    (l: any) => `${l.description} ${l.neighborhood}, ${l.city}`
  );
  const vectors = await embedBatch(texts, cache);

  // 2. Postgres Seeding (if available)
  try {
    if (process.env.PG_URL) {
      const pool = new pg.Pool({
        connectionString: process.env.PG_URL,
        connectionTimeoutMillis: 2000,
      });
      await pool.query(fs.readFileSync(new URL("data/seed.sql", ROOT), "utf8"));
      console.log("✓ Postgres seeded successfully.");
      await pool.end();
    }
  } catch (err: any) {
    console.log(`ℹ Postgres offline or unreachable (${err.message}). Skipped DB insertion.`);
  }

  // 3. OpenSearch Bulk Index (if available)
  try {
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
        `\rIndexed in OpenSearch: ${Math.min(i + 200, body.length) / 2}/${listings.length}`
      );
    }
    process.stdout.write("\n✓ OpenSearch index synced.\n");
  } catch (err: any) {
    console.log(`ℹ OpenSearch offline or unreachable (${err.message}). Local cached embeddings ready for in-memory hybrid engine.`);
  }

  console.log(`\n🎉 Done! All ${listings.length} listings embedded and cached at data/.embedding-cache.json\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
