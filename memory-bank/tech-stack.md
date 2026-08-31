# Technology Stack

## Declared application technologies

| Layer | Fact | Evidence |
|---|---|---|
| Frontend language/runtime | TypeScript/TSX compiled for ES2023; React 19 is the UI framework; Node 24 Alpine is the declared container base. | `frontend/tsconfig.app.json:1-27`; `frontend/package.json:15-22`; `frontend/Dockerfile:1-12` |
| Frontend build/style/charting | Vite 8, the React and Tailwind Vite plugins, Tailwind CSS 4, and Recharts 3 are direct manifest dependencies. | `frontend/package.json:15-42`; `frontend/vite.config.ts:1-23` |
| Backend language/runtime | Python 3.13 Slim is the declared container base; FastAPI supplies the API and Pydantic models; Uvicorn serves `app.main:app`. | `backend/Dockerfile:1-12`; `backend/requirements.txt:1-6`; `backend/app/main.py:1-14`; `backend/app/routes.py:8-62` |
| Infrastructure | Docker Compose defines bind-mounted frontend and backend development services; frontend depends on backend. | `docker-compose.yml:1-22` |
| Tests and quality | ESLint, TypeScript, Vitest, pytest, pytest-cov, and HTTPX are declared directly. | `frontend/package.json:6-13`, `frontend/package.json:24-42`; `backend/requirements.txt:4-6` |

## Direct dependencies

The frontend's direct runtime dependencies are `class-variance-authority`, `clsx`, `lucide-react`, `react`, `react-dom`, `recharts`, and `tailwind-merge` (`frontend/package.json:15-23`). Its direct development dependencies are listed in `frontend/package.json:24-42`, including ESLint, TypeScript, Vite, Vitest, React/Tailwind plugins, coverage, and type packages.

The backend requirements directly name `fastapi`, `uvicorn[standard]`, `debugpy`, `pytest`, `pytest-cov`, and `httpx` without version constraints (`backend/requirements.txt:1-6`).

**Boundary:** Manifest entries and container base tags are direct declarations. Transitive packages, framework defaults, and behavior not configured in repository files must not be treated as direct project choices. For example, `/docs` and `/openapi.json` are FastAPI defaults that were confirmed at runtime, not explicit route declarations (`verification.md:144-146`, `verification.md:167-168`).

## Services, entry points, and ports

| Service | Entry point and development behavior | Configured ports |
|---|---|---|
| Frontend | `frontend/index.html` loads `/src/main.tsx`; React mounts `App`. The container runs `npm run dev -- --host 0.0.0.0 --port 5173`. | Host/container `5173:5173` (`frontend/Dockerfile:10-12`; `docker-compose.yml:2-12`; `verification.md:59-60`) |
| Backend | FastAPI application `app.main:app`; the container starts debugpy and reload-enabled Uvicorn. | API `8000:8000`; debugger `5678:5678` (`backend/Dockerfile:10-12`; `docker-compose.yml:14-22`) |

Configured development URLs are frontend `http://localhost:5173`, backend `http://localhost:8000`, API documentation `http://localhost:8000/docs`, OpenAPI `http://localhost:8000/openapi.json`, and health `http://localhost:8000/health` (`README.md:39-50`; `backend/app/routes.py:243-245`; `verification.md:125-131`).

**Port boundary:** Host port 5173 was occupied during Phases 1 and 3. Validation temporarily published the unchanged container port 5173 on host port 5174. Port 5174 is not repository configuration and must not replace the configured frontend URL (`verification.md:109-123`; `rule-validation.md:161-174`).

## Configuration and request routing

- Vite listens on all container interfaces and proxies `/api` to `http://backend:8000` (`frontend/vite.config.ts:7-17`).
- `VITE_API_BASE_URL` is an optional backend-origin override; its declared default example is empty because local development uses the proxy (`frontend/.env.example:1-4`; `frontend/src/App.tsx:13-20`). No environment-specific value is documented here.
- The `@` frontend import alias resolves to `frontend/src` (`frontend/vite.config.ts:18-22`; `frontend/tsconfig.app.json:10-14`).
- FastAPI currently allows all CORS origins, methods, and headers with credentials. This is a source fact, not evidence of a production security policy (`backend/app/main.py:6-14`; `.agents/rules/R-04-api-contract-and-cors.md:20-38`).
- Backend movement fields and literals are modeled in Python and mirrored by TypeScript interfaces (`backend/app/routes.py:11-27`; `frontend/src/lib/financial-types.ts:1-11`).

## Existing commands

Use the repository's existing Compose path; do not install host tooling merely to run checks (`.agents/rules/R-05-containerized-boundary-verification.md:21-29`).

```bash
# Standard development startup documented by the repository
docker compose up --build

# Frontend checks exercised in Phase 3
docker compose run --rm --no-deps frontend npm run lint
docker compose run --rm --no-deps frontend npm test
docker compose run --rm --no-deps frontend npm run build

# Backend test command exercised in Phase 1
docker compose exec -T backend pytest

# Cleanup required after runtime verification
docker compose down --remove-orphans
```

The corresponding package scripts are `dev`, `build`, `lint`, `preview`, `test`, `test:watch`, and `test:coverage` (`frontend/package.json:6-13`). Command results are evidence only for the dated runs recorded in `verification.md:133-152` and `rule-validation.md:152-176`.

## Test coverage boundary

- Frontend tests cover KPI/month aggregation and formatting: five tests in one Vitest file (`frontend/src/lib/financial-utils.test.ts:1-114`; `rule-validation.md:158-160`).
- Backend `TestClient` tests cover data generation, filtering, health, segmentation, facets, summaries, ranking, comparison, and alerts: fifteen tests in the latest backend run (`backend/tests/test_routes.py:1-189`; `verification.md:149-150`).
- No declared browser-automation command or rendered `App`/component test was found. HTTP checks do not establish visual or browser behavior (`frontend/package.json:6-42`; `engineering-findings.md:96-104`; `rule-validation.md:178-184`).
