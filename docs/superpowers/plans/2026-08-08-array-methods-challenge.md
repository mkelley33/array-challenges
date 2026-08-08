# The Array Methods Challenge — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive Vite + React 19 app for practicing array methods through a 66-challenge catalog with an in-browser TS editor, sandboxed test runner, JSON Server persistence, and spoilered reference solutions.

**Architecture:** Pure, independently-tested core modules (codec → deepEqual → transpile → executor → run-challenge) power a worker-sandboxed runner. Challenge content is typed TS compiled to `db.json` served by JSON Server; TanStack Query owns server state (submissions), Zustand owns UI state.

**Tech Stack:** React 19, TypeScript 7.0.2, Vite 8, Vitest 4, Zustand 5, TanStack Query 5, React Hook Form 7, JSON Server 1.0-beta, Faker 10, Tailwind 4 + shadcn/ui, CodeMirror 6, Sucrase, pnpm 11 / Node 24.

## Global Constraints

- No `eslint-disable` comments anywhere.
- No `any` types (enforced via `@typescript-eslint/no-explicit-any` as error; also avoid `as unknown as` laundering).
- Prettier: `printWidth: 120`, `singleQuote: true`, `trailingComma: 'all'`.
- Conventional Commits, atomic; never commit to `main` (work stays on `feat/array-methods-challenge`).
- TDD for every logic module: failing test first, then implementation.
- License: MIT (file + package.json field).
- `.gitignore` already ignores `tsconfig.*.json` — add negations `!tsconfig.app.json`, `!tsconfig.node.json` when scaffolding.
- ESLint 10 flat config with typescript-eslint, react, react-hooks, jsx-a11y, perfectionist (import sorting). If a plugin's peer range rejects ESLint 10, fall back to latest ESLint 9.x.

---

### Task 1: Toolchain scaffold

**Files:** Create `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `.prettierrc.json`, `.prettierignore`, `components.json` (shadcn), `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/lib/utils.ts` (shadcn cn), `LICENSE`; modify `package.json`, `.gitignore`.

**Steps:**

- [ ] Install deps: `pnpm add react react-dom zustand @tanstack/react-query react-hook-form @uiw/react-codemirror @codemirror/lang-javascript @codemirror/theme-one-dark sucrase` and dev: `pnpm add -D typescript@^7 vite @vitejs/plugin-react vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom json-server @faker-js/faker tailwindcss @tailwindcss/vite concurrently tsx eslint typescript-eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-perfectionist prettier globals`
- [ ] Vite config: react plugin, tailwind plugin, `@` alias → `src`, server proxy `/api` → `http://localhost:3001` (rewrite `^/api` → '').
- [ ] tsconfig: strict, `target/lib ES2024`, `moduleResolution: bundler`, `paths: {"@/*": ["./src/*"]}`, `noUncheckedIndexedAccess: true`.
- [ ] Vitest config: `environment: 'node'` default; jsdom via per-file `// @vitest-environment jsdom` for component tests; setup file registering jest-dom.
- [ ] ESLint flat config per Global Constraints; Prettier config `{"printWidth":120,"singleQuote":true,"trailingComma":"all","semi":true}`; `.prettierignore`: `dist`, `coverage`, `pnpm-lock.yaml`, `db.json`, `src/components/ui`.
- [ ] shadcn init (`pnpm dlx shadcn@latest init`), then add: button card badge dialog tabs progress select sheet sonner form input label separator scroll-area switch.
- [ ] `package.json` scripts: `dev` (concurrently json-server + vite), `db:serve`, `db:generate`, `build` (`tsc --noEmit && vite build`), `preview`, `test`, `test:watch`, `typecheck`, `lint`, `format`, `format:check`. Set `"license": "MIT"`, `"type": "module"`.
- [ ] LICENSE: MIT, holder "Michaux Kelley", year 2026.
- [ ] Verify: `pnpm typecheck && pnpm lint && pnpm build` pass on hello-world App. Commit (`chore: scaffold vite react ts toolchain`).

### Task 2: Value codec (`src/lib/codec.ts`)

**Interfaces (Produces):**

```ts
export type Encoded = null | boolean | number | string | Encoded[] | { [k: string]: Encoded }; // incl. tagged forms
export function encode(value: unknown): Encoded;
export function decode(encoded: Encoded): unknown;
```

