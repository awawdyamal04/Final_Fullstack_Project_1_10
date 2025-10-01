import React, { useState, useEffect } from "react";
import "./home.css";
import FileUploader from "../components/Upload/FileUploader";
import HistoryPanel from "../components/History/HistoryPanel";
import ExportButtons from "../components/Results/ExportButtons";
import SqlActions from "../components/SQLView/SqlActions";
import ResultsTable from "../components/Results/ResultsTable";
import PromptInput from "../components/Terminal/PromptInput";
import DownloadDbButton from "../components/Download/DownloadDbButton";
import UserSettings from "../components/UserSettings/UserSettings";

const Home = () => {
  const [user, setUser] = useState(null);
  const [queries, setQueries] = useState([
    {
      id: 1,
      prompt: "",
      sqlQuery: "",
      queryResult: null,
      isLoading: false,
      error: "",
      activeTab: "sql",
      displayedSql: ""
    }
  ]);
  const [activeQueryId, setActiveQueryId] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  
  // Blinking grandma effect
  const [grandmaImageIndex, setGrandmaImageIndex] = useState(0);
  const grandmaImages = [
    "/assets/secretary-desk.png",
    "/assets/secretary-desk-2.png", 
    "/assets/secretary-desk-3.png",
    "/assets/secretary-desk-4.png",
    "/assets/secretary-desk-5.png",
    "/assets/secretary-desk-6.png"
  ];

  // Blinking grandma effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGrandmaImageIndex((prevIndex) => (prevIndex + 1) % grandmaImages.length);
    }, 2000); // Change image every 2 seconds
    
    return () => clearInterval(interval);
  }, [grandmaImages.length]);

  // Typing effect for SQL
  useEffect(() => {
    const activeQuery = getActiveQuery();
    if (!activeQuery || !activeQuery.sqlQuery) {
      if (activeQueryId) {
        updateQuery(activeQueryId, { displayedSql: "" });
      }
      return;
    }
    
    updateQuery(activeQueryId, { displayedSql: "" });
    let i = 0;
    let currentDisplayed = "";
    const interval = setInterval(() => {
      if (i < activeQuery.sqlQuery.length) {
        currentDisplayed += activeQuery.sqlQuery.charAt(i);
        updateQuery(activeQueryId, {
          displayedSql: currentDisplayed
        });
        i++;
      } else {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [activeQueryId, queries.find(q => q.id === activeQueryId)?.sqlQuery]);

  // Check login
  useEffect(() => {
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "#login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    window.location.href = "#login";
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  // Helper functions for query management
  const getActiveQuery = () => {
    const activeQuery = queries.find(q => q.id === activeQueryId);
    return activeQuery || queries[0] || {
      id: 1,
      prompt: "",
      sqlQuery: "",
      queryResult: null,
      isLoading: false,
      error: "",
      activeTab: "sql",
      displayedSql: ""
    };
  };
  
  const updateQuery = (queryId, updates) => {
    setQueries(prev => {
      const queryExists = prev.some(q => q.id === queryId);
      if (!queryExists) {
        console.warn(`Query with id ${queryId} not found`);
        return prev;
      }
      return prev.map(q => 
        q.id === queryId ? { ...q, ...updates } : q
      );
    });
  };

  const addNewQuery = () => {
    console.log("Adding new query. Current queries:", queries.map(q => q.id));
    const newId = queries.length > 0 ? Math.max(...queries.map(q => q.id)) + 1 : 1;
    console.log("New query ID:", newId);
    
    const newQuery = {
      id: newId,
      prompt: "",
      sqlQuery: "",
      queryResult: null,
      isLoading: false,
      error: "",
      activeTab: "sql",
      displayedSql: ""
    };
    
    setQueries(prev => {
      const updated = [...prev, newQuery];
      console.log("Updated queries:", updated.map(q => q.id));
      return updated;
    });
    setActiveQueryId(newId);
  };

  const removeQuery = (queryId) => {
    console.log("Removing query:", queryId, "Current queries:", queries.map(q => q.id));
    
    if (queries.length <= 1) {
      console.log("Cannot remove last query");
      return; // Don't remove the last query
    }
    
    // Use functional update to ensure we get the latest state
    setQueries(currentQueries => {
      const filteredQueries = currentQueries.filter(q => q.id !== queryId);
      console.log("Filtered queries:", filteredQueries.map(q => q.id));
      
      // If we removed the active query, switch to the first remaining query
      if (activeQueryId === queryId && filteredQueries.length > 0) {
        console.log("Switching to query:", filteredQueries[0].id);
        // Use setTimeout to ensure state update happens after queries update
        setTimeout(() => {
          setActiveQueryId(filteredQueries[0].id);
        }, 0);
      }
      
      return filteredQueries;
    });
  };

  const [uploadError, setUploadError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".db")) {
      setUploadError("Only .db files are allowed");
      return;
    }

    setUploadLoading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("dbfile", file);

      const response = await fetch("http://localhost:3000/api/db/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setUploadedFile(file);
      setUploadSuccess(true);
      setUploadError(""); // Clear any previous errors
      console.log("Database uploaded successfully:", data);
      
      // Show success message temporarily
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(`Upload failed: ${err.message}`);
    } finally {
      setUploadLoading(false);
    }
  };

  const generateSQL = async (queryId = activeQueryId) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !query.prompt.trim()) {
      updateQuery(queryId, { error: "Please enter a prompt" });
      return;
    }
    
    updateQuery(queryId, { isLoading: true, error: "" });

    try {
      const response = await fetch("http://localhost:3000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query.prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate SQL");

      const data = await response.json();
      updateQuery(queryId, { 
        sqlQuery: data.sql, 
        displayedSql: "", // Reset displayed SQL to trigger typing effect
        activeTab: "sql",
        isLoading: false 
      });
    } catch {
      updateQuery(queryId, { 
        error: "Failed to generate SQL. Please try again.",
        isLoading: false 
      });
    }
  };

  const executeQuery = async (queryId = activeQueryId) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !query.sqlQuery.trim()) {
      updateQuery(queryId, { error: "No SQL query to execute" });
      return;
    }
    
    updateQuery(queryId, { isLoading: true, error: "" });

    try {
      const response = await fetch("http://localhost:3000/api/queries/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: query.sqlQuery,
          params: [],
          userID: user.userId,
          prompt: query.prompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to execute query");

      const data = await response.json();
      console.log("Query result data:", data.result); // Debug log
      updateQuery(queryId, { 
        queryResult: data.result,
        activeTab: "results",
        isLoading: false 
      });
      setHistoryRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Query execution error:", err);
      updateQuery(queryId, { 
        error: `Failed to execute query: ${err.message || "Please upload a database file first."}`,
        isLoading: false 
      });
    }
  };

  const clearAll = (queryId = activeQueryId) => {
    updateQuery(queryId, {
      prompt: "",
      sqlQuery: "",
      queryResult: null,
      error: "",
      activeTab: "sql",
      displayedSql: ""
    });
  };

  if (!user) return <div>Loading...</div>;

  // Safety check to ensure we have at least one query
  if (!queries || queries.length === 0) {
    console.error("No queries found, initializing default query");
    setQueries([{
      id: 1,
      prompt: "",
      sqlQuery: "",
      queryResult: null,
      isLoading: false,
      error: "",
      activeTab: "sql",
      displayedSql: ""
    }]);
    setActiveQueryId(1);
    return <div>Initializing...</div>;
  }


  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="logo">NL2SQL</div>
        <div className="user-info">
          <span className="welcome-message">
            Welcome, {user?.firstName} {user?.lastName}!
          </span>
          <button onClick={() => setShowUserSettings(true)} className="settings-btn">
            Settings
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Main grid */}
      <main className="home-main">
        <div className="main-grid">
          {/* LEFT SIDE */}
          <div className="left-panel">
            <img
              src={grandmaImages[grandmaImageIndex]}
              alt="Grandma"
              className="grandma-img"
            />

            {/* Upload photo - right under grandma at very left */}
            <div
              className={`upload-photo ${uploadedFile ? "occupied" : ""}`}
              onClick={() => document.getElementById("file-input").click()}
            >
              <img 
                src={uploadedFile ? "/assets/uploaded.png" : "/assets/upload.png"} 
                alt={uploadedFile ? "Uploaded" : "Upload"} 
              />
              <span className="upload-text">Upload or drag your data here</span>
            </div>

            {/* History bar - right next to upload photo */}
            <div className={`history-bar ${historyExpanded ? 'expanded' : ''}`}>
              <div 
                className="history-header-bar"
                onClick={() => setHistoryExpanded(!historyExpanded)}
              >
                <span className="history-title">History</span>
                <span className={`history-arrow ${historyExpanded ? 'expanded' : ''}`}>▼</span>
              </div>
              {historyExpanded && (
                <div className="history-content">
                  <HistoryPanel
                    userId={user?.userId}
                    refreshKey={historyRefreshKey}
                    onSelectHistory={(item) => {
                      if (item) {
                        updateQuery(activeQueryId, {
                          prompt: item.prompt,
                          sqlQuery: item.sql,
                          activeTab: "sql",
                          displayedSql: ""
                        });
                      }
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Speech bubble */}
            <div className={`speech-bubble ${uploadedFile ? "hidden" : "visible"}`}>
              <div className="bubble-content">
                <p>Upload or drag your DB here</p>
              </div>
              <div className="bubble-tail"></div>
            </div>
            
            <input
              id="file-input"
              type="file"
              accept=".db"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />

            {/* Spacer to push buttons to bottom */}
            <div className="spacer"></div>

            {/* DB buttons - at very left bottom */}
            <div className="db-buttons">
              <DownloadDbButton />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="right-panel">
            {/* Query Tabs */}
            <div className="query-tabs">
              {queries.map((query) => {
                return (
                  <div
                    key={query.id}
                    className={`query-tab ${query.id === activeQueryId ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("Clicking tab:", query.id);
                      setActiveQueryId(query.id);
                    }}
                  >
                    <span>Query {query.id}</span>
                    {queries.length > 1 && (
                      <button
                        className="close-tab"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Closing tab:", query.id);
                          removeQuery(query.id);
                        }}
                        title={`Close Query ${query.id}`}
                        style={{ zIndex: 10 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
              <button 
                className="add-query-btn" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Add button clicked! Current queries:", queries.length);
                  addNewQuery();
                }}
                title="Add new query"
              >
                +
              </button>
              {/* Debug info */}
              <div style={{color: '#fff', fontSize: '0.8rem', marginLeft: '1rem'}}>
                Total: {queries.length}
              </div>
            </div>

            {/* Screen with SQL terminal inside */}
            <div className="screen-wrapper">
              <img src="/assets/screen.png" alt="Screen" className="screen-img" />
              <div className="sql-terminal-inside">
                {(() => {
                  const activeQuery = getActiveQuery();
                  return activeQuery?.sqlQuery && (
                    <div className="sql-preview">
                      <div className="sql-header">
                        <h3>SQL Terminal</h3>
                        <SqlActions
                          onExecute={() => executeQuery(activeQueryId)}
                          onClear={() => clearAll(activeQueryId)}
                          isLoading={activeQuery.isLoading}
                        />
                      </div>
                      <pre className="sql-code">{activeQuery.displayedSql}</pre>
                    </div>
                  );
                })()}

                {(() => {
                  const activeQuery = getActiveQuery();
                  return activeQuery?.queryResult && (
                    <div className="results-preview">
                      <div className="results-header">
                        <h3>Query Results</h3>
                        <ExportButtons />
                      </div>
                      <ResultsTable results={activeQuery.queryResult} />
                    </div>
                  );
                })()}
                
                {/* Debug: Show queryResult state */}
                {(() => {
                  const activeQuery = getActiveQuery();
                  console.log("Current queryResult:", activeQuery?.queryResult);
                  return null;
                })()}
                
                {/* Test: Show a simple test result */}
                <div style={{color: '#00ff00', marginTop: '10px', padding: '10px', border: '1px solid #00ff00'}}>
                  <strong>Debug Info:</strong><br/>
                  Database uploaded: {uploadedFile ? 'YES' : 'NO'}<br/>
                  Database file: {uploadedFile ? uploadedFile.name : 'None'}<br/>
                  QueryResult exists: {getActiveQuery()?.queryResult ? 'YES' : 'NO'}<br/>
                  QueryResult type: {typeof getActiveQuery()?.queryResult}<br/>
                  QueryResult length: {getActiveQuery()?.queryResult ? getActiveQuery().queryResult.length : 'N/A'}
                </div>
              </div>
            </div>

            {/* Query box with convert button */}
            <div className="bottom-row">
              <div className="query-box">
                <PromptInput
                  prompt={getActiveQuery()?.prompt || ""}
                  setPrompt={(value) => updateQuery(activeQueryId, { prompt: value })}
                  onGenerate={() => generateSQL(activeQueryId)}
                  isLoading={getActiveQuery()?.isLoading || false}
                />
              </div>
              <button 
                onClick={() => generateSQL(activeQueryId)}
                className="convert-btn"
                disabled={!getActiveQuery()?.prompt?.trim() || getActiveQuery()?.isLoading}
              >
                {getActiveQuery()?.isLoading ? "Converting..." : "Convert to SQL"}
              </button>
            </div>
          </div>
        </div>

        {getActiveQuery()?.error && <div className="error-message">{getActiveQuery().error}</div>}
        {uploadError && <div className="error-message">{uploadError}</div>}
        {uploadSuccess && <div className="success-message">✅ Database uploaded successfully!</div>}
      </main>

      {/* User Settings Modal */}
      {showUserSettings && (
        <UserSettings
          user={user}
          onClose={() => setShowUserSettings(false)}
          onUserUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
};

export default Home;
