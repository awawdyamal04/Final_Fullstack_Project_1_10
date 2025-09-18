import React from "react";
import GenerateButton from "./GenerateButton";

const PromptInput = ({ prompt, setPrompt, onGenerate, isLoading }) => {
  return (
    <div className="prompt-container">
      <h2>Enter your query in natural language</h2>
      <div className="prompt-input-container">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Show me all customers from New York who made purchases over $1000"
          className="prompt-input"
          rows={4}
        />
        <GenerateButton
          onGenerate={onGenerate}
          isLoading={isLoading}
          disabled={!prompt.trim()}
        />
      </div>
    </div>
  );
};

export default PromptInput;