/**
 * Seed script: loads listings.json into Postgres (source of truth) and
 * OpenSearch (text + vector index). Embeddings via Gemini, batched.
 *
 *   npm run seed
 */
import "dotenv/config"; // must run before ../search.js is evaluated (ESM hoists imports)
import fs from "node:fs";
import pg from "pg";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_EMBEDDING_MODEL } from "../config.js";
import { osClient, ensureIndex, INDEX } from "../search.js";

// Data files live at the repo root, but `npm run seed` executes with api/ as cwd.
const ROOT = new URL("../../..", import.meta.url);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const SEED_LIMIT = (() => {
  const raw = process.env.SEED_LIMIT ?? "100";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 100;
  return parsed;
})();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function embedWithRetry(model: any, text: string): Promise<number[]> {
  let attempt = 0;
  while (true) {
    try {
      const res = await model.embedContent(text);
      return res.embedding.values;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status !== 429 || attempt >= 4) throw err;
      const delayMs = 4000 * (2 ** attempt) + 1500;
      console.warn(`Gemini rate limit hit; retrying embed in ${delayMs}ms (attempt ${attempt + 2}/5)`);
      await sleep(delayMs);
      attempt += 1;
    }
  }
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += 8) {
    const chunk = texts.slice(i, i + 8);
    const res = await Promise.all(chunk.map((t) => embedWithRetry(model, t)));
    out.push(...res);
    process.stdout.write(`\rEmbedded ${Math.min(i + 8, texts.length)}/${texts.length}`);
  }
  process.stdout.write("\n");
  return out;
}

async function main() {
  for (const k of ["GEMINI_API_KEY", "PG_URL", "OPENSEARCH_NODE"]) {
    if (!process.env[k]) throw new Error(`${k} is not set — copy api/.env.example to api/.env and fill it in.`);
  }
  const listings = JSON.parse(fs.readFileSync(new URL("data/listings.json", ROOT), "utf8"));
  const limitedListings = listings.slice(0, SEED_LIMIT);
  if (listings.length > limitedListings.length) {
    console.warn(`Seed limit reached: embedding only the first ${SEED_LIMIT} listings. Set SEED_LIMIT to a higher value for a full run.`);
  }
  console.log(`Seeding ${limitedListings.length} listings...`);

  // Postgres
  const pool = new pg.Pool({ connectionString: process.env.PG_URL });
  await pool.query(fs.readFileSync(new URL("data/seed.sql", ROOT), "utf8"));
  console.log("Postgres seeded.");

  // Embeddings (one-time cost, cached in the index afterwards)
  const texts = limitedListings.map(
    (l: any) => `${l.description} ${l.neighborhood}, ${l.city}`
  );
  const vectors = await embedBatch(texts);

  // OpenSearch bulk index
  await ensureIndex();
  const body: unknown[] = [];
  limitedListings.forEach((l: any, i: number) => {
    body.push({ index: { _index: INDEX, _id: l.id } });
    body.push({ ...l, embedding: vectors[i] });
  });
  for (let i = 0; i < body.length; i += 200) {
    await osClient.bulk({ body: body.slice(i, i + 200) as any, refresh: "wait_for" });
    process.stdout.write(`\rIndexed ${Math.min(i + 200, body.length) / 2}/${limitedListings.length}`);
  }
  process.stdout.write("\nDone.\n");
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
