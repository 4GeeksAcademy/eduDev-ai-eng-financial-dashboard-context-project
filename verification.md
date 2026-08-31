# Phase 1: Evidence-Based Repository Verification

## Purpose and method

This document establishes a verified baseline for the Financial Metrics Dashboard before later agent-rule or memory-bank work. It maps the repository, explains the runtime flow, and records bounded execution evidence without changing application behavior.

Evidence was collected on **2026-08-31** by:

1. reading repository instructions before inspecting the application;
2. tracing entry points, service configuration, API routes, data transformations, UI components, and tests to exact source lines;
3. comparing documentation claims with configuration and implementation;
4. running only commands supported by the repository's existing Docker, npm, and Python configuration; and
5. classifying major claims as **✅ Verified**, **❌ Incorrect**, or **❓ Unverified**.

Labels used below:

- **Fact**: directly supported by source, configuration, GitHub metadata, or an observed command result.
- **Inference**: a bounded interpretation of verified facts.
- **Unknown**: not established by the inspected repository or this run.

## Instruction and repository baseline

- **Fact:** Root guidance requires checking `./.agents/rules`, `./.agents/skills`, and `./memory-bank` before acting (`AGENTS.md:3-15`).
- **Fact:** All three required locations were absent when checked. Phase 1 did not create them.
- **Fact:** `.atl/` was already untracked at the initial `git status --short` check and was not read, modified, or staged during this phase.
- **Fact:** GitHub CLI metadata reported this repository as `4GeeksAcademy/eduDev-ai-eng-financial-dashboard-context-project`, with `isFork: true` and parent `4GeeksAcademy/ai-eng-financial-dashboard-context-project`.

## Repository, service, and entry-point map

```text
repository root
├── AGENTS.md                    repository-level agent instructions
├── README.md                    assignment summary and local-run guidance
├── docker-compose.yml           frontend/backend development orchestration
├── frontend/
│   ├── Dockerfile               Node/Vite development container
│   ├── index.html               browser document and module entry
│   ├── package.json             frontend dependencies and scripts
│   ├── vite.config.ts           React/Tailwind plugins and /api proxy
│   └── src/
│       ├── main.tsx             React bootstrap entry point
│       ├── App.tsx              data request and dashboard composition
│       ├── components/          KPI cards and Recharts visualizations
│       └── lib/                 API types, KPI/month aggregation, formatting
└── backend/
    ├── Dockerfile               Python/debugpy/Uvicorn development container
    ├── requirements.txt         API and test dependencies
    ├── app/main.py              FastAPI application entry point
    ├── app/routes.py            mock data, transformations, and HTTP routes
    └── tests/test_routes.py     route and data-behavior tests
```

### Services and entry points

| Area | Verified role | Evidence |
|---|---|---|
| Compose | Defines `frontend` and `backend`; frontend depends on backend. | `docker-compose.yml:1-22` |
| Frontend container | Uses Node 24, exposes port 5173, and starts the existing Vite `dev` script on `0.0.0.0:5173`. | `frontend/Dockerfile:1-12`; `frontend/package.json:6-13` |
| Browser entry | `index.html` loads `/src/main.tsx`; `main.tsx` mounts `<App />` into `#root`. | `frontend/index.html:9-12`; `frontend/src/main.tsx:1-10` |
| Frontend application | Fetches `/api/metrics`, computes dashboard values, and renders KPI and chart components. | `frontend/src/App.tsx:13-21`; `frontend/src/App.tsx:23-67` |
| Vite proxy | Proxies browser requests under `/api` to the Compose backend hostname on port 8000. | `frontend/vite.config.ts:7-17` |
| Backend container | Uses Python 3.13 and runs `app.main:app` with debugpy and reload-enabled Uvicorn on port 8000. | `backend/Dockerfile:1-12` |
| Backend application | Creates `Financial Metrics API`, enables permissive CORS, and includes the route module. | `backend/app/main.py:1-14` |
| Backend routes | Exposes health, raw metrics, facets, summaries, top categories, comparisons, alerts, B2B, and B2C endpoints. | `backend/app/routes.py:243-391` |
| Tests | Existing scripts provide Vitest, build, lint, and coverage commands; backend dependencies include pytest and HTTPX. | `frontend/package.json:6-13`; `backend/requirements.txt:1-6` |

