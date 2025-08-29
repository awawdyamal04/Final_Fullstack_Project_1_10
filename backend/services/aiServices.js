import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSQL(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a translator that converts natural language into SQL queries. Only output SQL.",
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
