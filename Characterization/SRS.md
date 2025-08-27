## Introduction

This system allows users to query a database using natural language. The tool converts natural language prompts into SQL, validates queries, executes them safely, and returns results in a user-friendly format.

## Functional Requirements

* The system shall allow users to upload a .db file.

* The system shall convert natural language prompts into SQL using GPT.

* The system shall validate generated SQL against the database schema.

* The system shall execute safe queries and display results in tabular format.

* The system shall provide error messages if the prompt cannot be converted, if SQL execution fails, or if results are empty.

* The system shall maintain a history of executed queries.

* The system shall allow exporting results in CSV or JSON.

## Non-Functional Requirements

* Performance: Query translation should complete in under 2 seconds.

* Security: System must prevent SQL injection attacks.

* Usability: The interface should be intuitive, with tooltips and example prompts.

## System Constraints

* For now, the system only support .sql/nosql files.