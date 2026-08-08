import type { CategoryModule } from '@/data/types';

import { code, tc } from '@/data/challenge-helpers';

export const mappingAndTransforming: CategoryModule = {
  category: {
    description:
      'Transform every element into something new — one-to-one reshaping with map, index-aware callbacks, and the traps hiding in their extra arguments.',
    id: 'mapping-and-transforming',
    order: 5,
    title: 'Mapping & Transforming',
  },
  challenges: [
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Prices arrive as integer cents. Return them formatted as dollar strings with two decimals: ' +
        "`150` becomes `'$1.50'` and `99` becomes `'$0.99'`.\n\n" +
        'Signature: `solve(cents: number[]): string[]`',
      difficulty: 'novice',
      explanation:
        '`map` transforms each element through a callback and collects the results into a new array with a hard ' +
        'guarantee: the output has *exactly* the same length as the input, one result per element, in the same ' +
        'order. That 1:1 shape guarantee is what separates `map` from `filter` (which may shrink) and `reduce` ' +
        '(which may collapse to anything). The transform itself is `(amount / 100).toFixed(2)`: dividing shifts ' +
        'cents to dollars, and `toFixed(2)` formats with exactly two decimals — `(0.99).toFixed(2)` gives ' +
        "'0.99' and `(5).toFixed(2)` gives '5.00', padding and rounding as needed — then a '$' is prefixed with " +
        'plain string concatenation.',
      id: 'cents-to-prices',
      methods: ['map'],
      order: 1,
      solution: code(`
export function solve(cents: number[]): string[] {
  return cents.map((amount) => '$' + (amount / 100).toFixed(2));
}
`),
      starterCode: code(`
export function solve(cents: number[]): string[] {
  // One input element, one output element: divide by 100, then toFixed(2).
  return [];
}
`),
      tests: [
        tc('formats dollars and cents', [[150, 99]], ['$1.50', '$0.99']),
        tc('whole dollars keep two decimals', [[500]], ['$5.00']),
        tc('single cent pads the zeros', [[1]], ['$0.01']),
        tc('zero cents', [[0]], ['$0.00']),
        tc('empty cart', [[]], []),
      ],
      title: 'Cents to prices',
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        "Turn items into a numbered list starting at 1: `['a', 'b']` becomes `['1. a', '2. b']`.\n\n" +
        'Signature: `solve(items: string[]): string[]`',
      difficulty: 'novice',
      explanation:
        'The `map` callback receives more than the element: its full signature is `(value, index, array)`. The ' +
        'second argument is the zero-based position, so numbering a list is just ' +
        "`items.map((item, index) => String(index + 1) + '. ' + item)` — the `+ 1` converts zero-based indices " +
        'into the one-based numbers humans expect. No counter variable, no loop bookkeeping; the index arrives for ' +
        'free on every iteration. Remembering that `map` passes the index is also the key to a classic trap ' +
        'coming up later in this category — callbacks that silently accept a second argument.',
      id: 'numbered-list',
      methods: ['map'],
      order: 2,
      solution: code(`
export function solve(items: string[]): string[] {
  return items.map((item, index) => String(index + 1) + '. ' + item);
}
`),
      starterCode: code(`
export function solve(items: string[]): string[] {
  // The map callback gets a second argument — use it, plus 1.
  return [];
}
`),
      tests: [
        tc('numbers two items', [['a', 'b']], ['1. a', '2. b']),
        tc('numbers a shopping list', [['milk', 'eggs', 'bread']], ['1. milk', '2. eggs', '3. bread']),
        tc('single item', [['solo']], ['1. solo']),
        tc('empty list', [[]], []),
      ],
      title: 'Number the items',
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Parse an array of decimal strings into numbers. The starter code looks correct and even compiles — ' +
        "run it and study *why* `['1', '7', '11'].map(parseInt)` yields `[1, NaN, 3]` before fixing it.\n\n" +
        'Signature: `solve(values: string[]): number[]`',
      difficulty: 'intermediate',
      explanation:
        '`map` invokes its callback with three arguments — `(value, index, array)` — and `parseInt` happily accepts ' +
        'two: `(string, radix)`. Passed directly to `map`, `parseInt` receives each *index as its radix*: ' +
        "`parseInt('1', 0)` treats radix 0 as 10 and returns 1; `parseInt('7', 1)` is `NaN` because radix 1 is " +
        "invalid; `parseInt('11', 2)` reads '11' as binary and returns 3. Hence the infamous `[1, NaN, 3]`. Two " +
        'idiomatic fixes: `map(Number)` — `Number` takes exactly one argument, so the extra index is harmless — or ' +
        'an explicit arrow `(value) => parseInt(value, 10)` that pins the radix. The general lesson: never feed ' +
        '`map` a function whose second parameter means something, unless you wrap it.',
      id: 'parse-decimal-strings',
      methods: ['map'],
      order: 3,
      solution: code(`
export function solve(values: string[]): number[] {
  return values.map(Number);
}
`),
      starterCode: code(`
export function solve(values: string[]): number[] {
  // Looks fine, compiles fine — but map hands parseInt a second argument.
  return values.map(parseInt);
}
`),
      tests: [
        tc('the classic trap strings', [['1', '7', '11']], [1, 7, 11]),
        tc('two-digit strings', [['10', '20', '30']], [10, 20, 30]),
        tc('negative numbers', [['-5', '8']], [-5, 8]),
        tc('single value', [['42']], [42]),
        tc('empty array', [[]], []),
      ],
      title: 'The parseInt trap',
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Build one CSV line from an array of cell objects: escape each cell (wrap it in double quotes and double ' +
        'any inner quotes when the text contains a comma or a quote), then join the fields with commas. ' +
        'An empty row produces an empty string.\n\n' +
        'Signature: `solve(cells: { text: string }[]): string`',
      difficulty: 'intermediate',
      explanation:
        'This is the classic transform-then-serialize pipeline: `map` turns each cell object into its escaped field ' +
        "string, and `join(',')` glues the results into one line. `join` takes a separator argument — omit it and " +
        "you get commas anyway (the default), but being explicit documents intent; `join('')` and `join(' | ')` are " +
        "the same method doing very different jobs. Two edge behaviors earn their keep here: `[].join(',')` returns " +
        "the empty string `''` (not `','` or `undefined`), so an empty row needs no special case, and a " +
        'single-element array yields just that element with no separator. The escaping itself follows CSV rules: ' +
        'only fields containing a comma or quote get wrapped, and inner quotes are doubled (`"` becomes `""`) so a ' +
        'parser can tell a literal quote from a closing one.',
      id: 'csv-line-builder',
      methods: ['map', 'join'],
      order: 4,
      solution: code(`
export function solve(cells: { text: string }[]): string {
  return cells
    .map((cell) => {
      const needsQuoting = cell.text.includes(',') || cell.text.includes('"');
      return needsQuoting ? '"' + cell.text.replaceAll('"', '""') + '"' : cell.text;
    })
    .join(',');
}
`),
      starterCode: code(`
export function solve(cells: { text: string }[]): string {
  // map each cell to an escaped field, then join with commas.
  return '';
}
`),
      tests: [
        tc('plain fields', [[{ text: 'ada' }, { text: 'grace' }]], 'ada,grace'),
        tc('field with a comma gets quoted', [[{ text: 'lovelace, ada' }, { text: '1815' }]], '"lovelace, ada",1815'),
        tc('field with quotes doubles them', [[{ text: 'say "hi"' }]], '"say ""hi"""'),
        tc('single plain field', [[{ text: 'solo' }]], 'solo'),
        tc('empty row', [[]], ''),
      ],
      title: 'CSV line builder',
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        "Zip two arrays into pairs: `solve(['a', 'b'], [1, 2])` gives `[['a', 1], ['b', 2]]`. " +
        'When the arrays differ in length, truncate to the shorter one — no `undefined` padding.\n\n' +
        'Signature: `solve(left: string[], right: number[]): [string, number][]`',
      difficulty: 'advanced',
      explanation:
        'The zip pattern rides on `map`’s index argument: mapping over one array while indexing into the other ' +
        'pairs elements positionally — `(item, index) => [item, right[index]]`. The subtlety is *which* array to ' +
        'map over. Mapping over the longer one produces pairs with `undefined` holes where the shorter array ran ' +
        'out, so the move is to cut down to the common length first: `left.slice(0, Math.min(left.length, ' +
        'right.length))` guarantees every index that `map` visits exists in *both* arrays. `slice` returns a new ' +
        'array, so neither input is disturbed, and when either side is empty the sliced length is 0 and `map` ' +
        'simply never runs.',
      id: 'zip-into-pairs',
      methods: ['map'],
      order: 5,
      solution: code(`
export function solve(left: string[], right: number[]): [string, number][] {
  const length = Math.min(left.length, right.length);
  return left.slice(0, length).map((item, index): [string, number] => [item, right[index]]);
}
`),
      starterCode: code(`
export function solve(left: string[], right: number[]): [string, number][] {
  // map over the SHORTER side (slice to the min length), pairing by index.
  return [];
}
`),
      tests: [
        tc(
          'zips equal lengths',
          [
            ['a', 'b'],
            [1, 2],
          ],
          [
            ['a', 1],
            ['b', 2],
          ],
        ),
        tc('left side shorter', [['a'], [1, 2, 3]], [['a', 1]]),
        tc('right side shorter', [['a', 'b', 'c'], [1]], [['a', 1]]),
        tc('empty side yields empty result', [[], [1, 2]], []),
        tc(
          'pairs keep index alignment',
          [
            ['x', 'y', 'z'],
            [10, 20, 30],
          ],
          [
            ['x', 10],
            ['y', 20],
            ['z', 30],
          ],
        ),
      ],
      title: 'Zip into pairs',
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Build a lookup object from an array of `{ code, name }` records so that `lookup[code]` gives the name. ' +
        'When two records share a `code`, the later one wins.\n\n' +
        'Signature: `solve(items: { code: string; name: string }[]): Record<string, string>`',
      difficulty: 'expert',
      explanation:
        '`Object.fromEntries` inverts `Object.entries`: it consumes an iterable of `[key, value]` pairs and builds ' +
        'an object from them. Pairing it with `map` gives the idiomatic array-to-lookup transform — ' +
        '`items.map((item) => [item.code, item.name])` reshapes each record into an entry pair, and ' +
        '`Object.fromEntries` assembles the object in one step, replacing the old `reduce`-with-accumulator ' +
        'boilerplate. Duplicate keys resolve by assignment order: pairs are applied left to right, so a later pair ' +
        'with the same key silently overwrites the earlier one — “last write wins,” exactly like repeated ' +
        'assignments to the same property. That makes input order load-bearing when duplicates are possible, which ' +
        'is worth a comment in real code.',
      id: 'entries-to-lookup',
      methods: ['map', 'Object.fromEntries'],
      order: 6,
      solution: code(`
export function solve(items: { code: string; name: string }[]): Record<string, string> {
  return Object.fromEntries(items.map((item): [string, string] => [item.code, item.name]));
}
`),
      starterCode: code(`
export function solve(items: { code: string; name: string }[]): Record<string, string> {
  // map each record to a [key, value] pair, then let Object.fromEntries assemble them.
  return {};
}
`),
      tests: [
        tc(
          'builds a code-to-name lookup',
          [
            [
              { code: 'US', name: 'United States' },
              { code: 'FR', name: 'France' },
            ],
          ],
          { FR: 'France', US: 'United States' },
        ),
        tc(
          'later duplicate code wins',
          [
            [
              { code: 'US', name: 'first' },
              { code: 'US', name: 'second' },
            ],
          ],
          { US: 'second' },
        ),
        tc('single entry', [[{ code: 'JP', name: 'Japan' }]], { JP: 'Japan' }),
        tc('empty list gives an empty object', [[]], {}),
      ],
      title: 'Entries to lookup',
    },
  ],
};
