import { runQuery, streamQuery } from "../services/queryServices.js";

export async function handleRunQuery(req, res) {
  try {
    const { sql, params } = req.body;
    if (!sql) return res.status(400).json({ error: "SQL query is required" });

    const result = await runQuery(sql, params || []);
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function exportQueryAsCSV(req, res) {
  try {
    const sql = req.query?.sql || req.body?.sql; // accept query or body
    if (!sql) return res.status(400).json({ error: "SQL query is required" });

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="result.csv"');

    await streamQuery(sql, res, { format: "csv" });
    if (!res.writableEnded) res.end();
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ error: err.message });
    try { res.end(); } catch (_) {}
  }
}

export async function exportQueryAsJSON(req, res) {
  try {
    const sql = req.query?.sql || req.body?.sql; // accept query or body
    if (!sql) return res.status(400).json({ error: "SQL query is required" });

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="result.json"');

    await streamQuery(sql, res, { format: "json" });
    if (!res.writableEnded) res.end();
  } catch (err) {
    if (!res.headersSent) return res.status(500).json({ error: err.message });
    try { res.end(); } catch (_) {}
  }
}