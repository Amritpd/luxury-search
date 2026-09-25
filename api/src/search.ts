import { Client } from "@opensearch-project/opensearch";

export const INDEX = "listings";

if (!process.env.OPENSEARCH_NODE) {
  throw new Error("OPENSEARCH_NODE is not set — copy api/.env.example to api/.env and fill it in.");
}

export const osClient = new Client({ node: process.env.OPENSEARCH_NODE });

/** Create the listings index with text + vector mappings if it doesn't exist. */
export async function ensureIndex() {
  const exists = await osClient.indices.exists({ index: INDEX });
  if (exists.body) return;
  await osClient.indices.create({
    index: INDEX,
    body: {
      settings: { "index.knn": true, number_of_shards: 1, number_of_replicas: 0 },
      mappings: {
        properties: {
          id: { type: "keyword" },
          description: { type: "text", analyzer: "standard" },
          neighborhood: { type: "text", fields: { keyword: { type: "keyword" } } },
          city: { type: "keyword" },
          property_type: { type: "keyword" },
          price: { type: "integer" },
          beds: { type: "integer" },
          baths: { type: "float" },
          sqft: { type: "integer" },
          school_rating: { type: "integer" },
          walk_score: { type: "integer" },
          days_on_market: { type: "integer" },
          embedding: {
            type: "knn_vector",
            dimension: 3072, // Gemini gemini-embedding-001
            method: { name: "hnsw", engine: "faiss", space_type: "l2" },
          },
        },
      },
    },
  });
}

export async function pingSearch(): Promise<boolean> {
  try {
    await osClient.ping();
    return true;
  } catch {
    return false;
  }
}
