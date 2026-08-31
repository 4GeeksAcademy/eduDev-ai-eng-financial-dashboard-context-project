# R-03 — Maintain One Active Mock-Data Source

## Scope

This rule applies to frontend fixture and mock modules, `frontend/src/App.tsx` data loading, backend mock generation, tests that supply financial movements, and cleanup of apparently unused mock data.

## Repository evidence

- `frontend/src/lib/mock-data.ts` exports a fixed-2024 `mockMovements` collection (`frontend/src/lib/mock-data.ts:1-73`).
- The active application loads data from `/api/metrics` (`frontend/src/App.tsx:15-20`).
- Phase 2 found `mockMovements` only at its declaration and classified the file as a parallel source rather than a runtime fallback (`engineering-findings.md:62-70`).

This evidence implements **R-03** from findings **F-DATA-03** and **F-ARCH-01** (`engineering-findings.md:62-70`, `engineering-findings.md:122-136`).

## Rationale

An unconsumed mock module can mislead contributors into editing data that never reaches the dashboard. Reintroducing it as a silent fallback would hide API failures and create two competing sources of truth.

## Mandatory guidance

- Contributors **MUST** determine and record whether an import and runtime consumer path exists before editing, adding, retaining, or deleting a mock-data module; absence of both is required evidence for deletion.
- Contributors **MUST** keep the backend `/api/metrics` flow as the sole active dashboard data source unless an explicit product decision changes that architecture.
- Contributors **MUST NOT** add silent fixture, cache, or generated-data fallbacks that convert an API failure into apparently valid dashboard data.
- **WHEN** a mock module has no import or consumer, contributors **MAY** remove only that module as a bounded cleanup after recording before-state evidence.
- **WHEN** removing an unreferenced module, contributors **MUST** repeat the consumer search afterward and verify the active request path, frontend tests, lint, build, and runtime proxy.

## Required verification

- Search source for the exported symbol, module basename, relative import path, and configured path-alias form before and after the change.
- Confirm all frontend request sites and record the sole active dashboard endpoint.
- Run the existing frontend lint, test, and build scripts through the repository's containerized path.
- Verify repository frontend HTML and `/api/metrics` through the existing Vite proxy.

## Boundaries and unknowns

Teaching value not represented by imports is unknown. Consumer evidence is bounded to this repository; it cannot disprove use of copied snippets or untracked external materials. This rule does not authorize replacement data, `App` changes, backend generation changes, API changes, or fallback behavior.

## Rollback and escalation

For deletion of an unreferenced module, rollback **MUST** be limited to restoring that exact file. If any import, runtime consumer, generated reference, or documented teaching dependency is found, stop deletion and escalate the intended ownership instead of modifying consumers to make the cleanup pass.
