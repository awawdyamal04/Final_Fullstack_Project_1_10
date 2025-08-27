Business Requirements Document (BRD)

Project: Dell–Tsofen NL→SQL / Natural-Language Data Exploration
Version: 1.1
Date: 2025-08-27
Owner: Product Lead (Student Team)
Audience: Engineering, Data, Product, QA, DevOps, Security

Revision History

v1.1 (2025-08-27): Language tightened; added Constraints, Data Classification, API/CLI Appendix, and clearer acceptance criteria.
v1.0 (2025-08-27): Initial draft.

1. Executive Summary

Modern data consumers at Dell need to explore data without waiting for DBAs or analysts to write queries or build dashboards. This project delivers a cross-engine interface that turns natural language into safe, validated queries (SQL for relational DBs and aggregation pipelines for MongoDB), executes them in read-only mode, and returns clear tabular results with optional explanations and export.

The solution supports:

NL→SQL/Mongo generation with schema-aware validation and safety guards.

Preview and edit of the generated query, plus manual run endpoints.

CLI interface (Linux terminal) and optional web UI for broader adoption.

History and export (CSV/JSON) with persistence across restarts.

Extensible synonyms/dictionary so “clients = customers”, “location = city”, etc.

Works across multiple products/schemas by loading a new schema and synonym set.

Business outcomes: faster insight cycles, reduced dependency on specialists, productivity gains for engineers, analysts, and business users.

2. Problem / Need

Data exploration is slow and centralized; users wait for specialists to write queries.

Users prefer to ask questions the way they think rather than learning SQL or BI tooling.

Teams repeatedly build dashboards to answer similar exploratory questions.

Interface fragmentation: different products have different tools and schemas.

Need a single, safe, consistent entry point to interrogate data via natural language.

3. Goals and Non-Goals
3.1 Goals

Enable users to ask data questions in natural language and get reliable results fast.

Generate safe, read-only SQL (SELECT/WITH) or MongoDB aggregation pipelines.

Validate generated queries against the active database schema.

Provide a preview of the generated query and allow manual editing before run.

Offer a CLI interface; optional web UI for broader audiences.

Persist history and allow export to CSV/JSON.

Support multi-schema operation so the same interface works across products.

Provide clear, actionable error messages.

3.2 Non-Goals (Initial Phases)

Full-featured BI dashboarding; heavy visualization beyond tabular results.

Write/update operations (INSERT/UPDATE/DELETE).

Data lineage or full governance suite.

Auto-join inference beyond defined foreign keys (initially).

4. Stakeholders

Business Owner / Sponsor: Dell program lead / Tsofen faculty.

Product: Defines personas, requirements, roadmap, and KPIs.

Engineering (Backend, Data, DevOps): Implements NL→Query, safety checks, schema services, and deployment.

Security and Compliance: Reviews data handling, API key usage, PII controls.

Pilot Users: Analysts, PMs, engineers from multiple Dell product teams.

5. User Personas

Product Manager (PM): Asks high-level questions about customers, orders, trends. No SQL skills.

Data-savvy Engineer: Knows schemas and wants speed; edits preview and runs safely.

Support / Operations: Needs quick counts or top-N without building dashboards.

6. Scope
6.1 In Scope (MVP → Phase 1/2)

Load small example datasets (CSV→SQLite, CSV→Mongo) and/or accept existing .db files.

NL→SQL/Pipeline with schema-aware translation and safety guards.

Preview plus optional manual run endpoints (/sql/run, /mongo/run).

Error handling: cannot convert, syntax errors, empty results, bad file types.

History persistence and export (CSV/JSON).

Synonyms dictionary (configurable).

CLI interface (Linux terminal) and optional light web UI.

Explain endpoint: summarize what the SQL/pipeline does.

6.2 Out of Scope (Initially)

Authentication/SSO, RBAC, audit trails (can be Phase 3+).

Very large datasets / distributed query engine.

Complex visualization (charts).

Live collaboration or multi-user chat threads.

Advanced model fine-tuning.

6.3 Constraints

