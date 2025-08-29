import { generateSQL } from "../services/aiServices.js";

export async function getSQLFromPrompt(req, res) {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const sql = await generateSQL(prompt);
    res.json({ sql });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate SQL" });
  }
}
