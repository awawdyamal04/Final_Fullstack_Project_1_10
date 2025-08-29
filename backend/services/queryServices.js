import pool from "../config/dbConfig.js";

export async function runQuery(sql) {
  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    console.error("Query Error:", err);
    throw err;
  }
}