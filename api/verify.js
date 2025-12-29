import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key } = req.body;

  if (!key) {
    return res.json({ valid: false });
  }

  const { rows } = await pool.query(
    "SELECT expires_at FROM keys WHERE key = $1",
    [key]
  );

  if (!rows.length) {
    return res.json({ valid: false });
  }

  if (new Date(rows[0].expires_at) < new Date()) {
    return res.json({ valid: false });
  }

  return res.json({ valid: true });
}
