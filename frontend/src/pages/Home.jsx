import React, { useState, useEffect } from "react";
import "./home.css";
import FileUploader from "../components/Upload/FileUploader";
import HistoryPanel from "../components/History/HistoryPanel";
import SchemaPanel from "../components/Schema/SchemaPanel";
import ExportButtons from "../components/Results/ExportButtons";
import SqlActions from "../components/SQLView/SqlActions";
import ResultsTable from "../components/Results/ResultsTable";
import TabbedPromptInput from "../components/Terminal/TabbedPromptInput";
import DownloadDbButton from "../components/Download/DownloadDbButton";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";

const Home = () => {
  const [user, setUser] = useState(null);
  const [prompts, setPrompts] = useState({ 1: "" }); // Multiple prompts with IDs
  const [activePromptId, setActivePromptId] = useState(1); // Currently active prompt tab
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("prompt");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [schemaRefreshKey, setSchemaRefreshKey] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [activePanelTab, setActivePanelTab] = useState("history");

  // ✅ Add this handler: populate prompt + sql when selecting history
  const handleSelectHistory = (item) => {

    if (!item) return;

    // Set the current active prompt to the selected history item
    setPrompts(prev => ({
      ...prev,
      [activePromptId]: item.prompt || ""
    }));
    setSqlQuery(item.sql || "");
    setActiveTab("sql");
  };

  // Handle file upload success and refresh schema
  const handleFileUploadSuccess = (data) => {
    setUploadedFile(data);
    // Refresh schema when a new database is uploaded
    setSchemaRefreshKey(prev => prev + 1);
  };

  // Check if user is logged in and clear any uploaded database
  useEffect(() => {
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
      
      // Clear any uploaded database on page load/refresh
      clearUploadedDatabase();
    } else {
      // Redirect to login if not authenticated
      window.location.href = "#login";
    }
  }, []);

  // Function to clear uploaded database
  const clearUploadedDatabase = async () => {
    try {
      await fetch("http://localhost:3000/api/db/clear", {
        method: "DELETE",
      });
      console.log("Uploaded database cleared on page refresh");
    } catch (err) {
      console.error("Error clearing database:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "#login";
  };

  const generateSQL = async (promptText, promptId) => {
    if (!promptText.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call your AI service to generate SQL
      const response = await fetch("http://localhost:3000/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate SQL");
      }

      const data = await response.json();
      setSqlQuery(data.sql);
      setActiveTab("sql");
    } catch (err) {
      setError("Failed to generate SQL. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!sqlQuery.trim()) {
      setError("No SQL query to execute");
      return;
    }

    // Detect destructive query
    const destructiveKeywords = ["DROP", "DELETE", "TRUNCATE", "ALTER", "UPDATE"];
    const isDestructive = destructiveKeywords.some((kw) =>
      sqlQuery.toUpperCase().includes(kw)
    );

    if (isDestructive) {
      // Open confirmation modal
      setPendingAction(() => runQuery);
      setIsConfirmOpen(true);
      return;
    }

    // Otherwise run directly
    await runQuery();
  };

  const runQuery = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/queries/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: sqlQuery,
          params: [],
          userID: user.userId,
          prompt: prompts[activePromptId] || "",
        }),
      });

      if (!response.ok) throw new Error("Failed to execute query");

      const data = await response.json();
      setQueryResult(data.result);
      setActiveTab("results");
      setHistoryRefreshKey(historyRefreshKey + 1);
      
      // Check if the query was schema-modifying and refresh schema if needed
      const schemaModifyingKeywords = ["CREATE", "DROP", "ALTER", "ADD", "MODIFY"];
      const isSchemaModifying = schemaModifyingKeywords.some((kw) =>
        sqlQuery.toUpperCase().includes(kw)
      );
      if (isSchemaModifying) {
        setSchemaRefreshKey(prev => prev + 1);
      }
    } catch (err) {
      setError(
        "Failed to execute query. Please check your SQL syntax, or upload DB."
      );
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (promptText, sql) => {
    try {
      const res = await fetch("http://localhost:3000/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: user.userId,
          prompt: promptText,
          sql,
          save: true,
        }),
      });
      if (!res.ok) throw new Error("Failed to save to history");
      const data = await res.json();
      // Optimistically update history panel
      setHistory((prev) => [data, ...prev]);
      setHistoryRefreshKey(historyRefreshKey + 1);
    } catch (err) {
      console.error("Failed to save to history:", err);
    }
  };

  const exportResults = async (format) => {
    if (!sqlQuery.trim()) {
      setError("No SQL query to export");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/queries/export/${format}?sql=${encodeURIComponent(
          sqlQuery
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to export results");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query_results.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError("Failed to export results");
      console.error("Error:", err);
    }
  };

  const clearAll = () => {
    // Clear the current active prompt
    setPrompts(prev => ({
      ...prev,
      [activePromptId]: ""
    }));
    setSqlQuery("");
    setQueryResult(null);
    setError("");
    setActiveTab("prompt");
  };

  if (!user) {
    return <div>Loading...</div>;
  }


  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-content">
          <div className="logo">
            <h1>NL2SQL</h1>
            <span>Natural Language to SQL</span>
          </div>
          <div className="user-info">
          <span>
            Welcome,{" "}
            {user.firstName
              ? `${user.firstName} ${user.lastName || ""}`
              : user.email || user.userId}
            !
          </span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="home-main">
        <div className="main-container">
          {/* File Uploader Section */}
          <div className="uploader-section">
            <h2>Upload Your Database</h2>
            <FileUploader onUploadSuccess={handleFileUploadSuccess} onFileSelect={setUploadedFile} />
            <DownloadDbButton />
          </div>
          
          <div className="input-section">
            <TabbedPromptInput 
              prompts={prompts}
              setPrompts={setPrompts}
              activePromptId={activePromptId}
              setActivePromptId={setActivePromptId}
              onGenerate={generateSQL}
              isLoading={isLoading}
            />
          </div>

          <div className="tabs-section">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "sql" ? "active" : ""}`}
                onClick={() => setActiveTab("sql")}
                disabled={!sqlQuery}
              >
                Generated SQL
              </button>
              <button
                className={`tab ${activeTab === "results" ? "active" : ""}`}
                onClick={() => setActiveTab("results")}
                disabled={!queryResult}
              >
                Query Results
              </button>
            </div>

            <div className="tab-content">
              {activeTab === "sql" && sqlQuery && (
                <div className="sql-preview">
                  <div className="sql-header">
                    <h3>Generated SQL Query</h3>
                    <SqlActions onExecute={executeQuery} onClear={clearAll} isLoading={isLoading} />

                    {/* Confirmation Modal */}
                    <ConfirmModal
                      isOpen={isConfirmOpen}
                      message="⚠️ This query may modify or delete data. Do you really want to proceed?"
                      onConfirm={() => {
                        setIsConfirmOpen(false);
                        if (pendingAction) pendingAction();
                      }}
                      onCancel={() => setIsConfirmOpen(false)}
                    />

                  </div>
                  <pre className="sql-code">{sqlQuery}</pre>
                </div>
              )}

              {activeTab === "results" && queryResult && (
                <div className="results-preview">
                  <div className="results-header">
                    <h3>Query Results</h3>
                    <ExportButtons onExport={exportResults} />
                  </div>
                  <ResultsTable results={queryResult} />
                </div>
              )}

              {!sqlQuery && !queryResult && (
                <div className="empty-state">
                  <div className="empty-icon">💡</div>
                  <h3>Ready to generate SQL?</h3>
                  <p>
                    Enter a natural language query above and click "Generate
                    SQL" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Panel Section with Tabs */}
          <div className="panel-section">
            <div className="panel-tabs">
              <button
                className={`panel-tab ${activePanelTab === "history" ? "active" : ""}`}
                onClick={() => setActivePanelTab("history")}
              >
                History
              </button>
              <button
                className={`panel-tab ${activePanelTab === "schema" ? "active" : ""}`}
                onClick={() => setActivePanelTab("schema")}
              >
                Schema
              </button>
            </div>
            
            <div className="panel-content">
              {activePanelTab === "history" && (
                <HistoryPanel
                  userId={user?.userId}
                  onSelectHistory={handleSelectHistory}
                  refreshKey={historyRefreshKey}
                />
              )}
              {activePanelTab === "schema" && <SchemaPanel refreshKey={schemaRefreshKey} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;