import React, { useEffect, useState } from "react";
import "./HistoryPanel.css";

const HistoryPanel = ({ userId, onSelectHistory, refreshKey }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editSql, setEditSql] = useState("");
  const [showConfirmClearAll, setShowConfirmClearAll] = useState(false);
  const [toast, setToast] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [explainingId, setExplainingId] = useState(null);

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

  // called when userId changes or on initial render because of [userId] at the end
  useEffect(() => {
    if (!userId) return;
    fetchHistory();
  }, [userId, refreshKey]);

  // item is history object it has _id, prompt, sql, userID
  const handleClick = (item) => {
    setSelectedId(item._id);
    if (onSelectHistory) {
      onSelectHistory(item);
    }
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditPrompt(item.prompt);
    setEditSql(item.sql);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditPrompt("");
    setEditSql("");
  };

  const handleEdit = async (id, newPrompt, newSql) => {
    try {
      const res = await fetch(`http://localhost:3000/api/history/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userID: userId,
          prompt: newPrompt,
          sql: newSql,
        }),
      });
      if (!res.ok) throw new Error("Failed to update history item");
      const updatedItem = await res.json();
      //setHistory(history.map((item) => (item._id === id ? updatedItem : item)));
      setHistory((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
      showToast("History item updated ✏️", "success");
      fetchHistory();
      if (selectedId === id && onSelectHistory) {
        onSelectHistory(updatedItem);
      }
      cancelEditing();
    } catch (err) {
      setError(err.message);
      showToast("Failed to update history item ❌", "error");
    }
  };

  const handleDelete = async (id, times) => {
    try {
      const res = await fetch(`http://localhost:3000/api/history/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userId }),
      });
      if (!res.ok) throw new Error("Failed to delete history item");

      setHistory((prev) => prev.filter((item) => item._id !== id));
      showToast("History item deleted 🗑️", "success");
      if (selectedId === id) {
        setSelectedId(null);
        if (onSelectHistory) onSelectHistory(null);
      }
      if (times === undefined) fetchHistory();
      if (times !== history.length) fetchHistory();
    } catch (err) {
      setError(err.message);
      showToast("Failed to delete history item ❌", "error");
    }
  };

  const handleClearAll = async () => {
    if (history.length === 0) return;
    setShowConfirmClearAll(true);
    // Actual deletion is handled in the confirm modal
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000); // auto-hide after 3s
  };

  const explainSQL = async (sql, itemId) => {
    try {
      setExplainingId(itemId);
      const res = await fetch("http://localhost:3000/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });
      
      if (!res.ok) throw new Error("Failed to get explanation");
      
      const data = await res.json();
      setExplanation({ id: itemId, explanation: data.explanation });
    } catch (err) {
      setError(err.message);
      showToast("Failed to get SQL explanation ❌", "error");
    } finally {
      setExplainingId(null);
    }
  };

  const closeExplanation = () => {
    setExplanation(null);
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2 className="history-title">History</h2>

        {/* Clear all - Only enable button if there is history */}
        <button
          className="clear-history-button"
          onClick={handleClearAll}
          disabled={history.length === 0}
        >
          Clear All
        </button>
      </div>

      {loading && <p className="history-loading">Loading...</p>}
      {error && <p className="history-error">{error}</p>}
      {!loading && history.length === 0 && (
        <p className="history-empty">No history yet</p>
      )}

      {/*
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
      */}

      {showConfirmClearAll && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <h3>Clear All History</h3>
            <p>
              Are you sure you want to delete <strong>all history</strong>? This
              action cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                className="confirm-btn danger"
                onClick={async () => {
                  try {
                    await Promise.all(
                      history.map((item) =>
                        handleDelete(item._id, history.length)
                      )
                    );
                    setHistory([]);
                    setSelectedId(null);
                    if (onSelectHistory) onSelectHistory(null);

                    showToast("History cleared successfully ✅", "success");
                  } catch (err) {
                    setError(err.message);
                    showToast("Failed to clear history ❌", "error");
                  } finally {
                    setShowConfirmClearAll(false);
                  }
                }}
              >
                Yes, Clear All
              </button>
              <button
                className="confirm-btn"
                onClick={() => setShowConfirmClearAll(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}

      <ul className="history-list">
        {history.map((item) => (
          <li
            key={item._id}
            className={`history-item ${
              selectedId === item._id ? "selected" : ""
            }`}
          >
            <div onClick={() => handleClick(item)}>
              <p className="history-sql">{item.sql}</p>
            </div>
            
            {editingId === item._id ? (
              <div className="history-edit-form">
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="history-edit-prompt"
                />

                <textarea
                  value={editSql}
                  onChange={(e) => setEditSql(e.target.value)}
                  className="history-edit-sql"
                />

                <div className="history-edit-actions">
                  <button
                    onClick={() => handleEdit(item._id, editPrompt, editSql)}
                    className="history-save-button"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="history-cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => handleClick(item)}
                className="history-item-content"
              >
                <p className="history-prompt">{item.prompt}</p>
                <div className="history-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      explainSQL(item.sql, item._id);
                    }}
                    className="history-explain-button"
                    title="Explain SQL"
                    disabled={explainingId === item._id}
                  >
                    {explainingId === item._id ? "..." : "?"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(item);
                    }}
                    className="history-edit-button"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }}
                    className="history-delete-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* SQL Explanation Modal */}
      {explanation && (
        <div className="explanation-overlay">
          <div className="explanation-modal">
            <div className="explanation-header">
              <h3>SQL Explanation</h3>
              <button
                className="explanation-close-button"
                onClick={closeExplanation}
              >
                ×
              </button>
            </div>
            <div className="explanation-content">
              <p>{explanation.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPanel;
