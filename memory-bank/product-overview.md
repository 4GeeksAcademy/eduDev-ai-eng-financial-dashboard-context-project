# Product Overview

## Demonstrated product

**Fact:** The repository implements a financial metrics dashboard. Its interface identifies itself as a “Financial Overview” and “Executive metrics dashboard,” displays total income, total outcome, profit, and profit margin, and provides monthly income/outcome and profit-margin charts (`frontend/src/components/dashboard/dashboard-header.tsx:7-22`; `frontend/src/components/dashboard/kpi-row.tsx:11-45`; `frontend/src/components/dashboard/income-outcome-chart.tsx:64-120`; `frontend/src/components/dashboard/profit-percent-chart.tsx:65-109`).

**Inference:** The wording suggests an executive-summary use case. The repository does not identify actual user roles, organizations, access boundaries, or external consumers, so those remain **unknown**.

## Core data flow

1. The browser entry mounts React's `App` (`frontend/src/main.tsx:1-10`).
2. `App` makes the frontend's sole active request to `${VITE_API_BASE_URL}/api/metrics`; the base defaults to an empty string (`frontend/src/App.tsx:13-20`; `rule-validation.md:50-75`).
3. In the declared development environment, Vite proxies `/api` to the backend service at `http://backend:8000` (`frontend/vite.config.ts:7-17`).
4. FastAPI generates 360 seeded mock movements, applies optional date/category/operation filters, sorts them chronologically, and returns the typed collection (`backend/app/routes.py:65-104`; `backend/app/routes.py:248-259`). Dates are relative to `date.today()`, so seeded values do not establish a fixed calendar year (`backend/app/routes.py:65-104`; `.agents/rules/R-02-date-period-coherence.md:20-27`).
5. The frontend computes KPI totals and year-month chart points from the returned raw movements, then passes those values to presentational components (`frontend/src/App.tsx:23-67`; `frontend/src/lib/financial-utils.ts:21-67`).

**Inference:** This is a two-service development architecture with client-owned aggregation over a stateless mock API. It is not evidence of a production financial-data pipeline (`verification.md:67-85`).

## Capability boundary

| Capability | State | Evidence |
|---|---|---|
| Raw financial movements with date, amount, operation type, category, and B2B/B2C classification | Active dashboard source | `backend/app/routes.py:22-27`, `backend/app/routes.py:248-259`; `frontend/src/lib/financial-types.ts:1-11` |
| KPI and monthly chart aggregation | Active in the frontend | `frontend/src/App.tsx:29-43`; `frontend/src/lib/financial-utils.ts:21-67` |
| Loading, request-error, and empty-data states | Implemented in source; browser behavior not verified | `frontend/src/App.tsx:23-67`; `frontend/src/components/dashboard/income-outcome-chart.tsx:49-78`; `frontend/src/components/dashboard/profit-percent-chart.tsx:50-79`; `rule-validation.md:178-184` |
| Health, facets, summaries, top categories, comparisons, alerts, and B2B/B2C routes | Implemented and route-tested; no repository frontend consumer was found for the analytical routes | `backend/app/routes.py:243-391`; `backend/tests/test_routes.py:29-189`; `engineering-findings.md:30-38` |
| Former fixed-2024 frontend mock collection | Removed in Phase 3 after declaration/import/consumer checks; no fallback replaced it | `rule-validation.md:21-75`, `rule-validation.md:77-89`; Phase 3 commit `37c7de4` |

The active frontend source is therefore the backend `/api/metrics` path. The previously unused fixed mock module was removed in Phase 3, and no replacement runtime data source or silent fallback was introduced (`rule-validation.md:5-19`; `rule-validation.md:69-75`).

## Explicit non-claims and unknowns

- **Not claimed:** production readiness, security, scalability, or a reviewed deployment policy. Current source shows permissive CORS, while production origins, authentication, privacy requirements, deployment topology, external API consumers, and production data volume remain unknown (`backend/app/main.py:6-14`; `.agents/rules/R-04-api-contract-and-cors.md:36-38`; `.agents/rules/R-01-api-ui-data-ownership.md:42-44`).
- **Not claimed:** live or persistent financial data. Each route regenerates seeded mock data; no database or external financial source is present in the demonstrated flow (`backend/app/routes.py:94-104`; `backend/app/routes.py:248-391`).
- **Unknown:** authentication, authorization, tenant isolation, privacy requirements, and allowed production CORS origins (`.agents/rules/R-04-api-contract-and-cors.md:36-42`).
- **Unknown:** external API consumers or non-imported teaching uses. Absence of a repository frontend consumer does not disprove either (`.agents/rules/R-01-api-ui-data-ownership.md:36-44`; `.agents/rules/R-03-single-mock-data-source.md:34-40`).
- **Known mismatch, unresolved product decision:** `App` passes `2024 - Full Year`, while generated dates roll relative to the current date and chart labels derive from returned records (`frontend/src/App.tsx:45-50`; `backend/app/routes.py:65-104`; `frontend/src/lib/financial-utils.ts:36-67`). Desired period semantics are unknown and must not be invented (`.agents/rules/R-02-date-period-coherence.md:36-42`).
- **Not claimed:** visual rendering, accessibility, chart interaction, responsiveness, or browser-console coverage. Existing runtime checks proved repository HTML and the proxy path over HTTP, not browser behavior (`rule-validation.md:165-181`).
