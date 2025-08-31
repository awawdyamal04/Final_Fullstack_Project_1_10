import { runQuery } from "../services/queryServices.js";
import { Parser } from "json2csv"; // Make sure to install json2csv using : npm install json2csv

export async function handleRunQuery(req, res) {
  try {
    const { sql } = req.body; // frontend sends SQL (from aiController)
    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const result = await runQuery(sql);

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Export SQL result as CSV
export async function exportQueryAsCSV(req, res) {
  try {
    const { sql } = req.query;
    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const result = await runQuery(sql);

    if (!Array.isArray(result)) {
      return res.status(500).json({ error: "Query result is not an array" });
    }

    const parser = new Parser();
    const csv = parser.parse(result);

    res.header("Content-Type", "text/csv");
    res.attachment("result.csv");
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Export SQL result as JSON
export async function exportQueryAsJSON(req, res) {
  try {
    const { sql } = req.query;
    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const result = await runQuery(sql);

    res.header("Content-Type", "application/json");
    res.attachment("result.json");
    res.send(JSON.stringify(result, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}