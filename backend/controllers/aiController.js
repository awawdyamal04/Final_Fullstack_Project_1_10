import { generateSQL, explainSQL } from "../services/aiServices.js";
import { getDbSchema } from "../config/dbState.js";

export async function getSQLFromPrompt(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const schema = getDbSchema();
    //console.log("Current schema:", schema);
    /*
    if (!schema) {
      return res.status(400).json({ error: "No database schema available" });
    }
    */
    
    const sql = await generateSQL(prompt, schema);
    res.json({ sql });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate SQL" });
  }
}

export async function explainSQLController(req, res) {
  const { sql } = req.body;
  if (!sql) {
    return res.status(400).json({ error: "SQL is required" });
  }

  try {
    const schema = getDbSchema();
    const explanation = await explainSQL(sql, schema);
    return res.json({ explanation });
  } catch (err) {
    console.error("Explain SQL error:", err);
    return res.status(500).json({ error: "Failed to explain SQL" });
  }
}