## Product and architecture summary

### What the product does

**Fact:** The product is an executive financial dashboard. It presents total income, total outcome, profit, and profit margin (`frontend/src/components/dashboard/dashboard-header.tsx:7-22`; `frontend/src/components/dashboard/kpi-row.tsx:11-45`) plus monthly income/outcome and profit-margin charts (`frontend/src/components/dashboard/income-outcome-chart.tsx:64-120`; `frontend/src/components/dashboard/profit-percent-chart.tsx:65-109`).

**Fact:** The backend does not read a database or external financial service. Each endpoint generates the same seeded set of 360 mock movements: 30 movements for each of 12 months (`backend/app/routes.py:94-104`; `backend/app/routes.py:248-265`). Each movement has a date, amount, operation type, category, and B2B/B2C business type (`backend/app/routes.py:11-27`).

**Fact:** The backend offers additional analytical endpoints for grouping, category ranking, period comparison, anomaly candidates, and business-type segmentation (`backend/app/routes.py:268-391`). The current dashboard fetches only the raw `/api/metrics` collection (`frontend/src/App.tsx:13-21`).

### How the pieces connect

1. The browser loads `frontend/index.html`, which imports `frontend/src/main.tsx` (`frontend/index.html:9-12`).
2. React mounts `App`, which requests `${VITE_API_BASE_URL}/api/metrics`; the default base is an empty string (`frontend/src/main.tsx:6-10`; `frontend/src/App.tsx:13-20`).
3. In the Compose development environment, Vite forwards `/api` to `http://backend:8000` (`frontend/vite.config.ts:9-16`). An optional environment variable can point the browser at another backend origin (`frontend/.env.example:1-4`).
4. FastAPI routes the request to `get_metrics`, regenerates deterministic seeded mock movements, applies optional filters, and returns them chronologically (`backend/app/routes.py:248-259`).
5. The browser calculates overall KPIs and monthly aggregates from the returned records (`frontend/src/App.tsx:29-43`; `frontend/src/lib/financial-utils.ts:21-67`) and passes them to presentational components (`frontend/src/App.tsx:45-67`).

**Inference:** This is a two-service development architecture with client-side dashboard aggregation over a stateless mock API. It is not evidence of a production data pipeline.

## Setup, run, and health instructions

### Repository-evidenced run path

Prerequisite: a working Docker installation with the Compose plugin. No repository file pins a minimum Docker or Compose version.

From the repository root:

```bash
docker compose up --build -d
docker compose ps -a

curl --fail --silent --show-error http://localhost:8000/health
curl --fail --silent --show-error --output /dev/null \
  --write-out 'docs HTTP %{http_code}\n' http://localhost:8000/docs
curl --fail --silent --show-error --output /dev/null \
  --write-out 'openapi HTTP %{http_code}\n' http://localhost:8000/openapi.json
curl --fail --silent --show-error http://localhost:8000/api/metrics

docker compose down
```

If host port 5173 is already occupied, the configured application port remains 5173. A temporary host-only publication can validate the same frontend container without changing repository files or its internal behavior:

```bash
docker compose up --build -d backend
docker compose run -d --name phase1-frontend-5174 --no-deps \
  -p 5174:5173 frontend

curl --fail --silent --show-error http://localhost:5174/
curl --fail --silent --show-error http://localhost:5174/api/metrics

docker rm -f phase1-frontend-5174
docker compose down --remove-orphans
```

This fallback publishes the existing container's internal Vite port 5173 at temporary host port 5174. It does not change the standard URL or Compose configuration.

The configured URLs are:

- Frontend: `http://localhost:5173` (`docker-compose.yml:2-12`; `README.md:39-50`)
- Backend: `http://localhost:8000` (`docker-compose.yml:14-22`; `README.md:48-50`)
- Interactive API documentation: `http://localhost:8000/docs` (`README.md:48-50`)
- OpenAPI schema: `http://localhost:8000/openapi.json` (default FastAPI behavior, confirmed by runtime evidence below)
- Health endpoint: `http://localhost:8000/health` (`backend/app/routes.py:243-245`)

### Actual bounded verification results

