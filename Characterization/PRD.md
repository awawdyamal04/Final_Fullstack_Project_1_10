//Amal
Product Requirements Document (PRD)  
Project: Dell–Tsofen Capstone – Natural Language to SQL Interface  
Date: 27/08/2025 
Version: 1.0  

=============================================
The Story Begins – Why We’re Building This  
Imagine a business analyst at Dell who needs to understand customer orders quickly. She has the data, but it’s locked away in a database. Every time she wants an answer, she either waits for a database administrator to write a SQL query or struggles herself with complicated syntax.  

This waiting slows down decision-making. What if, instead, she could simply ask:  
"Show me the top 5 selling products this year."  

And instantly, the system responds with a clean table of results — without her writing a single line of SQL..  

That’s the story behind our project: giving people the freedom to explore data in the way they think, not in the way the computer demands.  

===============================================
Our Vision – What We Aim For  
We want to create a tool that transforms natural language into SQL safely and intelligently. A tool that listens to how users speak, understands the database’s structure, and responds in seconds with the right answers.  

Our product is not just about writing queries. It’s about:  
Empowering users to explore data without technical barriers.  
Accelerating decisions by removing the waiting time for specialists.  
Making data exploration simple, intuitive, and even enjoyable.  

Success for us means that any employee at Dell — whether they know SQL or not — can open our interface, ask a question in plain English, and get accurate, reliable answers.  

===============================================

The World We Are Building – Scope of the Product  
At the heart of our solution is a conversation with data.  

Users will:  
Upload their database file (.db).  
Type a question in natural language.  
Watch as our system transforms that question into safe, valid SQL.  
See results appear neatly in a table.  

They will also be able to:  
Edit or refine the SQL if they choose.  
Export results to CSV or JSON for later use.  
Look back at past questions through a saved history.  
Learn through examples and tooltips that guide them in writing effective prompts.  

What we’re not building right now: flashy dashboards, advanced BI visualizations, or enterprise-scale analytics. This is a focused tool: plain language in → SQL out → results visible.  

===============================================

The Characters – Who Will Use This  
The Analyst – She wants quick answers from the database, without relying on IT.  
The Manager – He wants insights fast to make decisions in meetings.  
The Developer – He already knows SQL but likes the convenience of asking in natural language and refining the query later.  
The New Employee – He doesn’t know SQL at all but can still interact with data on day one.  

===============================================

How the Story Unfolds – User Journeys  
A user uploads a database file with customer and order tables.  
He types: "List all customers in New York."  
Our system translates this into SQL, validates it, and runs it safely.  
The user sees a clean table of names and locations.  
Later, he asks: "Now sort them by date." – the system understands the follow-up and adjusts the SQL.  
Finally, he exports the results to CSV for his report.  

This is not just interaction. It’s a conversation with data.  

What the System Must Do – Requirements in Action  
Understand language: Recognize synonyms like "clients" = "customers".  
Translate to SQL: Generate safe, schema-validated SQL queries.  
Protect the system: Prevent harmful queries and ensure file validation.  
Respond clearly: Give friendly messages when something fails — not cryptic errors.  
Stay helpful: Keep history, allow edits, and export results.  
Be approachable: Guide users with examples and tooltips.  

===============================================

The Values Behind the Product – Non-Functional Qualities  
Speed: Answers in seconds, not minutes.  
Clarity: Results are always readable and well-structured.  
Security: Every query is checked and safe.  
Simplicity: The interface is as easy as chatting with a colleague.  
Reliability: Errors are explained, never hidden.  

===============================================

The Boundaries of Our World – Assumptions & Constraints  
We assume our users have SQLite databases ready to upload.  
We assume internet access is available, since the system depends on the OpenAI GPT API.  
We accept that the system will start simple — Linux terminal first — and grow over time.  

===============================================

The Ending We Aim For – Acceptance Criteria  
Users can upload a database, ask a natural language question, and get the right answer.  
If the system cannot answer, it explains why — not just "error."  
Users can refine, repeat, and export their results.  