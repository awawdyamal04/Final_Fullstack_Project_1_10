project-root/
│── backend/                # Express (Node.js) server
│   ├── src/
│   │   ├── config/
│   │   │   └── dbConfig.js       # DB connection, file upload validation
│   │   ├── controllers/
│   │   │   ├── dbController.js   # Handle upload, schema extraction
│   │   │   ├── queryController.js# Run queries, export CSV/JSON
│   │   │   └── aiController.js   # Prompt → SQL (OpenAI)
│   │   ├── routes/
│   │   │   ├── dbRoutes.js
│   │   │   ├── queryRoutes.js
│   │   │   └── aiRoutes.js
│   │   ├── services/
│   │   │   ├── dbService.js      # Manage DB schema, relationships
│   │   │   ├── queryService.js   # Execute validated SQL
│   │   │   └── aiService.js      # Calls OpenAI API, validates SQL
│   │   ├── middlewares/
│   │   │   ├── errorHandler.js   # Handle errors consistently
│   │   │   └── validateSQL.js    # Security checks for SQL
│   │   ├── utils/
│   │   │   ├── exportUtils.js    # Convert results → CSV/JSON
│   │   │   └── schemaUtils.js    # Parse DB schema (tables/columns/keys)
│   │   └── app.js                # Express app setup
│   └── server.js                 # Start server
│
│── frontend/               # React app
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PromptInput.jsx    # Textbox for questions
│   │   │   ├── SQLPreview.jsx     # Show/edit generated SQL
│   │   │   ├── ResultsTable.jsx   # Display query results
│   │   │   ├── FileUploader.jsx   # Upload .db file
│   │   │   ├── HistoryPanel.jsx   # Show past queries
│   │   │   └── TooltipHelp.jsx    # Examples/help
│   │   ├── pages/
│   │   │   └── Home.jsx           # Main interface (ties components together)
│   │   ├── services/
│   │   │   └── api.js             # Axios/fetch → calls backend
│   │   ├── context/
│   │   │   └── HistoryContext.js  # Store queries/results
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
│
│── tests/                  # Unit & integration tests
│   ├── backend/
│   │   ├── queryService.test.js
│   │   ├── aiService.test.js
│   │   └── dbService.test.js
│   └── frontend/
│       ├── PromptInput.test.jsx
│       └── ResultsTable.test.jsx
│
│── .env                    # API keys, DB paths (not in git)
│── docker-compose.yml       # (Optional) Run full stack easily
│── package.json             # Root dependencies (can be split frontend/backend)
│── README.md                # Documentation
