import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Validate file
export async function validateDbFile(filePath) {
  let db;
  try {
    db = await open({ filename: filePath, driver: sqlite3.Database });
    // Run a simple query to confirm it's readable
    //await db.get("SELECT name FROM sqlite_master LIMIT 1;");
  } catch (err) {
    throw new Error(
      "Invalid file type. Please upload a valid SQLite .db file."
    );
  } finally {
    if (db) await db.close();
  }
}

// Read schema (tables + columns)
export async function readDbSchema(filePath) {
  const db = await open({ filename: filePath, driver: sqlite3.Database });

  try {
    // get all non-internal tables
    const tables = await db.all(
      `SELECT name FROM sqlite_master 
       WHERE type='table' 
       AND name NOT LIKE 'sqlite_%';`
    );

    if (!tables.length) {
      return { message: "No user tables found in this database." };
    }

    // get columns for each table
    const schema = {};
    for (const t of tables) {
      const cols = await db.all(`PRAGMA table_info(${t.name});`);
      schema[t.name] = cols.map((c) => ({
        name: c.name,
        type: c.type || "UNKNOWN",
        notnull: Boolean(c.notnull),
        pk: Boolean(c.pk),
      }));
    }

    return schema;
  } finally {
    await db.close();
  }
}
