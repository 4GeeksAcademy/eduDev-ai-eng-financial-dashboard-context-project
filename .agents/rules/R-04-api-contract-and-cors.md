# R-04 — Protect API Contracts and CORS Decisions

## Scope

This rule applies to `backend/app/routes.py`, `backend/app/main.py`, `backend/tests/test_routes.py`, `frontend/src/lib/financial-types.ts`, API consumers, environment/deployment configuration, and operational claims about API exposure.

## Repository evidence

- Backend responses and query values use Pydantic models and constrained literal types (`backend/app/routes.py:11-62`, `backend/app/routes.py:248-391`).
- The frontend declares the corresponding movement fields and literals (`frontend/src/lib/financial-types.ts:1-11`).
- Route tests cover filters, segmentation, facets, summaries, ranking, comparisons, and alerts (`backend/tests/test_routes.py:12-189`).
- CORS currently allows all origins, methods, and headers with credentials (`backend/app/main.py:6-14`), while deployment and authentication requirements remain unknown (`verification.md:173-190`).

This evidence implements **R-04** from findings **F-BE-01**, **F-BE-02**, and **F-ARCH-02** (`engineering-findings.md:74-92`, `engineering-findings.md:123-136`).

## Rationale

API shape, enum, filter, ordering, and aggregation edits cross language and service boundaries. CORS is deployment-sensitive security configuration; changing it without known origins and credential requirements can either break an unknown deployment or create unsupported security claims.

## Mandatory guidance

- Contributors **MUST** preserve explicit response models, constrained query parameters, response ordering, and frontend contract types unless the work unit explicitly changes the API contract.
- **WHEN** an API shape, enum, filter, ordering, or aggregation changes, contributors **MUST** update focused backend tests and every affected frontend type and consumer in the same work unit.
- Contributors **MUST NOT** change allowed origins, credentials, methods, or headers without documented deployment and authentication requirements.
- Contributors **MUST NOT** claim production security or readiness from the current permissive CORS configuration.
- **WHEN** CORS changes are authorized, contributors **MUST** add focused preflight tests for named origins and record the requirement that justifies each policy choice.
- **WHEN** a bounded frontend-only cleanup does not change backend or API files, contributors **MUST** record backend tests as not applicable for that work unit and prove the unchanged path set.

## Required verification

- Run affected backend `TestClient` tests for any backend/API change.
- Inspect `/openapi.json` and compare representative response keys and literal values with frontend types for contract changes.
- Run frontend lint/build and affected tests for any changed frontend consumer or type.
- Prove the changed-file set before marking backend tests not applicable.

## Boundaries and unknowns

Production origins, authentication, authorization, tenant isolation, privacy requirements, deployment topology, and external API consumers are unknown. This rule does not require changing CORS or removing unconsumed analytical routes.

## Rollback and escalation

Rollback **MUST** restore compatible backend models, routes, tests, frontend types, and consumers together. If deployment requirements or external consumer impact cannot be established, stop and escalate the API/security decision; do not infer a safe CORS policy or compatibility promise.
