import pool from "../config/dbConfig.js";

/**
 * Run a query and return all rows (non-streamed).
 */
export async function runQuery(sql) {
  try {
    const [rows] = await pool.query(sql);
    return rows;
  } catch (err) {
    console.error("Query Error:", err);
    throw err;
  }
}

/**
 * Stream query results by paging (LIMIT/OFFSET).
 * - format: 'json' or 'csv'
 * - writable: e.g. express res
 * - batchSize default 1000
 */
export async function streamQuery(sql, writable, { format = "json", batchSize = 1000 } = {}) {
  // remove trailing semicolon if present
  sql = sql.trim().replace(/;$/, "");
  // compute total rows safely by wrapping original query
  const countSql = `SELECT COUNT(*) AS cnt FROM (${sql}) AS _sub`;
  try {
    const [[{ cnt }]] = await pool.query(countSql);
    const total = Number(cnt) || 0;

    // csv helper
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      return (s.includes('"') || s.includes(",") || s.includes("\n"))
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    let firstRow = true;
    let headersWritten = false;
    for (let offset = 0; offset < total; offset += batchSize) {
      const pageSql = `SELECT * FROM (${sql}) AS _sub LIMIT ? OFFSET ?`;
      const [rows] = await pool.query(pageSql, [batchSize, offset]);

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
      // allow event loop to process between pages
      await new Promise((r) => setImmediate(r));
    }

    // finish json if needed
    if (format === "json") {
      if (firstRow) {
        writable.write("[]");
      } else {
        writable.write("]");
      }
    }
  } catch (err) {
    // propagate error so controller can handle headersSent logic
    throw err;
  }
}