import React from "react";

const ExportButtons = ({ onExport }) => {
  return (
    <div className="export-actions">
      <button onClick={() => onExport("csv")} className="export-btn csv">
        Export CSV
      </button>
      <button onClick={() => onExport("json")} className="export-btn json">
        Export JSON
      </button>
    </div>
  );
};

export default ExportButtons;