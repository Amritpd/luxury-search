import pg from "pg";
import fs from "node:fs";

let pool: pg.Pool | null = null;
try {
  if (process.env.PG_URL) {
    pool = new pg.Pool({ connectionString: process.env.PG_URL, connectionTimeoutMillis: 1500 });
  }
} catch {
  pool = null;
}

const LOCAL_LISTINGS: Map<string, any> = (() => {
  try {
    const raw = JSON.parse(
      fs.readFileSync(new URL("../../data/listings.json", import.meta.url), "utf8")
    ) as Array<Record<string, any>>;
    return new Map(raw.map((l) => [l.id, l]));
  } catch {
    return new Map();
  }
})();

export async function getListingsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM listings WHERE id = ANY($1)`,
        [ids]
      );
      if (rows.length > 0) {
        const byId = new Map(rows.map((r) => [r.id, r]));
        return ids.map((id) => byId.get(id)).filter(Boolean);
      }
    } catch {
      // Fallback to in-memory dataset
    }
  }
  return ids.map((id) => LOCAL_LISTINGS.get(id)).filter(Boolean);
}

export async function pingDb(): Promise<boolean> {
  if (!pool) return false;
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
