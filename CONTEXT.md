# Array Challenges

A local practice tool for JavaScript/TypeScript array methods. The context is the catalog: how a practice problem
is defined, graded, and described to the person solving it.

## Language

### Catalog

**Challenge**:
One practice problem: a task, a starter, a reference solution, test cases, an explanation, and a tier.
_Avoid_: Exercise, problem, kata, question

**Category**:
A named group of challenges organised around one family of array methods (e.g. Reduce & Folding).
_Avoid_: Topic, section, module, chapter

**Catalog**:
The complete set of categories and their challenges, as authored.
_Avoid_: Database, content, question bank

**Load-bearing method**:
The category's own method that the idiomatic solution cannot do without. Other methods may join a solution, but the
load-bearing one is what the explanation teaches.
_Avoid_: Primary method, main method, target method

### Tiers

**Tier**:
A challenge's difficulty label: novice, intermediate, advanced, or expert. Tiers are user-facing and filterable.
_Avoid_: Level, difficulty rating, grade

**Novice**:
A single familiar method used exactly as documented.

**Intermediate**:
A single method whose correct use needs an option, a comparator, an index, or a seed the reader may not reach for.

**Advanced**:
A familiar method whose naive use is wrong, built around a trap the test cases catch. Every advanced challenge
carries a trap.

**Expert**:
Composition or reimplementation: three or more methods working together, a method rebuilt from primitives, an
ES2024+ API, or a problem whose obvious solution has the wrong complexity, mutates, or loses stability.

### Solving

**Starter**:
The code the solver begins from. It transpiles and exports `solve`, and it never already passes.
_Avoid_: Template, scaffold, boilerplate, skeleton

**Reference solution**:
The authored answer that proves the challenge is solvable and passes every test case.
_Avoid_: Answer key, expected solution, model answer

**Trap**:
The tempting-but-wrong solution an advanced challenge is built around. It transpiles, and at least one test case
proves it fails.
_Avoid_: Naive solution, anti-solution, wrong answer, counterexample

**Trap witness**:
The test case whose expected value exposes the trap.
_Avoid_: Edge case, gotcha test

**Test case**:
A named set of arguments and the expected return value used to grade a submission.
_Avoid_: Fixture, spec, assertion, example

**Submission**:
The solver's saved code for a challenge, with whether it last passed or failed.
_Avoid_: Attempt, answer, solution (reserved for the reference solution)

**Spoiler**:
The reference solution and its explanation, hidden until the solver chooses to reveal it.
_Avoid_: Hint, answer, walkthrough

**Explanation**:
The teaching text in the spoiler: why the reference solution is correct and what the load-bearing method contributes.
_Avoid_: Hint, notes, commentary
