import { GoogleGenerativeAI } from "@google/generative-ai";
import { getListingsByIds } from "../db.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface RankedListing {
  id: string;
  address: string;
  city: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  school_rating: number;
  walk_score: number;
  days_on_market: number;
  description: string;
  agent: string;
  why: string;
}

/**
 * Listwise LLM re-rank of the top candidates. The LLM never decides
 * *retrieval* — it only orders an already-relevant candidate set and
 * explains each pick. Probabilistic generation where it belongs:
 * judgment + language, not matching.
 */
export async function rerank(
  query: string,
  candidateIds: string[],
  topN = 10
): Promise<RankedListing[]> {
  const candidates = await getListingsByIds(candidateIds.slice(0, 20));
  if (candidates.length === 0) return [];

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
  });

  const catalog = candidates
    .map(
      (c: any) =>
        `{"id":"${c.id}","price":${c.price},"beds":${c.beds},"baths":${c.baths},`
        + `"city":"${c.city}","neighborhood":"${c.neighborhood}",`
        + `"school_rating":${c.school_rating},"walk_score":${c.walk_score},`
        + `"desc":"${c.description.replace(/"/g, "'")}"}`
    )
    .join("\n");

  const prompt = `Home buyer query: "${query}"

Rank these candidate listings by how well they match. Return ONLY JSON:
{"ranking": [{"id": "...", "why": "one sentence, specific to this listing"}]}
Rank at most ${topN}. "why" must reference concrete listing attributes, not generic praise.

Candidates:
${catalog}`;

  const res = await model.generateContent(prompt);
  const parsed = JSON.parse(res.response.text());
  const order: Array<{ id: string; why: string }> = parsed.ranking ?? [];
  const byId = new Map(candidates.map((c: any) => [c.id, c]));

  return order
    .map((r) => {
      const c: any = byId.get(r.id);
      if (!c) return null;
      return { ...c, why: r.why };
    })
    .filter(Boolean) as RankedListing[];
}
