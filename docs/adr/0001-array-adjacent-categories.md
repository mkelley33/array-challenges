---
status: accepted
date: 2026-09-14
---

# Categories may be built around the built-ins arrays hand off to: Set, Iterator, and Promise

The catalog had eleven categories, every one organised around one family of `Array.prototype` methods, and
`CONTEXT.md` defined **Category** that narrowly. We wanted four more categories — Mutating in Place, Sets &
Set Algebra, Iterator Helpers, and Async Arrays & Promises — and three of them are not about array methods at
all: they teach the built-ins that array code converts into, pipes through, and gathers back from. We widened
the definition to "one family of methods that array code depends on: the array methods themselves, or the
built-ins arrays hand off to and receive from (Set, Iterator, Promise)", and fixed those three names as the
boundary so the catalog stays an array practice tool rather than drifting into a general JavaScript one.

## Considered options

- **Reframe each new category around array methods** (e.g. "Set-backed dedup with `filter`", "`map` to
  promises then `Promise.all`"), keeping the old definition intact. Rejected: the load-bearing method — the
  thing the explanation must teach — would be `Set.prototype.intersection`, `Iterator.prototype.take`, or
  `Promise.allSettled`, not an array method, so the glossary would say one thing and every explanation
  another. A definition that has to be read around is worse than a wider one.
- **Widen to "any JavaScript built-in"**. Rejected: nothing would stop a Strings or Regex category next, and
  the tool's identity is the array. Naming Set, Iterator, and Promise explicitly is the fence.

## Consequences

- A **load-bearing method** may now belong to `Set.prototype`, `Iterator.prototype`, `Promise`, or their
  static constructors, not only to `Array.prototype`. The catalog gate's "explanation mentions a method from
  `methods`" rule is unchanged and applies to those names.
- The ES2025 Set methods, the Iterator Helpers, and `Promise.withResolvers` are **not polyfilled** and the
  tsconfig `lib` is not raised for them; reference solutions are untyped `code()` strings run through Sucrase.
  The catalog's runtime baseline is Node 24 or an evergreen browser (Chrome 122+, Firefox 131+, Safari 18.4+).
  Documented in `src/lib/polyfills.ts` and the README.
- Existing categories, ids, and orders are untouched; the four new categories append as orders 12–15.
