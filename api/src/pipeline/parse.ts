import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_EMBEDDING_MODEL } from "../config.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface SearchIntent {
  filters: {
    beds_min?: number;
    baths_min?: number;
    price_min?: number;
    price_max?: number;
    sqft_min?: number;
    property_type?: string;
    cities?: string[];
  };
  school_rating_min?: number;
  walk_score_min?: number;
  /** Free-text semantic intent — what gets embedded for vector search. */
  semantic: string;
  sort?: "price_asc" | "price_desc" | "newest";
}

const SYSTEM = `You translate natural-language home search queries into structured search intent.
Return ONLY valid JSON matching this schema:
{
  "filters": {
    "beds_min": number | null, "baths_min": number | null,
    "price_min": number | null, "price_max": number | null,
    "sqft_min": number | null, "property_type": "house"|"condo"|"townhome"|null,
    "cities": string[] | null
  },
  "school_rating_min": number | null, "walk_score_min": number | null,
  "semantic": "2-3 sentence description of the ideal home's vibe, location feel, and lifestyle fit",
  "sort": "price_asc"|"price_desc"|"newest"|null
}
Rules:
- Prices: "$1.2M" -> 1200000. "under $800k" -> price_max 800000.
- "good schools" / "top-rated schools" -> school_rating_min 8.
- "walkable" -> walk_score_min 70. "very walkable" -> 85.
- "near downtown" stays in semantic text, do not invent a city filter unless a city is named.
- Known cities: Austin, Denver, Phoenix. Only set cities if the query names one.
- semantic should capture everything the filters can't: lifestyle, architecture, feel.`;

export async function parseIntent(query: string): Promise<SearchIntent> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM,
    generationConfig: { responseMimeType: "application/json", temperature: 0.1 },
  });
  const res = await model.generateContent(`Query: "${query}"`);
  const parsed = JSON.parse(res.response.text());
  return {
    filters: {
      beds_min: parsed.filters?.beds_min ?? undefined,
      baths_min: parsed.filters?.baths_min ?? undefined,
      price_min: parsed.filters?.price_min ?? undefined,
      price_max: parsed.filters?.price_max ?? undefined,
      sqft_min: parsed.filters?.sqft_min ?? undefined,
      property_type: parsed.filters?.property_type ?? undefined,
      cities: parsed.filters?.cities ?? undefined,
    },
    school_rating_min: parsed.school_rating_min ?? undefined,
    walk_score_min: parsed.walk_score_min ?? undefined,
    semantic: parsed.semantic ?? query,
    sort: parsed.sort ?? undefined,
  };
}

/** Fallback when the LLM is unavailable: keyword-only, never a dead end. */
export function fallbackIntent(query: string): SearchIntent {
  return { filters: {}, semantic: query };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function embedText(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
  let attempt = 0;
  while (true) {
    try {
      const res = await model.embedContent(text);
      return res.embedding.values;
    } catch (err: any) {
      const status = err?.status ?? err?.response?.status;
      if (status !== 429 || attempt >= 4) throw err;
      const delayMs = 4000 * (2 ** attempt) + 1500;
      console.warn(`Gemini rate limit hit while embedding query; retrying in ${delayMs}ms (attempt ${attempt + 2}/5)`);
      await sleep(delayMs);
      attempt += 1;
    }
  }
}
