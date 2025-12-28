import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { key, hwid } = req.body;

  if (!key || !hwid) {
    return res.json({ valid: false });
  }

  const { rows } = await pool.query(
    "SELECT * FROM keys WHERE key = $1",
    [key]
  );

  if (!rows.length) {
    return res.json({ valid: false });
  }

  const row = rows[0];

  if (new Date(row.expires_at) < new Date()) {
    return res.json({ valid: false });
  }

  if (!row.hwid) {
    await pool.query(
      "UPDATE keys SET hwid = $1 WHERE key = $2",
      [hwid, key]
    );
    return res.json({ valid: true });
  }

  if (row.hwid !== hwid) {
    return res.json({ valid: false });
  }

  return res.json({ valid: true });
}
