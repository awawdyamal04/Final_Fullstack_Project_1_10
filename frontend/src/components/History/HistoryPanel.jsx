import React, { useEffect, useState } from "react";
import "./HistoryPanel.css";

const HistoryPanel = ({ userId, onSelectHistory, onRunQuery }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:3000/api/history/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch history");

        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  // item is history object it has _id, prompt, sql, userID
  const handleClick = (item) => {
    setSelectedId(item._id);
    if (onRunQuery) {
      onRunQuery(item.sql);
    }
    if (onSelectHistory) {
      onSelectHistory(item);
    }
  };

  
  return (
    <div className="history-panel">
      <h2 className="history-title">History</h2>

      {loading && <p className="history-loading">Loading...</p>}
      {error && <p className="history-error">{error}</p>}
      {!loading && history.length === 0 && (
        <p className="history-empty">No history yet</p>
      )}

      <ul className="history-list">
        {history.map((item) => (
          <li
            key={item._id}
            onClick={() => handleClick(item)}
            className={`history-item ${
              selectedId === item._id ? "selected" : ""
            }`}
          >
            <p className="history-prompt">{item.prompt}</p>
            <p className="history-sql">{item.sql}</p>
          </li>
        ))}
      </ul>
    </div>
  );

};

export default HistoryPanel;