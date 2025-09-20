import React from "react";

import "./DownloadDbButton.css";

const DownloadDbButton = () => {
    const [toast, setToast] = React.useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    }

    const handleDownload = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/db/download", {
                method: "GET",
            });
            if (!response.ok) {
                throw new Error("Failed to download database");
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Mdatabase.db");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            showToast("Database downloaded successfully ✅");
        } catch (error) {
            console.error("Error downloading database:", error);
            showToast("Failed to download database ❌");
        }
    };

    const handleReset = async () => {
        try {
            const response = await fetch("http://localhost:3000/api/db/reset", {
                method: "POST",
            });
            if (!response.ok) {
                throw new Error("Failed to reset database");
            }
            const data = await response.json();
            showToast("Database reset successfully ✅");
        } catch (error) {
            console.error("Error resetting database:", error);
            showToast("Failed to reset database ❌");
        }
    };

    return (
      <div className="db-actions">
        <button className="download-btn" onClick={handleDownload}>
          ⬇ Download Modified DB
        </button>
        <button className="reset-btn" onClick={handleReset}>
          ♻ Reset DB
        </button>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
}
export default DownloadDbButton;