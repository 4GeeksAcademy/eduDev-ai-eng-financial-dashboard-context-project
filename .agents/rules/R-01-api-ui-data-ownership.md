# R-01 — Preserve API-to-UI Data Ownership

## Scope

This rule applies to:

- `frontend/src/App.tsx`;
- `frontend/src/lib/financial-types.ts`;
- `frontend/src/lib/financial-utils.ts`;
- frontend request code; and
- metric models and routes in `backend/app/routes.py`.

## Repository evidence

- `App` makes the dashboard's sole active request to `/api/metrics` and passes the returned raw movements to `computeKPIs` and `computeMonthlyData` (`frontend/src/App.tsx:13-43`).
- The calculation implementations are client-owned (`frontend/src/lib/financial-utils.ts:21-67`).
- Additional analytical routes exist without a repository frontend consumer (`backend/app/routes.py:262-391`; `engineering-findings.md:30-38`).
- Phase 1 verified the raw request through the Vite proxy (`verification.md:143-165`).

This evidence implements **R-01** from findings **F-ARCH-01** and **F-ARCH-02** (`engineering-findings.md:20-38`, `engineering-findings.md:120-136`).

## Rationale

The raw metrics response and client-side calculations currently form one user-visible contract. Moving or duplicating aggregation without an explicit decision can create competing KPI definitions. Likewise, an implemented backend route is not proof that the dashboard or an unknown external client does or does not require it.

## Mandatory guidance

- Contributors **MUST** preserve `/api/metrics` plus `computeKPIs` and `computeMonthlyData` as the current dashboard path unless an explicit product or architecture decision changes ownership.
- Contributors **MUST NOT** move, duplicate, or redefine KPI or monthly aggregation across frontend and backend as incidental cleanup.
- Contributors **MUST NOT** adopt or remove an analytical endpoint solely because it exists or lacks a repository frontend consumer.
- **WHEN** changing a request path, aggregation, or analytical endpoint, contributors **MUST** document the named consumer, update all affected types, and add focused tests proving the intended contract and user-visible values.
- **WHEN** performing unrelated work, contributors **MUST** confirm that the active request and aggregation path remain unchanged.

## Required verification

- Search all frontend request sites and record the active metric request paths.
- Run focused frontend utility tests when calculations or their inputs change.
- Run focused backend route tests when a route or response changes.
- Compare representative response fields with `FinancialMovement` in both layers for cross-boundary changes.
- Record any consumer that cannot be inspected as an unknown rather than assuming it does not exist.

## Boundaries and unknowns

The intended long-term aggregation owner, production data volume, and external consumers of analytical routes are unknown. This rule does not require a redesign, removal of analytical routes, or migration to backend summaries.

## Rollback and escalation

Rollback **MUST** restore the previous request, calculation, route, and type set as one work unit. If ownership, equivalence, or consumer impact cannot be proved, stop the change and escalate it for an explicit product/API decision instead of selecting a layer by assumption.