| Check | Actual result on 2026-08-31 | Status |
|---|---|---|
| `docker compose config` | Parsed successfully and resolved the two services, their build contexts, volumes, dependency, and published ports. | ✅ Verified |
| `docker compose up --build -d` | Both images built. Backend started, but the command exited unsuccessfully when frontend port `0.0.0.0:5173` was already occupied. | ❌ Partial startup |
| `docker compose ps -a` | Backend was `Up` with ports 8000 and 5678; frontend remained `Created`. | ✅ Observed |
| Port 5173 attribution | `ss` showed an unrelated process already listening. The unrelated page's title did not match this repository's `frontend` title (`frontend/index.html:7`). | ✅ Root cause bounded |
| Temporary frontend publication | `docker compose run -d --name phase1-frontend-5174 --no-deps -p 5174:5173 frontend` started the existing frontend service with host port 5174 mapped to its unchanged internal port 5173. | ✅ Verified |
| Repository frontend HTML | `GET http://localhost:5174/` returned HTTP 200 and `text/html`; its title was `frontend` and it referenced `/src/main.tsx`, matching `frontend/index.html:7-11`. | ✅ Verified |
| Vite proxy integration | `GET http://localhost:5174/api/metrics` returned HTTP 200 and the same 360-record JSON shape, proving the temporary frontend container reached the Compose backend through the configured `/api` proxy. | ✅ Verified |
| `GET /health` | HTTP 200 with `{"status":"ok"}`. | ✅ Verified |
| `GET /docs` | HTTP 200, `text/html; charset=utf-8`. | ✅ Verified |
| `GET /openapi.json` | HTTP 200, `application/json`. | ✅ Verified |
| `GET /api/metrics` | HTTP 200; JSON array with 360 records. First record keys were `amount`, `business_type`, `category`, `create_date`, and `operation_type`. | ✅ Verified |
| Representative metrics item | `{"create_date":"2025-08-01","amount":2570.34,"operation_type":"outcome","category":"administrative","business_type":"B2B"}` | ✅ Verified |
| Backend tests | `docker compose exec -T backend pytest`: 15 passed, 1 Starlette deprecation warning, 0 failures. | ✅ Verified |
| Frontend tests | `docker compose run --rm --no-deps frontend npm test`: 1 file and 5 tests passed. | ✅ Verified |
| Frontend production build | `docker compose run --rm --no-deps frontend npm run build`: succeeded; Vite warned that one minified chunk exceeded 500 kB. | ✅ Verified |
| Cleanup | The one-off frontend container was removed explicitly, and `docker compose down --remove-orphans` removed the backend container and project network. A final Compose state check was empty. | ✅ Verified |

The metrics shape also matches the backend response model (`backend/app/routes.py:22-27`) and the frontend's corresponding interface (`frontend/src/lib/financial-types.ts:5-11`).

## Major-claim verification matrix

