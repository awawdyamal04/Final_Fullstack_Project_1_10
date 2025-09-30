import React from "react";

const SqlActions = ({ onExecute, onClear, isLoading }) => {
  return (
    <div className="sql-actions">
      <button
        onClick={onExecute}
        disabled={isLoading}
        className="execute-btn"
      >
        {isLoading ? "Executing..." : "Execute Query"}
      </button>
      <button onClick={onClear} className="clear-btn">
        Reset
      </button>
    </div>
  );
};

export default SqlActions;