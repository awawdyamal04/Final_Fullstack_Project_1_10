import pool from "../config/dbConfig.js";

/**
 * Run a query and return all rows (existing behavior).
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
 * Stream query results to a writable stream in chunks.
 * - format: 'json' (default) or 'csv'
 * - writable: any Node writable stream (e.g., express res)
 *
 * Usage from controller:
 *   await streamQuery(sql, res, { format: 'json' });
 *   await streamQuery(sql, res, { format: 'csv' });
 */
export async function streamQuery(sql, writable, { format = "json" } = {}) {
  const conn = await pool.getConnection();
  try {
    const query = conn.query(sql).stream({ objectMode: true });

    // helper to escape csv values
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return "";
      const s = String(val);
      return (s.includes('"') || s.includes(",") || s.includes("\n"))
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    return await new Promise((resolve, reject) => {
      let firstRow = true;
      let headers = null;

      query.on("error", (err) => {
        // stream/query error
        query.destroy();
        reject(err);
      });

      query.on("data", (row) => {
        try {
          if (format === "json") {
            if (firstRow) {
              writable.write("[");
              writable.write(JSON.stringify(row));
            } else {
              writable.write("," + JSON.stringify(row));
            }
          } else if (format === "csv") {
            if (firstRow) {
              headers = Object.keys(row);
              writable.write(headers.map(escapeCsv).join(",") + "\n");
            }
            const line = (headers || Object.keys(row))
              .map((h) => escapeCsv(row[h]))
              .join(",");
            writable.write(line + "\n");
          }
          firstRow = false;
        } catch (err) {
          query.destroy(err);
        }
      });

      query.on("end", () => {
        try {
          if (format === "json") {
            if (firstRow) {
              // no rows were written
              writable.write("[]");
            } else {
              writable.write("]");
            }
          }
          // finish writable if it supports end (express res should not be ended here if you want headers set before)
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          conn.release();
        }
      });

      query.on("close", () => {
        // safety - ensure connection released (end will also release)
        try { conn.release(); } catch (_) {}
      });
    });
  } catch (err) {
    try { conn.release(); } catch (_) {}
    throw err;
  }
}