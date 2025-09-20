import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { getCurrentDbPath } from "../config/dbState.js";

/**
 * Run a query and return all rows (non-streamed).
 */
export async function runQuery(sql, params = []) {
  const dbPath = getCurrentDbPath();
  if (!dbPath) throw new Error("No database loaded. Please upload a DB file first.");

  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const results = [];
  try {
    // Split queries by semicolon, filter out empty ones
    const queries = sql
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0);
    
    for (const query of queries) {
      const trimmed = query.toLowerCase();
      if (trimmed.startsWith("select")) {
        const rows = await db.all(query, params);
        results.push({ type: "select" ,query, rows });
      } else {
        const result = await db.run(query, params);
        results.push({ type: "modify" ,query, changes: result.changes, lastID: result.lastID });
      }
    }

    return results;
  } finally {
    try { await db.close(); } catch (_) {}
  }
}

/**
 * Stream query results by paging (LIMIT/OFFSET).
 * - format: 'json' or 'csv'
 * - writable: e.g. express res
 * - batchSize default 1000
 */
export async function streamQuery(sql, writable, { format = "json", batchSize = 1000 } = {}) {
  sql = String(sql || "").trim().replace(/;$/, "");
  if (!sql) throw new Error("Empty SQL");

  const dbPath = getCurrentDbPath();
  if (!dbPath) throw new Error("No database selected. Please upload a .db file first.");

  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  try {
    const countSql = `SELECT COUNT(*) AS cnt FROM (${sql}) AS _sub`;
    const countRow = await db.get(countSql);
    const total = Number((countRow && countRow.cnt) || 0);

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      if (s.includes('"') || s.includes(",") || s.includes("\n")) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    };

    let firstRow = true;
    let headersWritten = false;

    for (let offset = 0; offset < total; offset += batchSize) {
      const pageSql = `SELECT * FROM (${sql}) AS _sub LIMIT ? OFFSET ?`;
      const rows = await db.all(pageSql, [batchSize, offset]);

      if (format === "json") {
        for (const row of rows) {
          if (firstRow) {
            writable.write("[");
            writable.write(JSON.stringify(row));
            firstRow = false;
          } else {
            writable.write("," + JSON.stringify(row));
          }
        }
      } else { // csv
        if (rows.length) {
          if (!headersWritten) {
            const headers = Object.keys(rows[0]);
            writable.write(headers.map(escapeCsv).join(",") + "\n");
            headersWritten = true;
          }
          for (const row of rows) {
            const line = Object.keys(row).map((h) => escapeCsv(row[h])).join(",");
            writable.write(line + "\n");
          }
        }
      }

      // let event loop breathe
      await new Promise((r) => setImmediate(r));
    }

    // finish json output
    if (format === "json") {
      if (firstRow) {
        writable.write("[]");
      } else {
        writable.write("]");
      }
    }
  } finally {
    try { await db.close(); } catch (_) {}
  }
}