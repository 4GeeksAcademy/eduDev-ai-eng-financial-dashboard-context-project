# Phase 2: Engineering Findings and Proposed Guardrails

## Executive summary

The smallest useful Phase 3 policy is five evidence-backed rules: preserve the current API-to-UI data ownership unless a product decision changes it, keep relative dates and displayed periods coherent, maintain one active mock-data source, protect backend contracts and deployment-sensitive CORS settings, and verify edits through the repository's existing containerized commands.

These are guardrails for future edits, not a request to redesign the product. In particular, client-side aggregation, unused analytical endpoints, rolling mock dates, the hard-coded period, and permissive CORS are evidenced risks or decision points; this phase does not assume that each one must be fixed.

## Evidence standard and boundaries

- **Authoritative baseline:** Phase 1 commit `b4c2134` and `verification.md`, including its correction trail and explicit unknowns (`verification.md:156-191`).
- **Phase 2 evidence:** current tracked source, configuration, tests, documentation, import search, and bounded command results. Findings below separate facts from implications, risks, and unknowns.
- **No behavior change:** this phase adds only this document. It does not change application code, dependencies, runtime configuration, agent rules, the memory bank, or `.atl/`.
- **Product boundary:** authentication, persistence, privacy requirements, production deployment, browser rendering, and scalability remain unverified (`verification.md:173-190`). Proposed rules must not fill those gaps with assumptions.

## Findings

### Architecture and data flow

#### F-ARCH-01 — The dashboard owns aggregation over the raw API collection

