import React, { useState } from "react";
import GenerateButton from "./GenerateButton";

const TabbedPromptInput = ({ 
  prompts, 
  setPrompts, 
  activePromptId, 
  setActivePromptId, 
  onGenerate, 
  isLoading 
}) => {
  const [nextTabId, setNextTabId] = useState(2); // Start from 2 since we have Tab 1

  const addNewTab = () => {
    const newTabId = nextTabId;
    setPrompts(prev => ({
      ...prev,
      [newTabId]: ""
    }));
    setActivePromptId(newTabId);
    setNextTabId(prev => prev + 1);
  };

  const closeTab = (tabId) => {
    if (Object.keys(prompts).length <= 1) {
      // Don't close the last tab, just clear its content
      setPrompts(prev => ({
        ...prev,
        [tabId]: ""
      }));
      return;
    }

    setPrompts(prev => {
      const newPrompts = { ...prev };
      delete newPrompts[tabId];
      return newPrompts;
    });

    // If we're closing the active tab, switch to another tab
    if (activePromptId === tabId) {
      const remainingTabs = Object.keys(prompts).filter(id => id !== tabId);
      if (remainingTabs.length > 0) {
        setActivePromptId(remainingTabs[0]);
      }
    }
  };

  const updatePrompt = (tabId, value) => {
    setPrompts(prev => ({
      ...prev,
      [tabId]: value
    }));
  };

  const getCurrentPrompt = () => prompts[activePromptId] || "";

  const handleGenerate = () => {
    onGenerate(getCurrentPrompt(), activePromptId);
  };

  return (
    <div className="tabbed-prompt-container">
      <div className="prompt-header">
        <h2>Enter your query in natural language</h2>
      </div>
      
      <div className="prompt-tabs">
        {Object.keys(prompts).map(tabId => (
          <div 
            key={tabId} 
            className={`prompt-tab ${activePromptId === tabId ? 'active' : ''}`}
          >
            <button
              className="tab-label"
              onClick={() => setActivePromptId(tabId)}
            >
              Query {tabId}
            </button>
            <button
              className="tab-close"
              onClick={() => closeTab(tabId)}
              title="Close tab"
            >
              ×
            </button>
          </div>
        ))}
        <button className="add-tab-btn" onClick={addNewTab} title="Add new tab">
          +
        </button>
      </div>

      <div className="prompt-input-container">
        <textarea
          value={getCurrentPrompt()}
          onChange={(e) => updatePrompt(activePromptId, e.target.value)}
          placeholder="e.g., Show me all customers from New York who made purchases over $1000"
          className="prompt-input"
          rows={4}
        />
        <GenerateButton
          onGenerate={handleGenerate}
          isLoading={isLoading}
          disabled={!getCurrentPrompt().trim()}
        />
      </div>
    </div>
  );
};

export default TabbedPromptInput;