C1: Read-only execution enforced at the service level for all engines.
C2: MVP targets SQLite and MongoDB only; connectors are future scope.
C3: Offline-friendly development; no reliance on external network for local demos beyond LLM calls.
C4: Budget constraints require use of free/open-source components where possible.

7. Assumptions and Dependencies

Access to OpenAI (or equivalent) API for NL interpretation (configurable / mockable).

Data sources are available as CSV or .db during prototyping.

No PII is sent to third-party LLMs by default; only schema metadata and user prompts by default.

Node.js runtime available; MongoDB and SQLite for engine parity.

For enterprise adoption, add SSO, logging, audit, and VPC/private networking later.

8. High-Level Solution Overview

Engines: SQLite (SQL) and MongoDB (aggregation).

Services:

Schema service (introspect tables/collections, columns/fields, foreign keys).

NL→Query service (uses LLM with schema and synonyms dictionary).

Safety service: SQL guard (read-only), Mongo guard (blocks $out/$merge).

Query executor (read-only).

History and export service (persist last results and history to files).

Explain service (human-readable summary of queries).

Interfaces: CLI; REST API; optional web (HTML/CSS).

Configuration: Per schema and per product; synonym maps and table aliases.

Architecture Reference

See project artifact “Workflow Diagram.pdf” for high-level flow.

9. Functional Requirements (Business-Level)

FR-1 Natural Language to Query: Convert a user prompt into SQL (SELECT/WITH) or Mongo pipeline aligned to the active schema.
FR-2 Safe Execution: Execute SQL/pipelines in read-only mode; reject unsafe constructs.
FR-3 Preview & Edit: Show the generated SQL/pipeline; allow user to submit an edited version.
FR-4 Schema Awareness: Validate table/field names and foreign keys before execution.
FR-5 Synonyms & Context: Map business terms to schema terms (e.g., “clients”→customers).
FR-6 Result Presentation: Return tabular results with column headers and row counts.
FR-7 Error Messaging: Clear messages for (a) cannot convert, (b) invalid schema, (c) syntax errors, (d) empty results.
FR-8 History & Export: Store query history and last result; export CSV/JSON.
FR-9 Multi-Product: Load different schemas/synonyms to reuse the interface across products.
FR-10 CLI Interface: Provide Linux-friendly commands (engine, build, run, schema, export).
FR-11 Explainability: Provide a textual explanation of the SQL/pipeline steps.
FR-12 File Validation: Validate uploaded file types and reject unsupported formats.
FR-13 Optional Web UI: Text area + preview + results table + explain + export.

10. Non-Functional Requirements (NFRs)

Security

SQL safety: block INSERT/UPDATE/DELETE/DROP/ALTER/...; allow only SELECT/WITH; single statement.

Mongo safety: block $out/$merge; pipelines must be arrays.

Do not send raw data rows to LLMs by default; only schema and prompt.

Harden API keys (env vars, never commit).

Basic rate limiting (future), input size limits.

Performance

P95 end-to-end (prompt→results) ≤ 3–5s on MVP datasets.

Support datasets up to ~100k rows per table for prototypes; pagination for larger.

Reliability

Idempotent read paths.

Error handling and graceful fallbacks; logs for failures.

Usability

Clear phrasing in errors and explain text.

Consistent field naming and sorting defaults.

Scalability (Future)

Ability to add connectors (PostgreSQL/MySQL/Databricks/…).

Configurable LLM provider.

Compliance and Privacy

Configurable PII redaction rules (future).

Logs must not include raw result sets (future).

Accessibility (Web UI)

Keyboard-friendly, high contrast, logical reading order.

Availability and Observability

Target availability for MVP: best-effort (non-SLA) with automated restarts on failure.
Basic logging of request/response metadata (no raw results) and error traces.

11. Data and Schema Baseline (Example)

Customers (id, name, city)
Orders (id, customer_id, date, total) with FK orders.customer_id → customers.id.

Sample queries the system must handle:

“Show clients with their location” → SELECT name, city FROM customers;

