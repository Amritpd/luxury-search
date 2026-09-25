import fs from "node:fs";
import { osClient, INDEX } from "../search.js";
import type { SearchIntent } from "./parse.js";

export interface ScoredDoc {
  id: string;
  score: number;
  source: "bm25" | "knn";
}

const ALL_LISTINGS: Array<Record<string, any>> = (() => {
  try {
    return JSON.parse(
      fs.readFileSync(new URL("../../../data/listings.json", import.meta.url), "utf8")
    );
  } catch {
    return [];
  }
})();

function matchFilters(listing: Record<string, any>, intent: SearchIntent): boolean {
  const f = intent.filters;
  if (f.beds_min && listing.beds < f.beds_min) return false;
  if (f.baths_min && listing.baths < f.baths_min) return false;
  if (f.price_min && listing.price < f.price_min) return false;
  if (f.price_max && listing.price > f.price_max) return false;
  if (f.sqft_min && listing.sqft < f.sqft_min) return false;
  if (f.property_type && listing.property_type?.toLowerCase() !== f.property_type.toLowerCase()) return false;
  if (f.cities?.length && !f.cities.some((c) => listing.city?.toLowerCase() === c.toLowerCase())) return false;
  if (intent.school_rating_min && listing.school_rating < intent.school_rating_min) return false;
  if (intent.walk_score_min && listing.walk_score < intent.walk_score_min) return false;
  return true;
}

function buildFilters(intent: SearchIntent): Record<string, unknown>[] {
  const f = intent.filters;
  const filters: Record<string, unknown>[] = [];
  if (f.beds_min) filters.push({ range: { beds: { gte: f.beds_min } } });
  if (f.baths_min) filters.push({ range: { baths: { gte: f.baths_min } } });
  if (f.price_min) filters.push({ range: { price: { gte: f.price_min } } });
  if (f.price_max) filters.push({ range: { price: { lte: f.price_max } } });
  if (f.sqft_min) filters.push({ range: { sqft: { gte: f.sqft_min } } });
  if (f.property_type) filters.push({ term: { property_type: f.property_type } });
  if (f.cities?.length) filters.push({ terms: { city: f.cities } });
  if (intent.school_rating_min)
    filters.push({ range: { school_rating: { gte: intent.school_rating_min } } });
  if (intent.walk_score_min)
    filters.push({ range: { walk_score: { gte: intent.walk_score_min } } });
  return filters;
}

/** Classical keyword retrieval (BM25) over descriptions + neighborhoods. */
export async function bm25Retrieve(
  intent: SearchIntent,
  size = 50
): Promise<ScoredDoc[]> {
  try {
    const res = await osClient.search({
      index: INDEX,
      body: {
        size,
        _source: ["id"],
        query: {
          bool: {
            filter: buildFilters(intent),
            must: {
              multi_match: {
                query: intent.semantic,
                fields: ["description^2", "neighborhood^1.5", "city"],
              },
            },
          },
        },
      },
    });
    const hits = (res.body.hits.hits ?? []) as Array<{ _id: string; _score: number }>;
    return hits.map((h, i) => ({ id: h._id, score: 1 / (60 + i + 1), source: "bm25" as const }));
  } catch {
    // In-memory fallback keyword search
    const terms = (intent.semantic || "").toLowerCase().split(/\s+/).filter(Boolean);
    const filtered = ALL_LISTINGS.filter((l) => matchFilters(l, intent));
    const scored = filtered.map((l) => {
      const text = `${l.description} ${l.neighborhood} ${l.city}`.toLowerCase();
      let matchCount = 0;
      for (const t of terms) {
        if (text.includes(t)) matchCount++;
      }
      return { id: l.id, matchCount };
    });
    scored.sort((a, b) => b.matchCount - a.matchCount);
    return scored.slice(0, size).map((doc, i) => ({
      id: doc.id,
      score: 1 / (60 + i + 1),
      source: "bm25" as const,
    }));
  }
}

/** Vector retrieval: k-NN over listing embeddings, same filters applied. */
export async function knnRetrieve(
  intent: SearchIntent,
  queryVector: number[],
  size = 50
): Promise<ScoredDoc[]> {
  try {
    const res = await osClient.search({
      index: INDEX,
      body: {
        size,
        _source: ["id"],
        query: {
          knn: {
            embedding: {
              vector: queryVector,
              k: size,
              filter: { bool: { filter: buildFilters(intent) } },
            },
          },
        },
      },
    });
    const hits = (res.body.hits.hits ?? []) as Array<{ _id: string }>;
    return hits.map((h, i) => ({ id: h._id, score: 1 / (60 + i + 1), source: "knn" as const }));
  } catch {
    // In-memory candidate retrieval fallback
    const filtered = ALL_LISTINGS.filter((l) => matchFilters(l, intent));
    return filtered.slice(0, size).map((l, i) => ({
      id: l.id,
      score: 1 / (60 + i + 1),
      source: "knn" as const,
    }));
  }
}

/**
 * Reciprocal Rank Fusion: merges BM25 + kNN rankings without score
 * normalization headaches. Same trick used in production hybrid systems.
 */
export function reciprocalRankFusion(a: ScoredDoc[], b: ScoredDoc[]): string[] {
  const scores = new Map<string, number>();
  for (const doc of [...a, ...b]) {
    scores.set(doc.id, (scores.get(doc.id) ?? 0) + doc.score);
  }
  return [...scores.entries()].sort((x, y) => y[1] - x[1]).map(([id]) => id);
}