Tags: `{$t:'undef'}`, `{$t:'nan'}`, `{$t:'inf',s:1|-1}`, `{$t:'negzero'}`, `{$t:'date',v:ISO}`, `{$t:'map',v:[[Encoded,Encoded],...]}`, `{$t:'set',v:[Encoded,...]}`, `{$t:'raw',v:{...}}` (escape hatch for plain objects containing a literal `$t` key). Throws `CodecError` on functions/symbols/bigint/class instances.

**Test file:** `src/lib/codec.test.ts`

- [ ] Failing tests: round-trip primitives, nested arrays/objects, undefined inside arrays and object values, NaN/±Infinity/-0, Date, Map with non-string keys, Set, `$t`-collision escape, CodecError on function. Run → fail.
- [ ] Implement; run → pass; `decode(encode(x))` also acts as the deep-clone used by executors. Commit (`feat: add extended-json value codec`).

### Task 3: Deep equality (`src/lib/deep-equal.ts`)

**Produces:** `export function deepEqual(a: unknown, b: unknown): boolean` — Object.is for primitives (NaN equal, -0 ≠ +0), elementwise arrays, key-set + value plain objects, size + pairwise-matched Map/Set (order-insensitive, deep keys), Date by epoch, cross-type false, cycle-safe via pair Set.

- [ ] Failing tests in `src/lib/deep-equal.test.ts` covering all above + sparse-array holes vs explicit undefined (treat as equal — decoded values never have holes). Run → fail.
- [ ] Implement; pass; commit (`feat: add deep structural equality`).

### Task 4: Polyfills (`src/lib/polyfills.ts`)

**Produces:** `export function installPolyfills(): void` — guarded installs of `Array.fromAsync`, `Object.groupBy`, `Map.groupBy` (spec-compliant enough for catalog use). Imported for side effect by `src/main.tsx`, worker entry, and `scripts/generate-db.ts`.