“Get top 5 customers by total this year” → JOIN orders + SUM(total) + GROUP BY name + ORDER BY DESC + LIMIT 5 (year = now or specified).

Data Classification

Default classification: Internal. No production PII processed during MVP. If sample datasets contain pseudo-PII, they must be synthetic or anonymized.

12. Objectives and Success Metrics

Adoption: ≥ 20 weekly active users in pilot phase.

Latency: ≥ 90% of requests under 3s (prototype data).

Accuracy: ≥ 85% first-attempt success (correct table/field usage).

Safety: 0 production incidents caused by unsafe queries.

Satisfaction: PM/Analyst survey ≥ 4.3/5 after 4 weeks.

13. Risks and Mitigations

R1: Incorrect query generation → Mitigate with schema validation, preview/edit, and explain.

R2: Data exposure to LLM → Send only schema/prompt; add opt-in for sample values if needed.

R3: Performance on large data → Add pagination, sampling, and push-down filters.

R4: Ambiguous prompts → Ask clarifying questions; maintain synonym dictionaries.

R5: Security bypass → Enforce guards server-side; add tests and code reviews.

14. Release Plan / Phases and Milestones

Phase 1 (MVP): Engines (SQLite/Mongo), NL→Query, Preview, Safety, History/Export, CLI, basic Explain.
Phase 2: Web UI (HTML/CSS), synonyms admin, better error taxonomy, more examples/tooltips.
Phase 3: AuthN/AuthZ, connectors to production DBs, pagination, caching.
Phase 4: Auto-suggest as you type, chat-style follow-ups (“Now sort by date”), observability, cost controls.

Milestones (illustrative):

M1: MVP backend complete and CLI (Week 2).

M2: Web UI beta (Week 3).

M3: Pilot in 1–2 product teams (Week 4–5).

M4: Phase-2 capabilities plus security review (Week 6+).

15. Acceptance Criteria (Representative)

Can load CSVs to SQLite/Mongo or use .db directly.

Prompts like “show clients with their location” and “top 5 customers this year” return correct results.

Unsafe SQL and Mongo pipelines are rejected with clear messages.

Preview, edit, and manual run endpoints are available and work.

Results can be exported to CSV/JSON; history survives restarts.

Explain endpoint returns a sensible summary for both SQL and pipelines.

MVP Exit Criteria (Measured)

E1: Achieve ≥ 85% first-attempt accuracy on a 20-query test set across both engines.
E2: P95 latency ≤ 5s on the sample datasets; ≥ 90% requests under 3s.
E3: History and export verified across restart scenarios.
E4: Security guards verified by unit tests blocking unsafe statements/stages.

16. Open Questions

Which identity provider (SSO) is preferred for enterprise rollout?

Which additional data sources/connectors are highest priority?

Data residency constraints (EU/US/IL)? Any customer PII/PDI to be masked?

Preferred LLM provider and model sizing for on-prem vs. cloud?

17. Appendix A: Public API (MVP, illustrative)

REST Endpoints (subject to refinement):

GET /health → Service health.
POST /nl/sql → { prompt, schemaId } → { sql, explanation }.
POST /nl/mongo → { prompt, schemaId } → { pipeline, explanation }.
POST /sql/run → { sql, engine, connectionId? } → { rows, headers }.
POST /mongo/run → { pipeline, connectionId? } → { documents }.
GET /history → { items }.
GET /export?format=csv|json → file stream of last result.

All write operations disabled. Requests validated against loaded schema metadata.

18. Appendix B: CLI (MVP, illustrative)

Commands:

nlq build-schema --from csv --engine sqlite --out schema.json
nlq prompt "top 5 customers this year" --engine sqlite --schema schema.json
nlq preview --engine sqlite
nlq run --sql "SELECT ..." --engine sqlite
nlq export --format csv

19. Glossary

NLQ: Natural Language Query.

Preview: Generated SQL or aggregation pipeline before execution.

Synonyms: Mapping from business terms to schema fields/tables.

Read-only guard: Safety rules permitting SELECT/WITH (SQL) and forbidding $out/$merge (Mongo).

Export: Download of last query results as CSV/JSON.