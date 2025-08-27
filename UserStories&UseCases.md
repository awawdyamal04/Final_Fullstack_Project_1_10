UC-01: Upload Database File
Actors: Business User (primary)
Preconditions: Application is running. User is authenticated (if needed).
Main Flow:
1.	User clicks Upload Database.
2.	System prompts to select a .db file.
3.	User selects file.
4.	System validates file type.
5.	If valid → system loads the schema (tables, columns, relationships).
6.	System shows confirmation: “Database loaded successfully.”
Alternatives/Exceptions:
•	2a. User cancels upload → system returns to idle state.
•	4a. File not valid (.db missing) → system shows error: “Invalid file type. Please upload a .db file.”
Postconditions: Database schema is cached for NL→SQL use.
________________________________________
UC-02: Ask Natural Language Question
Actors: Business User (primary), OpenAI Service (supporting)
Preconditions: Database is loaded (schema available).
Main Flow:
1.	User types a natural language question in textbox (e.g., “Show top 5 customers by orders”).
2.	System sends prompt + schema to NL→SQL engine (GPT).
3.	System generates SQL.
4.	SQL is displayed in preview editor.
5.	User clicks Run.
6.	System validates SQL syntax + schema references.
7.	If valid, SQL is executed.
8.	Results are displayed in a tabular format.
Alternatives/Exceptions:
•	3a. Prompt cannot be converted → system shows message: “Could not generate SQL. Try: ‘List all customers with orders.’”
•	6a. Invalid SQL (bad table/column) → system highlights issue and suggests fix.
•	8a. Results empty → system shows: “No results found.”
Postconditions: Query and results are saved in history.
________________________________________
UC-03: Preview & Edit SQL
Actors: Business User (primary), Data Analyst 
Preconditions: SQL is generated from NL prompt.
Main Flow:
1.	User sees generated SQL in preview window.
2.	User edits SQL if needed.
3.	System validates updated SQL (schema + safety).
4.	User clicks Run.
Alternatives/Exceptions:
•	2a. SQL contains unsafe keywords (DROP, DELETE ALL) → system blocks and shows warning: “Dangerous query not allowed.”
Postconditions: Valid SQL is executed; edited SQL is saved to history.
________________________________________
UC-04: Run SQL & View Results
Actors: Business User (primary)
Preconditions: Valid SQL is ready to run.
Main Flow:
1.	User clicks Run Query.
2.	System executes SQL against the database.
3.	Results are returned and displayed in a table.
4.	User can sort/filter results in UI (optional).
Alternatives/Exceptions:
•	2a. Execution error (syntax/runtime) → show error: “Query failed: invalid column ‘xyz’.”
•	3a. No rows returned → system shows: “No results found.”
Postconditions: Results are available for export and saved in history.
________________________________________
UC-05: View History & Re-run
Actors: Business User, Data Analyst
Preconditions: At least one query has been executed.
Main Flow:
1.	User clicks History.
2.	System displays past prompts + SQL + timestamp.
3.	User selects an item.
4.	System loads SQL into editor.
5.	User edits/runs again.
Postconditions: Updated query is saved as a new history item.
________________________________________
UC-06: Export Results
Actors: Business User
Preconditions: Query has results in table.
Main Flow:
1.	User clicks Export.
2.	System offers choice: CSV or JSON.
3.	User selects format.
4.	File is generated and downloaded.
Postconditions: Exported file available on user’s machine.