- [ ] Failing tests: delete natives on bare objects? (Can't safely delete globals — instead test the internal fallback impls exported as `fromAsyncImpl`, `objectGroupByImpl`, `mapGroupByImpl` directly: async-iterable + mapFn cases, key coercion for Object.groupBy null-prototype result, Map.groupBy SameValueZero keys.) Run → fail.
- [ ] Implement (installer assigns impl only when missing); pass; commit (`feat: add es2024+ polyfills with tested fallback impls`).

### Task 5: Transpile (`src/lib/transpile.ts`)

**Produces:**

```ts
export type TranspileResult =
  { ok: true; code: string } | { ok: false; message: string; line?: number; column?: number };
export function transpileTs(source: string): TranspileResult;
```

Sucrase `{transforms: ['typescript','imports']}` → CJS. Syntax errors mapped to line/column from Sucrase error.

- [ ] Failing tests: typed fn compiles & strips types; `export function solve` becomes `exports.solve`; syntax error yields ok:false with line; generics/interfaces/enums(const) survive. Run → fail. Implement; pass; commit (`feat: add sucrase transpile wrapper`).

### Task 6: Executor + orchestrator (`src/execution/`)

**Produces (`executor.ts`):**

```ts
export interface TestCaseInput { name: string; args: Encoded[]; expected: Encoded }
export interface ExecutionRequest { code: string; fnName: string; tests: TestCaseInput[]; timeoutMs: number }
export interface CaseResult { name: string; status: 'pass'|'fail'|'error'; actual?: Encoded; expected: Encoded; error?: string; logs: string[] }
export interface ExecutionResult { status: 'ok'|'timeout'|'code-error'; error?: string; cases: CaseResult[] }
export interface SolutionExecutor { execute(req: ExecutionRequest): Promise<ExecutionResult> }
export class DirectExecutor implements SolutionExecutor { ... }
```

DirectExecutor: `new Function('module','exports','console', code)` with capture console; missing export → code-error naming `fnName`; per-case: decode-clone args, call, await, encode actual, deepEqual verdict; thrown → status 'error' with message; async timeout via Promise.race (sync loops are WorkerExecutor's job).

**Produces (`run-challenge.ts`):**

```ts
export type RunOverall = 'passed' | 'failed' | 'transpile-error' | 'timeout' | 'code-error';
export interface RunReport {
  overall: RunOverall;
  transpileError?: string;
  executionError?: string;
  cases: CaseResult[];
}
export async function runChallenge(
  executor: SolutionExecutor,
  userSource: string,
  fnName: string,
  tests: TestCaseInput[],
  timeoutMs?: number,
): Promise<RunReport>;
```

- [ ] Failing DirectExecutor tests: passing solution (map double), failing (wrong output → actual captured), throwing case, missing export, async solve, console.log capture per case, mutation isolation (solve mutates arg; later case unaffected). Failing runChallenge tests: TS source end-to-end pass; syntax error → transpile-error; overall passed only when all cases pass.
- [ ] Implement both; pass; commit (`feat: add solution executor and run orchestrator`).

### Task 7: Worker executor (`src/execution/solution-worker.ts`, `worker-executor.ts`)

Worker entry: installPolyfills, onmessage → `new DirectExecutor().execute(req)` → postMessage result. `WorkerExecutor`: `new Worker(new URL('./solution-worker.ts', import.meta.url), {type:'module'})` per run; races completion vs `timeoutMs + 500` grace; terminate + `{status:'timeout'}` on expiry. Unit-testable seam: `createWorker` factory injected; test with a fake Worker object (message echo, never-responds → timeout path).

- [ ] Failing tests with fake worker; implement; pass; commit (`feat: add sandboxed worker executor with hard timeout`).

### Task 8: Catalog schema + exemplar category + meta-test

**Files:** `src/data/types.ts`, `src/data/challenge-helpers.ts` (`defineChallenge` + `tc(name, args, expected)` builder that codec-encodes at authoring time), `src/data/challenges/creating-arrays.ts` (6 exemplar challenges), `src/data/challenges/index.ts` (aggregates `allCategories`, `allChallenges`), `src/data/catalog.test.ts`.

**Produces (`types.ts`):**

```ts
export type Difficulty = 'novice' | 'intermediate' | 'advanced' | 'expert';
export interface Category {
  id: string;
  title: string;
  description: string;
  order: number;
}
export interface Challenge {
  id: string;
  categoryId: string;
  order: number;
  title: string;
  difficulty: Difficulty;
  description: string;
  methods: string[];
  starterCode: string;
  solution: string;
  explanation: string;
  tests: TestCaseInput[];
}
```

Meta-test (the catalog gate, runs against ALL registered challenges):

1. unique challenge ids/orders; category refs valid; ≥3 tests each; non-empty explanation mentioning at least one method from `methods`.
2. `starterCode` transpiles and exports `solve`.
3. **reference `solution` passes all its tests via `runChallenge(new DirectExecutor(), ...)`.**
4. starter code as-submitted does NOT pass (it returns placeholder) — guards against give-away starters.

- [ ] Write meta-test → fails (no content); author 6 creating-arrays challenges (Array.of/from/fill/Array(n) holes/from-with-mapfn/fromAsync); pass; commit (`feat: add catalog schema, helpers, and creating-arrays category`).

### Task 9: Full catalog (10 remaining categories, 60 challenges)

Categories (ids fixed): `access-and-search`, `iteration-basics`, `filtering-and-slicing`, `mapping-and-transforming`, `reduce-and-folding`, `sorting-and-ordering`, `flattening-and-composing`, `immutable-updates`, `grouping-and-aggregation`, `tricks-and-patterns`. 6 challenges each, difficulty spread novice→expert, ES2023/24 methods included (`findLast`, `at`, `toSorted`, `toSpliced`, `with`, `Object.groupBy`, `Map.groupBy`, `Array.fromAsync`), tricks-and-patterns includes build-your-own (`flat` with depth, `groupBy`, `uniqueBy`) polyfill exercises.

Execution: dispatch parallel content subagents (one per 2 categories, 5 agents) with the schema, `tc()` helper contract, the exemplar file, and authoring rules (hand-computed expectations; description states the exact `solve` signature; explanation teaches the pattern and why it's correct). Gate: full meta-test suite green locally after integrating each agent's file; fix or reject substandard entries.

- [ ] All 10 files authored + registered in `index.ts`; meta-test green (66 challenges); commit per integration batch (`feat: add <categories> challenge categories`).

### Task 10: DB generation + JSON Server

**Files:** `scripts/generate-db.ts`, `db.json` (generated, committed), package scripts already wired.
Seeded Faker (`faker.seed(20260808)`) builds supplementary test cases for 5 designated data-heavy challenges (expected computed by reference solution via DirectExecutor — documented as derived; primary cases stay hand-authored). Emits `{categories, challenges, submissions: []}`.

- [ ] TDD the pure builder `buildDb(categories, challenges, extraCases)`; run `pnpm db:generate`; verify `curl :3001/challenges` returns 66; commit (`feat: generate db.json with seeded faker datasets`).

### Task 11: API layer + progress (`src/api/`)

**Files:** `src/api/client.ts` (fetch wrapper w/ error), `src/api/hooks.ts` (`useCategories`, `useChallenges`, `useSubmissions`, `useSaveSubmission` (PUT-or-POST upsert, id = challengeId), `useClearSubmission` (DELETE)), `src/api/progress.ts`.

**Produces (`progress.ts`):**

```ts
export interface Submission {
  id: string;
  challengeId: string;
  code: string;
  status: 'passed' | 'failed';
  updatedAt: string;
}
export interface ProgressSummary {
  total: number;
  solved: number;
}
export function deriveProgress(
  challenges: ReadonlyArray<Pick<Challenge, 'id' | 'categoryId'>>,
  submissions: ReadonlyArray<Submission>,
): { overall: ProgressSummary; byCategory: Record<string, ProgressSummary> };
```

- [ ] TDD deriveProgress (empty, partial, failed-only submissions don't count, unknown challengeId ignored); implement hooks (thin, no tests beyond types); commit (`feat: add api hooks and progress derivation`).

### Task 12: Stores (`src/store/`)

`useSettingsStore` (persisted: fontSize 12–20 default 14, tabSize 2|4, theme 'system'|'light'|'dark', keymap 'default'|'vim'? — no, YAGNI: fontSize, tabSize, theme only), `useSpoilerStore` (persisted: revealed: Record<challengeId, true>, reveal()), `useUiStore` (view: {name:'dashboard'}|{name:'challenge'; challengeId}, categoryFilter, difficultyFilter, navigate helpers).

- [ ] TDD store logic via vanilla store APIs (reveal idempotent, navigation transitions, settings bounds clamp); implement; commit (`feat: add zustand stores`).

### Task 13: UI shell, dashboard, challenge list

`AppShell` (desktop sidebar with category nav + progress; mobile Sheet), `Dashboard` (overall progress bar, category cards with solved/total badges), `ChallengeList` (rows: title, difficulty badge, methods chips, solved check), filters (category/difficulty via Select). Wire QueryClientProvider, theme class effect, sonner Toaster.

- [ ] Build; component test for Dashboard progress rendering with mocked hooks data (jsdom); commit (`feat: add app shell, dashboard, and challenge list`).

### Task 14: Challenge workspace

`ChallengeWorkspace`: description panel (title, difficulty, methods, markdown-lite rendering of description); CodeMirror editor (TS mode, theme + fontSize/tabSize from settings, starter code or saved submission); actions: Run (WorkerExecutor via runChallenge), Reset to starter, Clear submission (DELETE + editor reset, toast), Submit-on-pass (auto-save passed; failed runs save as failed status); `ResultsPanel` (per-case pass/fail with actual vs expected pretty-printed via codec-aware stringifier `src/lib/format-value.ts` — TDD its Map/Set/undefined rendering); `SpoilerPanel` (button-gated; reveal persists; shows solution code + explanation). Mobile: Tabs (Problem / Editor / Results); desktop: side-by-side grid. `SettingsDialog`: RHF + shadcn Form, numeric bounds validation, writes settings store.

- [ ] TDD format-value; build components; component tests: spoiler hidden-until-click + persistence, ResultsPanel rendering of fail case (jsdom, fake executor); commit (`feat: add challenge workspace with editor, runner, spoiler, settings`).

### Task 15: README, license polish, final verification

README: overview, features, screenshots-free quickstart (`corepack enable && pnpm i && pnpm db:generate` (optional) `&& pnpm dev`), scripts table, architecture summary, catalog overview, testing, license section. Verify `LICENSE` + `"license": "MIT"`.

- [ ] Full gate: `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all green; `pnpm dev` smoke: app loads, run a challenge, spoiler works, submission persists (browser check). Commit (`docs: add readme`), final review via superpowers:requesting-code-review, then superpowers:finishing-a-development-branch.

## Self-review notes

Spec coverage: editor(T1/T14), sandbox(T6/T7), catalog 66(T8/T9), tracking+clear/resubmit(T11/T14), spoiler(T14), tricks(T9), faker(T10), json-server(T10), RHF(T14), zustand(T12), tanstack(T11), responsive(T13/T14), README+MIT(T15), polyfills(T4). Types consistent: `TestCaseInput` defined T6, reused T8; `Encoded` T2 used throughout. No placeholders: content specifics for T9 are delegated to gated subagents by design, with the meta-test as the objective acceptance bar.