| Major claim | Classification | Evidence and boundary |
|---|---|---|
| This repository is a learner/work fork of the official assignment repository. | ✅ Verified | `gh repo view --json nameWithOwner,isFork,parent,url` returned `isFork: true` and the official parent named above. |
| The application has a React/Vite frontend and a FastAPI backend orchestrated by Docker Compose. | ✅ Verified | `docker-compose.yml:1-22`; `frontend/package.json:15-42`; `backend/app/main.py:1-14`; `backend/requirements.txt:1-6` |
| The configured frontend URL is `http://localhost:5173`. | ✅ Verified | `docker-compose.yml:2-7`; `frontend/Dockerfile:10-12`; `README.md:48-50` |
| The standard Compose publication successfully bound this repository's frontend to host port 5173 during this phase. | ❌ Incorrect | An unrelated host process occupied port 5173. This is a bounded environment conflict, not an application failure; the configured URL remains unchanged. |
| The existing frontend service can serve this repository without changing its internal configuration when published temporarily on host port 5174. | ✅ Verified | HTTP 200 from `http://localhost:5174/` returned the repository's `frontend` title and `/src/main.tsx` entry (`frontend/index.html:7-11`). |
| The frontend-to-backend path works through Vite's `/api` proxy. | ✅ Verified | `GET http://localhost:5174/api/metrics` returned HTTP 200 with 360 expected records; proxy target configuration is at `frontend/vite.config.ts:9-16`. |
| The backend health endpoint is operational when the backend container starts. | ✅ Verified | Runtime HTTP 200 and `{"status":"ok"}`; implementation at `backend/app/routes.py:243-245`. |
| FastAPI documentation and OpenAPI are available. | ✅ Verified | Runtime HTTP 200 from `/docs` and `/openapi.json`; FastAPI app creation at `backend/app/main.py:6-14`. |
| `/api/metrics` returns the financial movement shape expected by the frontend. | ✅ Verified | Runtime array of 360 matching records; models at `backend/app/routes.py:22-27` and `frontend/src/lib/financial-types.ts:5-11`. |
| The dashboard derives KPIs and chart series in the frontend. | ✅ Verified | Fetch/state flow at `frontend/src/App.tsx:23-43`; calculations at `frontend/src/lib/financial-utils.ts:21-67`. |
| The dashboard currently consumes all backend analytical endpoints. | ❌ Incorrect | It only calls `/api/metrics` (`frontend/src/App.tsx:13-20`); the additional endpoints are implemented at `backend/app/routes.py:262-391`. |
| The application uses persistent or live financial data. | ❌ Incorrect | Route handlers regenerate seeded mock records (`backend/app/routes.py:94-104`; `backend/app/routes.py:248-265`). |
| The displayed `2024 - Full Year` period is derived from the returned data. | ❌ Incorrect | It is hard-coded in `frontend/src/App.tsx:49`; runtime records spanned dates generated relative to the current date (`backend/app/routes.py:65-104`). |
| The project is production-ready, secure, and scalable. | ❓ Unverified | No deployment, load, threat-model, authentication, authorization, persistence, or production-operability evidence was evaluated in Phase 1. |

## Correction trail

| Earlier statement or inference | Verification | Correction |
|---|---|---|
| A previous mapper inferred from the remote URL that this appeared to be the official repository rather than a learner fork. | `gh repo view --json nameWithOwner,isFork,parent,url` reported `isFork: true` and parent `4GeeksAcademy/ai-eng-financial-dashboard-context-project`. | Treat this repository as the learner/work fork. Repository identity must be verified from GitHub metadata, not inferred from the owner or remote URL. |

No additional agent mistakes are asserted in this phase.

## Known unknowns and boundaries

- **Unknown:** Supported production deployment topology, hosting platform, domain, TLS termination, and environment-variable policy.
- **Unknown:** Intended persistence layer or source of real financial data; none exists in the inspected implementation.
- **Unknown:** Authentication, authorization, tenant isolation, and financial-data privacy requirements.
- **Unknown:** Visual rendering, chart interaction, responsive layout, and browser-console behavior were not evaluated because Phase 1 used HTTP verification without browser automation. Serving the repository HTML and the complete frontend-to-backend proxy path were verified on temporary host port 5174.
- **Unknown:** Minimum supported Docker/Compose versions and non-Docker local setup; the repository documents only the Compose run path (`README.md:39-50`).
- **Boundary:** Phase 1 did not create `.agents/rules`, `.agents/skills`, or `memory-bank`; did not alter source behavior; did not install or add dependencies; and did not modify `.atl/`.
- **Boundary:** Dependency vulnerability remediation, the backend deprecation warning, the frontend chunk-size warning, and the hard-coded display period were observed but not changed because remediation is outside Phase 1.

## Phase 1 acceptance checklist

- [x] Repository instructions and required context locations checked first.
- [x] Missing `.agents/rules`, `.agents/skills`, and `memory-bank` recorded without creating them.
- [x] Repository, services, entry points, product behavior, and request flow mapped to exact evidence.
- [x] Major claims classified as verified, incorrect, or unverified.
- [x] Real fork-inference correction recorded without inventing agent mistakes.
- [x] Existing Compose path exercised; backend health, API docs/OpenAPI, and representative metrics verified.
- [x] Existing backend tests, frontend tests, and frontend build executed successfully.
- [x] Environmental host-port conflict recorded without changing the configured frontend URL.
- [x] Repository frontend HTML served successfully through temporary host port 5174.
- [x] `/api/metrics` verified through the frontend container's Vite proxy to the Compose backend.
- [x] One-off frontend and Compose backend containers and project network removed after evidence collection.
- [x] Phase 1 produced only this dedicated `verification.md` artifact and changed no application behavior.
