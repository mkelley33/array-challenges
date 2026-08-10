# The Array Methods Challenge

Practice every JavaScript/TypeScript array method — from `at` to `toSpliced` — through 66 hands-on challenges
across 11 categories, from novice to expert. Each challenge ships with a problem statement, an in-browser
TypeScript editor, instant test feedback, and a spoiler that explains a correct solution when you're stuck.

The catalog targets **ES2024** (including `Array.fromAsync`, `toSorted`, `toReversed`, `toSpliced`, `with`,
`findLast`) and installs polyfills for ES2025+ proposals where needed (`Object.groupBy`, `Map.groupBy`).

## Prerequisites

- **Node.js 24** (see `.nvmrc`)
- **pnpm 11** via corepack — no global install needed:

```sh
corepack enable
```

## Quickstart

```sh
pnpm install
pnpm dev
```

`pnpm dev` starts two processes:

- **JSON Server** on `http://localhost:3001` — serves the challenge catalog and stores your submissions in `db.json`
- **Vite** on `http://localhost:5173` — the app, with `/api` proxied to JSON Server

Open <http://localhost:5173>, pick a category, and start solving. Your progress is saved to `db.json`
(submissions) and `localStorage` (settings, revealed spoilers), so it survives restarts.

## Scripts

| Script             | What it does                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| `pnpm dev`         | Regenerates `db.json`, then runs JSON Server (`:3001`) and Vite (`:5173`)       |
| `pnpm test`        | Runs the full Vitest suite, including the challenge-catalog gate                |
| `pnpm test:watch`  | Vitest in watch mode                                                            |
| `pnpm typecheck`   | `tsc -b` across the app, node, and worker TypeScript projects                   |
| `pnpm lint`        | ESLint over the whole repo                                                      |
| `pnpm format`      | Prettier write; `pnpm format:check` verifies without writing                    |
| `pnpm build`       | Type-checks and produces a production build in `dist/`                          |
| `pnpm preview`     | Serves the production build locally                                             |
| `pnpm db:generate` | Regenerates `db.json` from the authored catalog (preserves submissions)         |
| `pnpm db:serve`    | Runs JSON Server alone (no file watching — restart it after `pnpm db:generate`) |

## Editing challenges

`pnpm dev` rebuilds `db.json` from `src/data/challenges/` before starting, so a fresh session always
serves the current catalog. Edit a challenge while the dev server is running and the app raises a
standing warning naming the file — restart `pnpm dev` to load it, since the API deliberately does
not watch the database file.

## How it works

- **Challenges** are authored as typed TypeScript modules in `src/data/challenges/`, one file per category.
  `pnpm db:generate` runs each reference solution to compute expected values for extra
  [Faker](https://fakerjs.dev)-generated cases (seeded, deterministic) and writes `db.json`.
- **Your code** is transpiled in the browser with [Sucrase](https://github.com/alangpierce/sucrase) and executed
  inside a dedicated **Web Worker**, so infinite loops can't freeze the page — runs are hard-terminated on timeout.
- **Judging** uses a deep-equality checker that understands `NaN`, `-0`, `Map`, `Set`, `Date`, and cyclic
  structures. Test fixtures travel through an extended-JSON codec so `undefined`, `Infinity`, and friends
  survive the trip through `db.json` and the worker boundary.
- **The catalog gate** (`src/data/catalog.test.ts`) enforces that every challenge's starter code compiles but
  does _not_ pass, and that every reference solution _does_ pass its own tests.
- **UI**: React 19 + Vite, shadcn/ui + Tailwind CSS v4, CodeMirror 6 editor, TanStack Query for the API layer,
  Zustand for view/settings state, React Hook Form + Zod for the settings dialog. Fully responsive — on
  mobile the workspace switches between Problem / Editor / Results panes.

## Project layout

```
src/
  api/          fetch client + TanStack Query hooks (submissions upsert)
  components/   app shell, dashboard, challenge workspace, results, spoiler
  components/ui shadcn/ui primitives
  data/         challenge catalog, invariants, db builder
  execution/    transpile-and-run pipeline, Web Worker sandbox
  lib/          codec, deep-equal, polyfills, progress, formatting
  stores/       Zustand stores (settings, spoilers, view state)
scripts/        db.json generator
```

## License

[MIT](./LICENSE)
