import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { key } = req.body;

    if (!key) {
      return res.status(200).json({ valid: false });
    }

    const result = await pool.query(
      "SELECT expires_at FROM keys WHERE key = $1",
      [key]
    );

    if (result.rowCount === 0) {
      return res.status(200).json({ valid: false });
    }

    if (new Date(result.rows[0].expires_at) < new Date()) {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
