import React from "react";

const GenerateButton = ({ onGenerate, isLoading, disabled }) => {
  return (
    <button
      onClick={onGenerate}
      disabled={isLoading || disabled}
      className="generate-btn"
    >
      {isLoading ? (
        <>
          <span className="spinner"></span>
          Generating...
        </>
      ) : (
        "Generate SQL"
      )}
    </button>
  );
};

export default GenerateButton;