# The Array Methods Challenge — Design

**Date:** 2026-08-08
**Status:** Approved for implementation (user supplied full spec; remaining decisions resolved below with rationale)

## Purpose

A responsive web app for practicing JavaScript/TypeScript array methods (ES2024 baseline, polyfills for
anything newer) through a large catalog of categorized challenges. Users write TypeScript solutions in an
interactive editor, run them against test cases, track per-category progress, clear and resubmit solutions,
and reveal explained reference solutions when stuck.

## Tech stack (fixed by spec)

React 19 · TypeScript 7 · Vite 8 · Vitest 4 · Zustand 5 · TanStack Query 5 · React Hook Form 7 ·
JSON Server 1.0-beta · Faker.js 10 · pnpm 11 via corepack · Node 24 · ESLint (flat config) · Prettier
(120 cols, single quotes, trailing commas) · shadcn/ui on Tailwind CSS 4 · MIT license.

## Decisions resolved during design

| Decision | Choice | Rationale |
|---|---|---|
| Code editor | CodeMirror 6 (`@uiw/react-codemirror`, `@codemirror/lang-javascript` in TS mode) | Touch-friendly (spec requires mobile), small bundle, themeable. Monaco is heavier and poor on mobile. |
| Running user TS | Sucrase transpile (TS + import transforms) → evaluate as CJS module | Full `tsc` in-browser is ~8 MB; Sucrase is fast and small. Type *checking* is not required to judge solutions — tests judge behavior. |
| Sandboxing | Dedicated Web Worker per run, hard-terminated on timeout (3 s) | Only reliable way to stop `while(true)` in user code. A `SolutionExecutor` interface abstracts this so Vitest uses a direct in-process executor. |
| Test data format | Extended-JSON codec (`Map`, `Set`, `undefined`, `NaN`, `±Infinity`, `-0`, `Date` tagged) | Challenges live in `db.json` (JSON Server), but ES2024 challenges need `Map.groupBy` outputs etc. Custom `deepEqual` understands the same value domain. |
| Challenge authoring | Typed TS modules in `src/data/challenges/`; `scripts/generate-db.ts` emits `db.json` | Authoring stays type-checked; JSON Server serves the generated artifact. `db.json` is committed so `pnpm dev` works after clone; regenerable via `pnpm db:generate`. |
| Faker's role | Seeded datasets for data-heavy challenges, generated at db-build time | Deterministic (fixed seed). Primary test cases are hand-authored with hand-computed expectations; faker cases are supplementary. |
| Progress storage | Submissions persisted to JSON Server (`/submissions`) via TanStack Query mutations; progress derived from submissions | Survives browser storage clears, gives TanStack Query real mutation work. Zustand (persisted) holds UI state: editor prefs, revealed spoilers, filters. |
| React Hook Form | Editor-settings dialog (font size, tab size, keymap) via shadcn `Form` | Genuine form need; RHF + shadcn form primitives. |
| Routing | None — view state in Zustand (dashboard ↔ challenge) | Spec's stack has no router; two-level navigation doesn't justify adding one. |
| ES2025+ polyfills | `src/lib/polyfills.ts` installs `Array.fromAsync`, `Object.groupBy`, `Map.groupBy` when missing (app + worker + generator all import it) | Node 24/modern browsers have ES2024, but older browsers may not; the module also documents the pattern. A "Build your own methods" category has users implement polyfills (`flat`, `groupBy`, `uniqueBy`) for depth. |

## Architecture

```
JSON Server (db.json: categories, challenges, submissions)
        ▲ REST (/api proxy via Vite)
TanStack Query hooks (src/api/)
        ▼
React UI ── Zustand (UI prefs, spoilers, filters)
   │
   └─ ChallengeWorkspace ── CodeMirror editor
            │ run
            ▼
   run-challenge orchestrator ── transpile (Sucrase) ── WorkerExecutor (browser) / DirectExecutor (tests)
            │ per-test verdicts via deepEqual on codec-decoded values
```

### Units (each independently testable)

- `src/lib/codec.ts` — encode/decode extended-JSON values. No dependencies.
- `src/lib/deep-equal.ts` — structural equality over the codec value domain.
- `src/lib/polyfills.ts` — guarded installs; imported by app entry, worker, generator.
- `src/lib/transpile.ts` — Sucrase wrapper; returns JS or a friendly syntax error.
- `src/execution/executor.ts` — `SolutionExecutor` interface + `DirectExecutor` (evaluates transpiled CJS,
  calls exported `solve`, clones args via codec round-trip so mutation can't leak between cases).
- `src/execution/worker-executor.ts` + `solution-worker.ts` — browser executor with timeout termination.
- `src/execution/run-challenge.ts` — transpile once, execute all test cases, produce `RunReport`
  (per-case pass/fail, actual vs expected, runtime errors, console capture).
- `src/data/types.ts` — `Category`, `Challenge`, `TestCase`, `Difficulty` (novice→expert).
- `src/data/challenges/<category>.ts` — content modules (the catalog).
- `scripts/generate-db.ts` — seeded Faker datasets + emit `db.json` (run with Node 24 type-stripping).
- `src/api/` — Query hooks: `useCategories`, `useChallenges`, `useSubmissions`, `useSaveSubmission`,
  `useClearSubmission`.
- `src/store/` — `useUiStore` (view state, filters), `useSettingsStore` (editor prefs, persisted),
  `useSpoilerStore` (revealed solutions, persisted).
- `src/components/` — `AppShell` (sidebar/sheet nav), `Dashboard` (category cards + overall progress),
  `ChallengeList`, `ChallengeWorkspace` (description, editor, run/reset/clear, results),
  `SpoilerPanel` (button-gated reveal with explanation), `SettingsDialog` (RHF), `src/components/ui/` (shadcn).

## Challenge catalog

11 categories × 6 challenges = 66, each: id, slug, title, category, difficulty, description (markdown-ish),
starter code (typed signature), hand-authored test cases, reference solution, explanation (why it's correct,
tricks/patterns highlighted), hints on relevant methods.

Categories: creating-arrays · access-and-search · iteration-basics · filtering-and-slicing ·
mapping-and-transforming · reduce-and-folding · sorting-and-ordering · flattening-and-composing ·
immutable-updates (ES2023 `toSorted`/`toReversed`/`toSpliced`/`with`) · grouping-and-aggregation
(ES2024 `Object.groupBy`/`Map.groupBy`, `Array.fromAsync`) · tricks-and-patterns (chunk, zip, unique,
partition, sliding window, transpose, build-your-own-polyfill exercises).

## Error handling

- Transpile errors → shown inline with line/col, never thrown to UI.
- Runtime errors per test case → captured in `RunReport` with message + case context.
- Timeout → worker terminated, "possible infinite loop" verdict.
- API failures → TanStack Query error states with retry affordance; submissions optimistic-update with rollback.

## Testing strategy (TDD throughout)

- Unit: codec round-trips, `deepEqual` edge cases (NaN, -0, Map/Set order-insensitivity), transpile errors,
  DirectExecutor (exports contract, arg cloning, async solutions), polyfill behavior, store logic, progress derivation.
- **Catalog meta-test:** every challenge's reference solution must pass its own test cases through the real
  transpile→execute pipeline; every challenge's starter code must transpile; schema invariants (unique ids,
  ≥3 test cases, non-empty explanation).
- Component tests (Testing Library + jsdom): spoiler reveal flow, results rendering, settings form validation.

## Non-goals

User accounts/auth, server-side code execution, real type-checking of user code, leaderboard, router/deep links.
