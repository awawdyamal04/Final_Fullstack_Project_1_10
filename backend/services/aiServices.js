import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function summarizeSchema(schema) {
  if (!schema) return "No schema available.";
  return Object.entries(schema)
    .map(([tableName, columns]) => {
      const cols = columns
        .map((col) => {
          let colDef = `${col.name}(${col.type}`;
          if (col.pk) colDef += ", PK";
          if (col.notnull) colDef += ", NOT NULL";
          colDef += ")";
          return colDef;
        })
        .join(", ");
      return `Table ${tableName}: ${cols}`;
    })
    .join("\n");
}

export async function generateSQL(prompt, schema) {
  let systemMessage = "";
  if (schema) {
    const schemaSummary = summarizeSchema(schema);
    systemMessage =
      " The database schema is as follows:\n" +
      JSON.stringify(schemaSummary) +
      "\n Make sure the query only uses existing tables and columns." +
      " If the user’s request cannot be mapped to the database, return: ERROR: Unclear or invalid request '.";
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a translator that converts natural language into SQLite queries. Only output SQL." +
            "if the request doesn't make sense, respond with: ERROR: Unclear or invalid request '." +
            systemMessage,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
    });

    return response.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI Error:", err);
    throw err;
  }
}
