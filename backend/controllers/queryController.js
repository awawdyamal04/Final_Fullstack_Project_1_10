import { runQuery } from "../services/queryServices.js";

export async function handleRunQuery(req, res) {
  try {
    const { sql } = req.body; // frontend sends SQL (maybe from aiController)
    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const result = await runQuery(sql);

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}