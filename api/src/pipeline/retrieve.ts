import { osClient, INDEX } from "../search.js";
import type { SearchIntent } from "./parse.js";

export interface ScoredDoc {
  id: string;
  score: number;
  source: "bm25" | "knn";
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
}

/** Vector retrieval: k-NN over listing embeddings, same filters applied. */
export async function knnRetrieve(
  intent: SearchIntent,
  queryVector: number[],
  size = 50
): Promise<ScoredDoc[]> {
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
