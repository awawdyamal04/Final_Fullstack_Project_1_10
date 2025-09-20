import React, { useState, useEffect } from "react";
import "./home.css";
import FileUploader from "../components/Upload/FileUploader";
import HistoryPanel from "../components/History/HistoryPanel";
import ExportButtons from "../components/Results/ExportButtons";
import SqlActions from "../components/SQLView/SqlActions";
import ResultsTable from "../components/Results/ResultsTable";
import PromptInput from "../components/Terminal/PromptInput";
import DownloadDbButton from "../components/Download/DownloadDbButton";

const Home = () => {
  const [user, setUser] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("prompt");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  // ✅ Add this handler: populate prompt + sql when selecting history
  const handleSelectHistory = (item) => {
    setPrompt(item.prompt || "");
    setSqlQuery(item.sql || "");
    setActiveTab("sql");
  };

  // Check if user is logged in
  useEffect(() => {
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not authenticated
      window.location.href = "#login";
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    window.location.href = "#login";
  };

  const generateSQL = async () => {
    if (!prompt.trim()) {
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
        body: JSON.stringify({ prompt }),
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

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/queries/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: sqlQuery, params: [], userID: user.userId, prompt }), // include userID and prompt
      });

      if (!response.ok) {
        throw new Error("Failed to execute query");
      }

      const data = await response.json();
      setQueryResult(data.result);
      setActiveTab("results");
      setHistoryRefreshKey(historyRefreshKey + 1);

      /*
      // Save to history
      if (user) {
        //await saveToHistory(prompt, sqlQuery);
        setHistoryRefreshKey((prev) => prev + 1);
      }
        */
    } catch (err) {
      setError("Failed to execute query. Please check your SQL syntax, or upload DB.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveToHistory = async (prompt, sql) => {
    try {
      const res = await fetch("http://localhost:3000/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userID: user.userId,
          prompt,
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
    setPrompt("");
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
            <FileUploader onFileSelect={setUploadedFile} />
            <DownloadDbButton />
          </div>
          
          <div className="input-section">
            <PromptInput prompt={prompt} setPrompt={setPrompt} onGenerate={generateSQL} isLoading={isLoading} />
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

          {/* ✅ HistoryPanel wired with handleSelectHistory */}
          <HistoryPanel
            userId={user?.userId}
            onSelectHistory={handleSelectHistory}
            refreshKey={historyRefreshKey}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;