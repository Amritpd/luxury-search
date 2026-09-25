import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.PG_URL });

export async function getListingsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { rows } = await pool.query(
    `SELECT * FROM listings WHERE id = ANY($1)`,
    [ids]
  );
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter(Boolean);
}

export async function pingDb(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