- **Fact:** `App` fetches only `/api/metrics`, then computes KPIs and monthly chart points in the browser (`frontend/src/App.tsx:13-20`, `frontend/src/App.tsx:29-43`). The calculations filter and reduce raw movements and group them by local year-month (`frontend/src/lib/financial-utils.ts:21-67`). Phase 1 verified the proxy path and a 360-record response (`verification.md:143-154`).
- **Implication:** edits to the raw movement contract or frontend aggregation can change every KPI and chart without changing a backend analytical route.
- **Risk:** moving calculations between layers piecemeal could create two competing definitions of income, outcome, net, or profit percentage. Returning all raw records may also become a scalability concern if the mock boundary is later replaced, but no production volume is established.
- **Unknown:** whether the intended product architecture is client-owned aggregation or migration to backend summaries.
- **Proposed rule:** **R-01** — Treat `/api/metrics` plus `computeKPIs`/`computeMonthlyData` as the current dashboard contract. Do not move, duplicate, or redefine aggregation across layers without an explicit product decision and tests proving equivalent user-visible values.
- **Rule scope:** `frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, and backend metric response models/routes.
- **Phase 3 validation:** confirm the dashboard still has one active fetch path, run the focused frontend utility tests, and compare representative raw records with the declared frontend type and backend response model.

#### F-ARCH-02 — Backend analytical endpoints exist in parallel but are not UI consumers

- **Fact:** the backend exposes facets, summary, top-category, comparison, alert, B2B, and B2C routes (`backend/app/routes.py:262-391`). A source search found the only frontend API request at `frontend/src/App.tsx:16`; Phase 1 independently classified the claim that all endpoints are consumed as incorrect (`verification.md:168-171`).
- **Implication:** backend endpoint availability is not evidence of a frontend requirement, and frontend behavior is not coverage for those endpoints.
- **Risk:** a contributor could delete apparently unused endpoints or switch the UI to them without understanding an external consumer or intended assignment extension.
- **Unknown:** whether any consumer outside this repository uses these routes.
- **Proposed rule:** **R-01** — Preserve the current consumer boundary. Treat adopting or removing an analytical endpoint as a product/API decision, not cleanup; require route-level tests and an explicit consumer trace.
- **Rule scope:** `backend/app/routes.py`, `backend/tests/test_routes.py`, and frontend request code.
- **Phase 3 validation:** search all frontend request sites, enumerate FastAPI routes from source or OpenAPI, and verify that any changed endpoint has both a named consumer and focused route tests.

### Date and mock-data behavior

#### F-DATA-01 — Seeded values are repeatable for a run, but generated years depend on the current date

- **Fact:** every metrics route calls `generate_mock_movements(seed=42)` (`backend/app/routes.py:248-391`). The function seeds the module-level random generator, calls `date.today()`, and assigns each month to the current or previous year relative to the current month (`backend/app/routes.py:65-104`). Existing generation tests assert only record count and chronological order (`backend/tests/test_routes.py:12-16`).
- **Implication:** amounts and categories are seeded, while absolute dates roll with the calendar. A fixture or assertion using a fixed year can age even when application code does not change.
- **Risk:** calendar-bound tests, screenshots, filters, or documentation can become stale; module-level random seeding can also affect later code sharing the same random generator.
- **Unknown:** whether rolling dates are an intentional product requirement or only a mock-data convenience.
- **Proposed rule:** **R-02** — For date-sensitive edits, distinguish seeded values from the relative calendar. Do not assert a fixed generated year unless the reference date is explicitly controlled; validate chronological and period-boundary behavior instead.
- **Rule scope:** backend mock generation, date filters/comparisons, frontend period labels, and date-dependent tests/docs.
- **Phase 3 validation:** add or run a focused test with a controlled reference date, or document why only relative invariants are asserted; execute it at a year/month boundary case.

#### F-DATA-02 — The displayed period conflicts with the active rolling data source

- **Fact:** `DashboardHeader` always receives `period="2024 - Full Year"` (`frontend/src/App.tsx:45-50`), while chart labels are computed from returned movement dates (`frontend/src/lib/financial-utils.ts:36-67`). Phase 1 verified that runtime dates are relative and classified the displayed-period claim as incorrect (`verification.md:172-172`).
- **Implication:** the header can describe a different period from the KPI and chart inputs.
- **Risk:** future contributors may preserve or copy the fixed label because it looks like an established domain invariant.
- **Unknown:** the desired period wording for a rolling, filtered, partial, or multi-year result.
- **Proposed rule:** **R-02** — Keep displayed period text consistent with the records used for dashboard calculations. Treat wording and behavior changes as product decisions; do not introduce another fixed calendar assumption.
- **Rule scope:** dashboard headers, filters, chart labels, date utilities, fixtures, and user-facing documentation.
- **Phase 3 validation:** use an API-shaped cross-year fixture and verify that any period-display implementation describes its actual minimum and maximum dates without changing KPI totals.

#### F-DATA-03 — A second, fixed-2024 mock collection is present but has no consumer

- **Fact:** `frontend/src/lib/mock-data.ts:1-73` exports a fixed 2024 collection. A source search found `mockMovements` only at its declaration, while the active application fetches backend data (`frontend/src/App.tsx:15-20`). TypeScript is configured to reject unused local imports, but an unimported exported module remains valid (`frontend/tsconfig.app.json:21-27`).
- **Implication:** this file is a parallel data source, not a runtime fallback.
- **Risk:** an editor could update the inactive fixture believing it controls the dashboard, or reintroduce it as a silent fallback and mask API failures.
- **Unknown:** whether the file is intentionally retained as teaching material.
- **Proposed rule:** **R-03** — Maintain one active dashboard data source. Before editing, adding, or deleting mock data, prove its import/consumer path; do not add silent API fallbacks.
- **Rule scope:** frontend fixtures and mock modules, `App` data loading, and backend mock generation.
- **Phase 3 validation:** remove only the unreferenced module as a bounded cleanup, confirm no imports before and after, and verify unchanged frontend tests/build and the existing API request path.

### Backend and API boundaries

#### F-BE-01 — API contracts are explicit and route tests cover current endpoint shapes

- **Fact:** movement and analytical response models use Pydantic models and constrained literal types (`backend/app/routes.py:11-62`); query parameters include typed filters and bounds such as top-category `limit` (`backend/app/routes.py:248-302`). Fifteen route/data tests exercise health, filters, segmentation, facets, summaries, ranking, comparison, and alerts (`backend/tests/test_routes.py:12-189`; `verification.md:149-150`).
- **Implication:** model, literal, filter, sorting, or response-shape edits are cross-boundary contract changes even in a mock API.
- **Risk:** updating only Python implementation or only TypeScript interfaces can leave a compile-valid but runtime-incompatible dashboard.
- **Unknown:** no generated schema client or formal cross-language contract check exists in the inspected repository.
- **Proposed rule:** **R-04** — Preserve explicit response models and constrained query parameters. Any API shape, enum, filtering, ordering, or aggregation change must update focused backend tests and every affected frontend type/consumer in the same work unit.
- **Rule scope:** `backend/app/routes.py`, `backend/tests/test_routes.py`, `frontend/src/lib/financial-types.ts`, and API consumers.
- **Phase 3 validation:** run the affected TestClient cases, inspect `/openapi.json`, and compare representative response keys and literal values with frontend types.

#### F-BE-02 — CORS is broad and deployment requirements are unknown

- **Fact:** FastAPI configures `allow_origins=["*"]`, credentials, all methods, and all headers (`backend/app/main.py:6-14`). Phase 1 did not establish deployment topology, authentication, authorization, tenant isolation, or financial-data privacy requirements (`verification.md:173-190`).
- **Implication:** this permissive policy is not evidence of a reviewed production origin policy.
- **Risk:** describing the API as production-secure or narrowing/broadening CORS from assumption could create a false security claim or break an unknown deployment.
- **Unknown:** allowed production origins and whether credentialed cross-origin requests are required.
- **Proposed rule:** **R-04** — Treat CORS and exposure changes as deployment/security decisions. Do not claim production readiness or change allowed origins, credentials, methods, or headers without documented environment and authentication requirements.
- **Rule scope:** `backend/app/main.py`, environment/deployment configuration, and operational documentation.
- **Phase 3 validation:** leave CORS unchanged in the bounded validation work unit; for any future CORS change, add TestClient preflight checks for named origins and record the deployment requirement that justifies them.

### Testing, documentation, and operations

#### F-TEST-01 — Current tests are focused below the rendered application boundary

- **Fact:** frontend tests cover KPI/month aggregation and formatting (`frontend/src/lib/financial-utils.test.ts:1-114`). Backend tests exercise routes through `TestClient` (`backend/tests/test_routes.py:1-189`). No frontend component or `App` test file was found in the inspected source inventory. Phase 1 verified five frontend tests and fifteen backend tests, but explicitly did not evaluate visual rendering, interactions, responsiveness, or browser-console behavior (`verification.md:149-151`, `verification.md:188-188`).
- **Implication:** passing unit and route tests does not prove loading/error states, chart rendering, or header/data consistency in a browser.
- **Risk:** contributors may overstate verification or make component changes with no check at the affected boundary.
- **Unknown:** no browser automation dependency or supported browser-test command is present in `frontend/package.json:6-42`.
- **Proposed rule:** **R-05** — Match verification to the changed boundary using only existing tools: focused utility tests for calculations, TestClient tests for APIs, frontend lint/build for TypeScript integration, and an explicit manual/runtime check for rendered behavior when components change. State untested boundaries.
- **Rule scope:** all source changes, tests, and delivery notes.
- **Phase 3 validation:** for the bounded cleanup, run frontend lint, tests, and build in the existing container path; verify the `/api` proxy manually; run backend tests only if the API boundary changes.

#### F-OPS-01 — Docker Compose is the evidenced verification environment, and warnings are unresolved observations

- **Fact:** the README documents only `docker compose up --build` and the Vite proxy (`README.md:39-50`); Compose mounts both source trees and publishes fixed development/debug ports (`docker-compose.yml:1-22`). Phase 1 observed a host port 5173 conflict, one Starlette deprecation warning, and a Vite chunk-size warning, while tests and build passed in containers (`verification.md:133-152`). In Phase 2, direct host `npm run lint` and `pytest` could not start because `eslint` and `pytest` were unavailable; no dependency was installed.
- **Implication:** host-tool absence and port occupancy are environment constraints, not application failures. Existing warnings are not automatically defects requiring unrelated remediation.
- **Risk:** installing ad hoc host dependencies, changing configured ports, or fixing warnings opportunistically would reduce reproducibility and expand scope.
- **Unknown:** minimum Docker/Compose versions and a supported non-Docker setup remain undocumented (`verification.md:189-191`).
- **Proposed rule:** **R-05** — Use repository-declared scripts through the existing Compose services unless a supported host environment is already present. Record exact commands, pass/fail/warning results, environmental blockers, and cleanup; do not install tools or bundle unrelated warning remediation into a work unit.
- **Rule scope:** frontend/backend verification, runtime checks, and contributor handoffs.
- **Phase 3 validation:** execute the declared container commands, use the Phase 1 temporary host-port technique only if 5173 is occupied, record known warnings separately, and confirm Compose cleanup.

## Proposed Phase 3 rule set

| Rule | Actionable repository rule | Kind |
|---|---|---|
| **R-01** | Preserve the current raw-API/client-aggregation contract. Require an explicit product decision, consumer trace, and equivalence/route tests before moving calculations or adopting/removing analytical endpoints. | Architecture guardrail |
| **R-02** | Keep generated-date assumptions, filters, chart periods, and displayed period text coherent. Control the reference date for fixed-year assertions; otherwise test relative boundaries. | Data/date guardrail |
| **R-03** | Keep one active mock-data source. Prove imports and consumers before changing mock modules, and never add a silent fallback that hides API failure. | Data-source guardrail |
| **R-04** | Preserve typed API models, constrained inputs, and cross-layer contract updates. Treat CORS as a deployment/security decision requiring documented requirements and focused tests. | API/security guardrail |
| **R-05** | Verify the changed boundary with existing containerized scripts and runtime checks; report exact outcomes, warnings, blockers, untested boundaries, and cleanup without installing tools or expanding scope. | Verification/operations guardrail |

This five-rule set is intentionally smaller than the finding list. Shared rules cover related evidence without turning every observation into a separate policy.

## Traceability matrix

| Rule | Finding IDs | Repository facts supporting the rule |
|---|---|---|
| **R-01** | F-ARCH-01, F-ARCH-02 | Sole UI request and client aggregation (`frontend/src/App.tsx:13-43`; `frontend/src/lib/financial-utils.ts:21-67`); parallel backend routes (`backend/app/routes.py:262-391`). |
| **R-02** | F-DATA-01, F-DATA-02 | Relative-year generation (`backend/app/routes.py:65-104`); fixed header period (`frontend/src/App.tsx:49`); date-derived monthly labels (`frontend/src/lib/financial-utils.ts:36-67`). |
| **R-03** | F-DATA-03, F-ARCH-01 | Unreferenced fixed fixture (`frontend/src/lib/mock-data.ts:1-73`); active API fetch (`frontend/src/App.tsx:15-20`). |
| **R-04** | F-BE-01, F-BE-02, F-ARCH-02 | Pydantic/literal contracts and bounded queries (`backend/app/routes.py:11-62`, `backend/app/routes.py:248-391`); broad CORS (`backend/app/main.py:6-14`); frontend contract (`frontend/src/lib/financial-types.ts:1-25`). |
| **R-05** | F-TEST-01, F-OPS-01, F-BE-01 | Existing scripts/dependencies (`frontend/package.json:6-42`; `backend/requirements.txt:1-6`), focused tests (`frontend/src/lib/financial-utils.test.ts:1-114`; `backend/tests/test_routes.py:1-189`), and Phase 1 command outcomes (`verification.md:133-152`). |

No proposed rule lacks a finding or repository fact.

## Risk classification: guardrails versus product decisions

| Evidenced pattern | Current classification | Why no automatic fix is proposed |
|---|---|---|
| Client-side aggregation over 360 raw metrics | Architecture guardrail and possible future scaling risk | No production volume or desired ownership has been established. |
| Seeded values with relative-date generation | Test/data guardrail | Rolling dates may be intentional; fixed-calendar intent is unknown. |
| Hard-coded `2024 - Full Year` display | Product correctness decision | The mismatch is verified, but desired wording and filtering behavior are unknown. |
| Broad CORS with credentials enabled | Deployment/security decision | Production origins and authentication requirements are unknown. |
| Unused fixed frontend mock collection | Bounded cleanup candidate | It has no observed consumer, but possible teaching intent is unknown. |
| Additional backend endpoints not consumed by the UI | API/product decision | External consumers and assignment extension intent are unknown. |
| Starlette deprecation and Vite chunk-size warnings | Tracked verification observations | Both checks passed; root cause, user impact, and remediation scope were not established. |

## Bounded Phase 3 validation work unit

**Work unit:** retire the unreferenced frontend mock collection without replacement, while proving that the active API data path and dashboard build remain unchanged.

1. Reconfirm that `mockMovements` has no import or consumer.
2. Delete only `frontend/src/lib/mock-data.ts`; do not add a fallback or change `App`.
3. Confirm `App` still makes its single `/api/metrics` request and uses existing calculation utilities.
4. Through the existing Compose frontend service, run `npm run lint`, `npm test`, and `npm run build`.
5. Start the existing services, verify frontend HTML and `/api/metrics` through the Vite proxy, use the already documented temporary host publication only if port 5173 is occupied, then clean up.
6. Record exact results and existing warnings separately; do not remediate unrelated warnings.

This is a no-behavior-change cleanup that directly exercises **R-01**, **R-03**, and **R-05**. **R-02** and **R-04** act as explicit no-touch boundaries for the work unit. Rollback is limited to restoring `frontend/src/lib/mock-data.ts`.

## Risks and unknowns carried into Phase 3

- Desired ownership of financial aggregation and intended consumers of analytical endpoints.
- Correct product wording and behavior for rolling, filtered, partial, or cross-year periods.
- Whether the unused fixed mock file has teaching value not visible through imports.
- Production origins, credentials, authentication, authorization, privacy, and deployment topology.
- Browser rendering, accessibility behavior, chart interaction, responsiveness, and console state.
- Performance limits for raw metric transfer and the observed frontend chunk warning.
- Root cause and upgrade path for the observed Starlette deprecation warning.
- Supported non-Docker workflow and minimum Docker/Compose versions.

## Phase 2 acceptance checklist

- [x] Root guidance and required context locations were checked; missing locations were not created.
- [x] Phase 1 commit `b4c2134` and `verification.md` were treated as authoritative inputs.
- [x] Findings cite concrete source, configuration, tests, documentation, searches, or observed commands.
- [x] Facts, implications, risks, and unknowns are separated.
- [x] Every finding has a stable ID, proposed rule, scope, and realistic Phase 3 validation.
- [x] Every proposed rule maps to one or more findings and repository facts.
- [x] Risky patterns are classified as guardrails, cleanup candidates, or product decisions rather than presumed fixes.
- [x] The recommended Phase 3 rule set uses only existing technologies and dependencies.
- [x] One bounded, no-behavior-change validation work unit is defined.
- [x] Phase 2 creates only `engineering-findings.md` and does not stage files.

## Phase 3 handoff

Create the five rules above in the repository's intended agent-rule format, keeping their evidence links and scopes intact. Then execute the bounded mock-source cleanup as the first real validation. Accept the rules only if they guide that work without requiring new dependencies, application redesign, or unrelated warning fixes; revise rules that are ambiguous or cannot produce an observable verification result.
