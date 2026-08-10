# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this project is

A local practice app for JavaScript/TypeScript array methods. Challenges are **authored as typed
TypeScript modules**, compiled into a JSON Server database, and solved in the browser: your code is
transpiled client-side and executed in a Web Worker against the challenge's test cases.

It is a personal practice tool run locally. There is no auth, no multi-user state, and no
deployment target.

## Stack

Vite 8 · React 19 · TypeScript (strict) · TailwindCSS 4 · shadcn-style components on Radix ·
TanStack Query · Zustand · sonner · CodeMirror · Sucrase · JSON Server · Vitest + Testing Library ·
ESLint 9 flat config · pnpm

**The global defaults in `~/.claude/CLAUDE.md` describe a different stack. In this repo they do not
apply:**

| Global default            | Reality here                                                       |
| ------------------------- | ------------------------------------------------------------------ |
| Next.js App Router        | Vite SPA — no Next.js, no App Router, no RSC, no `'use client'`    |
| Server Actions for writes | Plain `fetch` in `src/api/client.ts` against JSON Server           |
| API Routes for reads      | Same client; Vite proxies `/api` → `localhost:3001`                |
| Prisma + MongoDB          | `db.json`, a flat file                                             |
| Repository pattern        | `src/api/client.ts` (transport) + `src/api/hooks.ts` (Query hooks) |
| Auth.js                   | No auth at all                                                     |

Everything else from the global file still holds: strict TypeScript, no `any`, explicit return
types, named exports, TDD, Conventional Commits.

## Commands

| Command            | Notes                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm dev`         | Regenerates `db.json`, then runs the API (`:3001`) and Vite (`:5173`) |
| `pnpm test`        | Full Vitest suite — includes the catalog gate                         |
| `pnpm typecheck`   | `tsc -b` across app, node, and worker projects                        |
| `pnpm lint`        | ESLint over the repo                                                  |
| `pnpm db:generate` | Rebuilds `db.json`, **preserving** submissions                        |
| `pnpm db:reset`    | Rebuilds `db.json`, **clearing** submissions (start over)             |
| `pnpm db:serve`    | API alone                                                             |

Always run `pnpm test`, `pnpm typecheck`, and `pnpm lint` before claiming work is done.

## Architecture

**Catalog pipeline** — the source of truth is TypeScript, not `db.json`:

```
src/data/challenges/*.ts  →  scripts/generate-db.ts  →  db.json  →  JSON Server  →  TanStack Query  →  UI
```

`generate-db.ts` is deterministic (seeded Faker), so regenerating an unchanged catalog produces a
byte-identical file. It also computes expected values for generated test cases by running each
reference solution.

**Execution pipeline** — how a user's code runs:

```
editor source → Sucrase transpile → Web Worker → deep-equal vs expected → RunReport → ResultsPanel
```

The worker exists so infinite loops can't freeze the page; runs are hard-terminated on timeout.
Test fixtures travel through the extended-JSON codec in `src/lib/codec.ts`, so `undefined`,
`Infinity`, `NaN`, `Map`, `Set`, and `Date` survive the round trip. Never put raw values into a
challenge's `tests` — use the `tc()` helper.

**Key directories**

- `src/data/challenges/` — the catalog, one module per category
- `src/data/catalog-invariants.ts` — the rules every challenge must satisfy
- `src/execution/` — transpile, worker, executor, run orchestration
- `src/api/` — `client.ts` (fetch) and `hooks.ts` (TanStack Query)
- `src/components/ui/` — shadcn-style primitives; treat as generated, edit sparingly
- `src/stores/` — Zustand stores (`ui`, `settings`, `spoiler`)
- `scripts/` — database generation

## Adding or editing a challenge

1. Edit the category module in `src/data/challenges/`. Use `code()` for source blocks and `tc()`
   for test cases.
2. A new category also needs registering in `src/data/challenges/index.ts` and a matching
   `<category>.test.ts` alongside it.
3. Run `pnpm test` — the catalog gate enforces:
   - starter code transpiles and exports `solve`
   - **starter code must NOT pass** (it would give the answer away)
   - **reference solution MUST pass** its own tests
   - at least 3 test cases, unique names, unique ids and orders
   - description longer than 40 chars, explanation longer than 80 chars
   - the explanation must mention at least one method from `methods`
4. Run `pnpm db:generate` and restart the API so the app serves the new catalog.

If the dev server is already running when you edit a challenge, the app raises a persistent toast
telling you to restart — the API cannot pick up the change on its own.

## Conventions

- Named exports only; no default exports.
- Explicit return types everywhere, including `React.JSX.Element` on components.
- `interface` for object shapes and props; `type` for unions.
- Props destructured in the signature with a declared `*Props` interface.
- Object literal keys and JSX props are kept alphabetical throughout. ESLint only enforces this for
  imports (`perfectionist`), but match the surrounding style.
- `import type { … }` for type-only imports — enforced by `consistent-type-imports`.
- `@/` aliases `src/`.
- Prettier: 120 columns, single quotes, trailing commas, semicolons.
- Tests sit beside their source as `*.test.ts(x)`. Component tests need
  `// @vitest-environment jsdom` as the first line — the default environment is `node`.
- Catalog tests call `installPolyfills()` before asserting.
- JSDoc the non-obvious: why a workaround exists, not what a line does.

## Gotchas

These are load-bearing. Removing any of them reintroduces a bug that was already fixed.

- **`db.json` is generated output _and_ live user data.** It is rewritten on every solution run.
  Never commit practice submissions as part of a feature change; restore the file with
  `git checkout` before committing.
- **JSON Server assigns its own row ids.** A client-supplied `id` on POST is ignored. Address
  submissions by `challengeId` (query `?challengeId=`), never by a constructed id.
- **The API does not watch `db.json`.** `db:serve` sets `NODE_ENV=production` to disable JSON
  Server's watcher, which otherwise raced its own writes and served deleted rows from memory. Its
  startup banner still prints `Watching db.json...` — that message is wrong. Restart the API after
  regenerating.
- **A running API overwrites a regenerated file.** It holds the database in memory and writes its
  copy back on the next save. Stop or restart it around `db:generate` / `db:reset`.
- **`@source not '../db.json'` in `src/index.css` must stay.** Without it Tailwind treats `db.json`
  as a content source and force-reloads the page on every save, throwing you back to the dashboard
  mid-challenge.
- **`ChallengeWorkspace` is keyed by `challenge.id` only.** Adding anything volatile (like
  `updatedAt`) to that key remounts the workspace after each save and wipes the results panel.
- **Ports 3001 and 5173 are shared with sibling practice projects.** Check they are free before
  starting; a stray server on 3001 will silently serve the wrong database.
- `src/data/challenges/creating-arrays.ts` has no per-category test file, unlike every other
  category. The global catalog gate still covers it. Add one if you touch that module.
