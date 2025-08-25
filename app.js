import express from "express";
import mysql from "mysql2/promise";
import OpenAI from "openai";

const app = express();
app.use(express.json());

// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // set in .env
});

// Create a connection pool to the database
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "mydb",
});

// Function to generate SQL from natural language
async function generateSQL(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // or "gpt-4o-mini" for cheaper/faster
      messages: [
        {
          role: "system",
          content:
            "You are a translator that converts natural language into SQL queries. Only output SQL.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const sql = response.choices[0].message.content.trim();
    return sql;
  } catch (err) {
    console.error("OpenAI Error:", err);
    throw err;
  }
}

// Route: Natural language → SQL → Query DB
app.post("/query", async (req, res) => {
  try {
    const { question } = req.body;

    // Convert natural language to SQL
    const sql = await generateSQL(question);
    console.log("Generated SQL:", sql);

    // Execute query
    const [rows] = await pool.query(sql);

    res.json({ sql, result: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
