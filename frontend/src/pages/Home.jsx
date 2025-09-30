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
  const [activeTab, setActiveTab] = useState("sql");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [displayedSql, setDisplayedSql] = useState("");
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
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
    if (!sqlQuery) {
      setDisplayedSql("");
      return;
    }
    setDisplayedSql("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedSql((prev) => prev + sqlQuery.charAt(i));
      i++;
      if (i >= sqlQuery.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [sqlQuery]);

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
    window.location.href = "#login";
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".db")) {
      setError("Only .db files are allowed");
      return;
    }

    setIsLoading(true);
    setError("");

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
      setError(""); // Clear any previous errors
      console.log("Database uploaded successfully:", data);
      
      // Show success message temporarily
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSQL = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:3000/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Failed to generate SQL");

      const data = await response.json();
      setSqlQuery(data.sql);
      setActiveTab("sql");
    } catch {
      setError("Failed to generate SQL. Please try again.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: sqlQuery,
          params: [],
          userID: user.userId,
          prompt,
        }),
      });

      if (!response.ok) throw new Error("Failed to execute query");

      const data = await response.json();
      console.log("Query result data:", data.result); // Debug log
      setQueryResult(data.result);
      setActiveTab("results");
      setHistoryRefreshKey((prev) => prev + 1);
    } catch (err) {
      console.error("Query execution error:", err);
      setError(`Failed to execute query: ${err.message || "Please upload a database file first."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setPrompt("");
    setSqlQuery("");
    setQueryResult(null);
    setError("");
    setActiveTab("sql");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="logo">NL2SQL</div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
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
                        setPrompt(item.prompt);
                        setSqlQuery(item.sql);
                        setActiveTab("sql");
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
            {/* Screen with SQL terminal inside */}
            <div className="screen-wrapper">
              <img src="/assets/screen.png" alt="Screen" className="screen-img" />
              <div className="sql-terminal-inside">
                {sqlQuery && (
                  <div className="sql-preview">
                    <div className="sql-header">
                      <h3>SQL Terminal</h3>
                      <SqlActions
                        onExecute={executeQuery}
                        onClear={clearAll}
                        isLoading={isLoading}
                      />
                    </div>
                    <pre className="sql-code">{displayedSql}</pre>
                  </div>
                )}

                {queryResult && (
                  <div className="results-preview">
                    <div className="results-header">
                      <h3>Query Results</h3>
                      <ExportButtons />
                    </div>
                    <ResultsTable results={queryResult} />
                  </div>
                )}
                {/* Debug: Show queryResult state */}
                {console.log("Current queryResult:", queryResult)}
                
                {/* Test: Show a simple test result */}
                <div style={{color: '#00ff00', marginTop: '10px', padding: '10px', border: '1px solid #00ff00'}}>
                  <strong>Debug Info:</strong><br/>
                  Database uploaded: {uploadedFile ? 'YES' : 'NO'}<br/>
                  Database file: {uploadedFile ? uploadedFile.name : 'None'}<br/>
                  QueryResult exists: {queryResult ? 'YES' : 'NO'}<br/>
                  QueryResult type: {typeof queryResult}<br/>
                  QueryResult length: {queryResult ? queryResult.length : 'N/A'}
                </div>
              </div>
            </div>

            {/* Query box with convert button */}
            <div className="bottom-row">
              <div className="query-box">
                <PromptInput
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onGenerate={generateSQL}
                  isLoading={isLoading}
                />
              </div>
              <button 
                onClick={generateSQL}
                className="convert-btn"
                disabled={!prompt.trim() || isLoading}
              >
                {isLoading ? "Converting..." : "Convert to SQL"}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {uploadSuccess && <div className="success-message">✅ Database uploaded successfully!</div>}
      </main>
    </div>
  );
};

export default Home;
