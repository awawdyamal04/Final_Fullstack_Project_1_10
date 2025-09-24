import React, { useState, useEffect } from "react";
import "./SchemaPanel.css";

const SchemaPanel = ({ refreshKey }) => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchSchema = async (isAutoRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/db/schema");
      if (!response.ok) {
        if (response.status === 400) {
          setError("No database loaded. Please upload a database file first.");
          return;
        }
        throw new Error("Failed to fetch schema");
      }

      const data = await response.json();
      console.log(data);
      setSchema(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (refreshKey > 0) {
      fetchSchema(true); // Auto refresh when refreshKey changes
    } else {
      fetchSchema(false); // Initial load
    }
  }, [refreshKey]);

  const renderTable = (tableName, columns) => (
    <div key={tableName} className="schema-table">
      <h4 className="table-name">{tableName}</h4>
      <div className="columns-container">
        {columns.map((column, index) => (
          <div key={index} className="column-item">
            <span className="column-name">{column.name}</span>
            <span className="column-type">{column.type}</span>
            {column.notNull && <span className="column-constraint">NOT NULL</span>}
            {column.primaryKey && <span className="column-constraint primary">PRIMARY KEY</span>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="schema-panel">
      <div className="schema-header">
        <div className="schema-title-section">
          <h2 className="schema-title">Database Schema</h2>
          {lastUpdated && (
            <span className="last-updated">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        <button 
          className="refresh-schema-button"
          onClick={() => fetchSchema(false)}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="schema-loading">Loading schema...</p>}
      
      
      {error && (
        <div className="schema-error">
          <p>{error}</p>
          {/*
          <button onClick={() => fetchSchema(false)} className="retry-button">
            Try Again
          </button>
          */}
        </div>
      )}
      
      {!loading && !error && !schema && (
        <p className="schema-empty">No schema available</p>
      )}

      {!loading && !error && schema && (
        <div className="schema-content">
          {schema && Object.keys(schema).length > 0 ? (
          Object.entries(schema).map(([tableName, columns]) =>
            renderTable(tableName, columns)
          )
        ) : (
          <p className="schema-empty">No tables found in the database</p>
        )}
        </div>
      )}
    </div>
  );
};

export default SchemaPanel;

