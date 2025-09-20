import React, { useState } from "react";
import "./ResultsTable.css";

const ResultsTable = ({ results }) => {
  if (!results || results.length === 0) {
    return <div className="empty-results">No results found</div>;
  }

  const [activeIndex, setActiveIndex] = useState(0);
  const activeResult = results[activeIndex];

  const renderTable = (rows) => {
    if (!rows || rows.length === 0) {
      return <div className="empty-results">No rows returned</div>;
    }

    const columns = Object.keys(rows[0]);

    return (
      <table className="results-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, cellIndex) => (
                <td key={cellIndex}>{String(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="results-table-container">
      {/* Tabs for multiple results */}
      {results.length > 1 && (
        <div className="results-tabs">
          {results.map((res, idx) => (
            <button
              key={idx}
              className={idx === activeIndex ? "active" : ""}
              onClick={() => setActiveIndex(idx)}
            >
              {res.type === "select"
                ? `Result ${idx + 1} (SELECT)`
                : `Result ${idx + 1} (changes: ${res.changes ?? 0})`}
            </button>
          ))}
        </div>
      )}

      {/* Active result content */}
      <div className="results-content">
        <p className="query-label">
          <strong>SQL:</strong> {activeResult.query}
        </p>

        {activeResult.type === "select" ? (
          renderTable(activeResult.rows)
        ) : (
          <div className="non-select-result">
            <p>
              Statement executed successfully.{" "}
              {activeResult.changes !== undefined && (
                <>Rows affected: {activeResult.changes}. </>
              )}
              {activeResult.lastID !== undefined && (
                <>Last inserted ID: {activeResult.lastID}</>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsTable;