import React, { useState, useEffect } from "react";
import "./SchemaPanel.css";

const SchemaPanel = () => {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchema = async () => {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchema();
  }, []);

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
        <h2 className="schema-title">Database Schema</h2>
        <button 
          className="refresh-schema-button"
          onClick={fetchSchema}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading && <p className="schema-loading">Loading schema...</p>}
      
      {error && (
        <div className="schema-error">
          <p>{error}</p>
          <button onClick={fetchSchema} className="retry-button">
            Try Again
          </button>
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

