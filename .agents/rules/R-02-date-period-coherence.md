# R-02 — Keep Dates and Displayed Periods Coherent

## Scope

This rule applies to backend mock generation, date filters and comparisons, frontend period labels, chart/date utilities, date-sensitive tests and fixtures, and user-facing documentation about reporting periods.

## Repository evidence

- Backend mock values are seeded, but their years depend on `date.today()` (`backend/app/routes.py:65-104`).
- The dashboard passes a fixed `2024 - Full Year` label while monthly labels derive from returned dates (`frontend/src/App.tsx:49`; `frontend/src/lib/financial-utils.ts:36-67`).
- Existing generation tests verify count and ordering, not a fixed year (`backend/tests/test_routes.py:12-16`).
- Phase 1 recorded the fixed-label mismatch and the unverified product wording (`verification.md:172-190`).

This evidence implements **R-02** from findings **F-DATA-01** and **F-DATA-02** (`engineering-findings.md:42-60`, `engineering-findings.md:121-136`).

## Rationale

Seed reproducibility does not make calendar dates fixed. Fixed-year assumptions can expire at month or year boundaries, while a display label that disagrees with calculation inputs can misrepresent the dashboard period.

## Mandatory guidance

- Contributors **MUST** distinguish deterministic seeded values from dates generated relative to the current calendar.
- Contributors **MUST NOT** assert a fixed generated year unless the reference date is explicitly controlled.
- Contributors **MUST** keep displayed period text, filters, fixtures, and chart grouping coherent with the records used for calculations.
- Contributors **MUST NOT** introduce another fixed calendar assumption while addressing unrelated work.
- **WHEN** date behavior changes, contributors **MUST** test chronological ordering and relevant month/year boundaries with a controlled reference date or explicitly document why only relative invariants apply.
- **WHEN** period wording changes, contributors **MUST** treat the wording and behavior as a product decision and verify it against the actual minimum and maximum input dates.

## Required verification

- Exercise a controlled month/year boundary for date-sensitive implementation changes.
- Verify that date filtering includes its documented edges.
- Use an API-shaped cross-year fixture when changing period display or chart grouping.
- Confirm KPI totals remain based on the same records when changing period presentation.

## Boundaries and unknowns

Whether rolling dates are intentional and what wording should represent rolling, filtered, partial, or multi-year data are unknown. This rule does not authorize changing the current fixed header text without a product decision.

## Rollback and escalation

Rollback **MUST** restore the prior date generation, filtering, grouping, and display behavior together where they form one change. If the desired period semantics are unclear, preserve current behavior, record the mismatch, and escalate for product clarification rather than inventing wording.
