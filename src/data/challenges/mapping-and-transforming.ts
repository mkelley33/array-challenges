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
        'Build a lookup object from an array of `{ code, name }` records so that `lookup[code]` gives the name. ' +
        'When two records share a `code`, the later one wins.\n\n' +
        'Signature: `solve(items: { code: string; name: string }[]): Record<string, string>`',
      difficulty: 'intermediate',
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
      order: 5,
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
      order: 6,
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
      trap: code(`
export function solve(left: string[], right: number[]): [string, number][] {
  return left.map((item, index): [string, number] => [item, right[index]]);
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Render log rows as text: each row becomes one comma-separated line and the lines are joined with ' +
        'newlines. A cell may itself be a list — `[200, "OK"]` renders inline as `200,OK` — and a missing cell ' +
        '(`null` or `undefined`) renders as nothing at all, so `["GET", null, 200]` becomes `GET,,200`.\n\n' +
        'Signature: `solve(rows: (string | number | null | undefined | (string | number)[])[][]): string`\n\n' +
        'An array already knows how to render itself this way — `toString` does every part of the job.',
      difficulty: 'advanced',
      explanation:
        '`Array.prototype.toString` is `join(",")` with two behaviours people forget. It converts each element ' +
        'with the abstract ToString operation, which renders `null` and `undefined` as the *empty string* — unlike ' +
        '`String(null)`, which gives `"null"` — and because an array’s own ToString is itself `join`, a nested ' +
        'array renders flattened and inline: `[200, ["OK"]]` becomes `"200,OK"`. So `map` turns each row into its ' +
        'line with `row.toString()` and `join("\\n")` stacks the lines. The tempting version, ' +
        '`row.map(String).join(",")`, converts each cell explicitly and prints the literal words `null` and ' +
        '`undefined` into the log. `JSON.stringify` is wrong in the other direction: it keeps brackets and quotes. ' +
        'When the target format is exactly “comma-separated, blank for missing”, the array already knows how to ' +
        'render itself; the mistake is doing by hand what ToString already does.',
      id: 'log-rows-to-lines',
      methods: ['toString', 'map', 'join'],
      order: 7,
      solution: code(`
type Cell = (number | string)[] | null | number | string | undefined;

export function solve(rows: Cell[][]): string {
  return rows.map((row) => row.toString()).join('\\n');
}
`),
      starterCode: code(`
type Cell = (number | string)[] | null | number | string | undefined;

export function solve(rows: Cell[][]): string {
  // Each row can render itself as one line — which method does that, and what does it print for null?
  return '';
}
`),
      tests: [
        tc(
          'plain cells',
          [
            [
              ['GET', '/home', 200],
              ['POST', '/login', 302],
            ],
          ],
          'GET,/home,200\nPOST,/login,302',
        ),
        tc('null cell renders as nothing (trap)', [[['GET', null, 200]]], 'GET,,200'),
        tc('undefined cell renders as nothing (trap)', [[['GET', undefined, 200]]], 'GET,,200'),
        tc('nested list cell flattens inline', [[['GET', [200, 'OK']]]], 'GET,200,OK'),
        tc('empty row is an empty line', [[['a'], [], ['b']]], 'a\n\nb'),
        tc('no rows', [[]], ''),
      ],
      title: 'Log rows to lines',
      trap: code(`
type Cell = (number | string)[] | null | number | string | undefined;

export function solve(rows: Cell[][]): string {
  return rows.map((row) => row.map(String).join(',')).join('\\n');
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Apply a percentage discount to every product and return a tuple `[discounted, products]`: the first ' +
        'element carries the new prices, rounded to whole cents; the second is the `products` array you were ' +
        'given — still holding the original prices.\n\n' +
        'Signature: `solve(products: { name: string; price: number }[], percent: number): [{ name: string; price: number }[], { name: string; price: number }[]]`\n\n' +
        '`map` returns a new array, but not new objects — that is the whole trap.',
      difficulty: 'advanced',
      explanation:
        '`map` allocates a fresh outer array, and that is *all* it allocates: every element the callback receives ' +
        'is the very same object that sits in `products`. Writing `product.price = …` inside the callback therefore ' +
        'edits the caller’s data in place, and returning `product` just files the mutated object into the new ' +
        'array — both halves of the tuple end up pointing at objects with the discounted price, and the original ' +
        'is gone. The fix is to have the callback build a new object per element, `({ ...product, price: … })`, so ' +
        'the shallow copy of the array becomes a real copy at the depth you changed. `map` is still the right tool; ' +
        'the rule is that it copies the *container*, not the contents, and the contents are your responsibility. ' +
        '`Math.round` keeps the result in whole cents.',
      id: 'discount-without-mutating',
      methods: ['map'],
      order: 8,
      solution: code(`
interface Product {
  name: string;
  price: number;
}

export function solve(products: Product[], percent: number): [Product[], Product[]] {
  const discounted = products.map((product) => ({
    ...product,
    price: Math.round((product.price * (100 - percent)) / 100),
  }));
  return [discounted, products];
}
`),
      starterCode: code(`
interface Product {
  name: string;
  price: number;
}

export function solve(products: Product[], percent: number): [Product[], Product[]] {
  // map hands you the same objects it was given — build a fresh one before changing price.
  return [[], products];
}
`),
      tests: [
        tc(
          'original keeps its prices (trap)',
          [
            [
              { name: 'pen', price: 200 },
              { name: 'ink', price: 1000 },
            ],
            50,
          ],
          [
            [
              { name: 'pen', price: 100 },
              { name: 'ink', price: 500 },
            ],
            [
              { name: 'pen', price: 200 },
              { name: 'ink', price: 1000 },
            ],
          ],
        ),
        tc(
          'rounds to whole cents (trap)',
          [[{ name: 'gum', price: 99 }], 10],
          [[{ name: 'gum', price: 89 }], [{ name: 'gum', price: 99 }]],
        ),
        tc(
          'half a cent rounds up (trap)',
          [[{ name: 'tag', price: 5 }], 50],
          [[{ name: 'tag', price: 3 }], [{ name: 'tag', price: 5 }]],
        ),
        tc(
          'zero percent leaves prices alone',
          [[{ name: 'cup', price: 50 }], 0],
          [[{ name: 'cup', price: 50 }], [{ name: 'cup', price: 50 }]],
        ),
        tc(
          'full discount is free',
          [[{ name: 'cup', price: 50 }], 100],
          [[{ name: 'cup', price: 0 }], [{ name: 'cup', price: 50 }]],
        ),
        tc('no products', [[], 25], [[], []]),
      ],
      title: 'Discount without mutating',
      trap: code(`
interface Product {
  name: string;
  price: number;
}

export function solve(products: Product[], percent: number): [Product[], Product[]] {
  const discounted = products.map((product) => {
    product.price = Math.round((product.price * (100 - percent)) / 100);
    return product;
  });
  return [discounted, products];
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Reverse the letters of every word in `sentence` while keeping the words in their original order, ' +
        'separated by single spaces: `"hello world"` becomes `"olleh dlrow"`.\n\n' +
        'Signature: `solve(sentence: string): string`\n\n' +
        'Split, `map` each word through a reversal, and `join` — and check what `join` does when you pass it nothing.',
      difficulty: 'advanced',
      explanation:
        '`join` has a default separator, and it is not the empty string: called with no argument it inserts a ' +
        'comma, so `["c", "b", "a"].join()` is `"c,b,a"` and the reversed word comes out as `"o,l,l,e,h"`. Passing ' +
        '`""` explicitly is the only way to concatenate. The rest of the pipeline is a textbook nested transform: ' +
        '`split(" ")` breaks the sentence into words, `map` reverses each word in isolation by spreading it into ' +
        'characters, reversing, and joining with `""`, and the outer `join(" ")` restores the spaces. Keeping the ' +
        'inner and outer separators distinct is what makes the structure survive: the inner `join` glues letters, ' +
        'the outer glues words. An empty sentence splits into `[""]`, reverses to `""`, and joins back to `""`, so ' +
        'no guard is needed.',
      id: 'reverse-each-word',
      methods: ['join', 'map'],
      order: 9,
      solution: code(`
export function solve(sentence: string): string {
  return sentence
    .split(' ')
    .map((word) => [...word].reverse().join(''))
    .join(' ');
}
`),
      starterCode: code(`
export function solve(sentence: string): string {
  // Words are joined by spaces; letters inside a word are joined by nothing — say so explicitly.
  return sentence;
}
`),
      tests: [
        tc('two words (trap)', ['hello world'], 'olleh dlrow'),
        tc('single word (trap)', ['abc'], 'cba'),
        tc('single letters are unchanged', ['a b c'], 'a b c'),
        tc('palindrome word stays put', ['level up'], 'level pu'),
        tc('empty string', [''], ''),
      ],
      title: 'Reverse each word',
      trap: code(`
export function solve(sentence: string): string {
  return sentence
    .split(' ')
    .map((word) => [...word].reverse().join())
    .join(' ');
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Return every character of `text` wrapped in square brackets: `"ab"` becomes `["[a]", "[b]"]`. ' +
        'Characters outside the Basic Multilingual Plane — emoji such as `"😀"` — must stay in one piece.\n\n' +
        'Signature: `solve(text: string): string[]`\n\n' +
        'How you turn the string into an array decides whether an emoji survives the `map`.',
      difficulty: 'advanced',
      explanation:
        '`split("")` slices a string at every UTF-16 *code unit*, and an emoji like `"😀"` is stored as a ' +
        'surrogate pair — two code units — so it splits into two broken halves that each render as `�`. The ' +
        'string iterator, reached through spread (`[...text]`) or `Array.from(text)`, walks *code points* instead ' +
        'and yields the emoji whole. Once the array holds real characters, `map` is the natural one-to-one ' +
        'transform: every character becomes exactly one wrapped string, and the output length matches the ' +
        'character count a person would give. The trap is invisible on ASCII input, which is why the tests include ' +
        'emoji. When you need a per-character `map` over user text, always start from the iterator; `split("")` ' +
        'is a legacy idiom from before strings were iterable.',
      id: 'wrap-each-character',
      methods: ['map'],
      order: 10,
      solution: code(`
export function solve(text: string): string[] {
  return [...text].map((char) => '[' + char + ']');
}
`),
      starterCode: code(`
export function solve(text: string): string[] {
  // Get an array of characters first — the string iterator, not split(''), respects surrogate pairs.
  return [];
}
`),
      tests: [
        tc('ascii letters', ['ab'], ['[a]', '[b]']),
        tc('emoji stays whole (trap)', ['a😀b'], ['[a]', '[😀]', '[b]']),
        tc('two emoji in a row (trap)', ['😀😀'], ['[😀]', '[😀]']),
        tc('single character', ['x'], ['[x]']),
        tc('empty string', [''], []),
      ],
      title: 'Wrap each character',
      trap: code(`
export function solve(text: string): string[] {
  return text.split('').map((char) => '[' + char + ']');
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Build a settings object from `[key, value]` pairs listed in priority order — user overrides first, then ' +
        'team settings, then defaults. When a key appears more than once, the *earliest* pair wins.\n\n' +
        'Signature: `solve(pairs: [string, string][]): Record<string, string>`\n\n' +
        '`Object.fromEntries` builds the object, but it has its own opinion about which duplicate wins.',
      difficulty: 'advanced',
      explanation:
        '`Object.fromEntries` consumes its pairs in order and assigns each one, so with duplicates the *last* ' +
        'assignment stands — “last write wins”, the same as writing `obj.theme = "dark"` and then ' +
        '`obj.theme = "light"`. Fed a priority-ordered list directly, it therefore promotes the lowest-priority ' +
        'layer, and the user’s choice is silently overwritten by the default. The smallest correct move is to hand ' +
        'it the pairs in the opposite order: `pairs.toReversed()` makes the highest-priority pair the last one ' +
        'applied, and because `toReversed` copies rather than mutating, the caller’s list is untouched. The ' +
        'alternative is filtering to the first occurrence of each key before building, which is more code for the ' +
        'same result. The general lesson: whenever input order encodes priority, decide explicitly whether your ' +
        'builder keeps first or last — `Object.fromEntries`, `Map`, and spread all keep last.',
      id: 'first-pair-wins',
      methods: ['Object.fromEntries', 'toReversed'],
      order: 11,
      solution: code(`
export function solve(pairs: [string, string][]): Record<string, string> {
  return Object.fromEntries(pairs.toReversed());
}
`),
      starterCode: code(`
export function solve(pairs: [string, string][]): Record<string, string> {
  // fromEntries applies pairs left to right, so the LAST duplicate wins — arrange the pairs accordingly.
  return {};
}
`),
      tests: [
        tc(
          'user override beats the default (trap)',
          [
            [
              ['theme', 'dark'],
              ['lang', 'en'],
              ['theme', 'light'],
            ],
          ],
          { lang: 'en', theme: 'dark' },
        ),
        tc(
          'three layers of the same key (trap)',
          [
            [
              ['a', '1'],
              ['a', '2'],
              ['a', '3'],
            ],
          ],
          { a: '1' },
        ),
        tc(
          'no duplicates',
          [
            [
              ['x', '1'],
              ['y', '2'],
            ],
          ],
          { x: '1', y: '2' },
        ),
        tc('single pair', [[['k', 'v']]], { k: 'v' }),
        tc('no pairs', [[]], {}),
      ],
      title: 'First pair wins',
      trap: code(`
export function solve(pairs: [string, string][]): Record<string, string> {
  return Object.fromEntries(pairs);
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Convert a series of readings into changes: each output element is the reading minus the one before it, ' +
        'and the first reading (which has no predecessor) reports a change of `0`.\n\n' +
        'Signature: `solve(readings: number[]): number[]`\n\n' +
        '`map` gives you the index — the question is what sits at `index - 1` on the first step.',
      difficulty: 'advanced',
      explanation:
        'A delta needs the previous element, and `map` makes it reachable through its second and third arguments, ' +
        '`(reading, index, array)`, so `readings[index - 1]` is the predecessor without any loop bookkeeping. The ' +
        'trap is the first step. At `index === 0` the lookup is `readings[-1]`, which is `undefined`, and ' +
        '`reading - undefined` is `NaN`; nothing throws, the array has the right length, and the poison sits at ' +
        'position 0 until a chart or a sum reveals it. The fix is to treat the first element explicitly — return ' +
        '`0` when `index === 0` — or to default the predecessor to the reading itself with ' +
        '`readings[index - 1] ?? reading`. Either way `map` remains the right shape for this problem, because every ' +
        'output depends on a *fixed* neighbourhood of the input; a running total, which depends on everything ' +
        'before it, belongs to `reduce`.',
      id: 'deltas-from-previous',
      methods: ['map'],
      order: 12,
      solution: code(`
export function solve(readings: number[]): number[] {
  return readings.map((reading, index) => (index === 0 ? 0 : reading - readings[index - 1]));
}
`),
      starterCode: code(`
export function solve(readings: number[]): number[] {
  // Subtract the previous reading — and decide what "previous" means at index 0.
  return [];
}
`),
      tests: [
        tc('rising then falling (trap)', [[10, 13, 11]], [0, 3, -2]),
        tc('single reading has no delta (trap)', [[7]], [0]),
        tc('flat series', [[5, 5, 5]], [0, 0, 0]),
        tc('negative readings', [[-3, -1, -6]], [0, 2, -5]),
        tc('empty series', [[]], []),
      ],
      title: 'Deltas from the previous reading',
      trap: code(`
export function solve(readings: number[]): number[] {
  return readings.map((reading, index) => reading - readings[index - 1]);
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Invert `lookup` so each value becomes a key whose value is the list of original keys that mapped to it, ' +
        'in their original order: `{ a: 1, b: 2, c: 1 }` becomes `{ "1": ["a", "c"], "2": ["b"] }`.\n\n' +
        'Signature: `solve(lookup: Record<string, number>): Record<string, string[]>`\n\n' +
        'Three steps compose here: take the entries apart, group the keys by value, and let `Object.fromEntries` ' +
        'put the result back together.',
      difficulty: 'expert',
      explanation:
        'Inverting a record is only trivial when the values are unique. Because a plain ' +
        '`Object.fromEntries(entries.map(([k, v]) => [v, k]))` assigns pairs left to right, two keys sharing a ' +
        'value collapse to whichever came last, and the first key vanishes without a warning. The robust pipeline ' +
        'has three stages. `Object.entries` exposes the `[key, value]` pairs; `Map.groupBy` buckets those pairs by ' +
        'value, preserving encounter order inside each bucket, which is what keeps `["a", "c"]` in the original ' +
        'order; then `map` reshapes each bucket into `[value, keys]` — projecting the pairs down to their keys — ' +
        'and `Object.fromEntries` reassembles the object. Grouping is the step the naive version skips: it turns a ' +
        'many-to-one relation into one-to-many explicitly, so no assignment ever overwrites another. Grouping by ' +
        '`String(value)` up front is deliberate: object keys are strings, and matching that early avoids a ' +
        'mismatch later.',
      id: 'invert-with-collisions',
      methods: ['Object.entries', 'Map.groupBy', 'map', 'Object.fromEntries'],
      order: 13,
      solution: code(`
export function solve(lookup: Record<string, number>): Record<string, string[]> {
  const grouped = Map.groupBy(Object.entries(lookup), ([, value]) => String(value));
  return Object.fromEntries([...grouped].map(([value, pairs]) => [value, pairs.map(([key]) => key)]));
}
`),
      starterCode: code(`
export function solve(lookup: Record<string, number>): Record<string, string[]> {
  // Entries out, group the pairs by value, map each group to [value, keys], entries back in.
  return {};
}
`),
      tests: [
        tc('two keys share a value (trap)', [{ a: 1, b: 2, c: 1 }], { '1': ['a', 'c'], '2': ['b'] }),
        tc('no collisions', [{ x: 10, y: 20 }], { '10': ['x'], '20': ['y'] }),
        tc('every key shares one value (trap)', [{ a: 0, b: 0, c: 0 }], { '0': ['a', 'b', 'c'] }),
        tc('single entry', [{ only: 7 }], { '7': ['only'] }),
        tc('empty lookup', [{}], {}),
      ],
      title: 'Invert a lookup, collisions included',
      trap: code(`
export function solve(lookup: Record<string, number>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(lookup).map(([key, value]) => [value, [key]]));
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Rename the keys of every record according to `renames`, a plain object mapping old key → new key. Keys ' +
        'that are not in `renames` pass through unchanged, and a rename for a key the record does not have adds ' +
        'nothing.\n\n' +
        'Signature: `solve(records: Record<string, unknown>[], renames: Record<string, string>): Record<string, unknown>[]`\n\n' +
        'Each record is taken apart with `Object.entries`, reshaped with `map`, and rebuilt with `Object.fromEntries`.',
      difficulty: 'expert',
      explanation:
        'A rename is a per-entry transform, so the record has to be dismantled into entries first. ' +
        '`Object.entries` yields `[key, value]` pairs, `map` swaps in the new name with `renames[key] ?? key` — the ' +
        '`??` is what lets unmapped keys pass through — and `Object.fromEntries` folds the pairs back into an ' +
        'object; the outer `map` applies that to every record. The tempting shortcut iterates the *mapping* ' +
        'instead of the record: `Object.entries(renames).map(([from, to]) => [to, record[from]])`. It drops every ' +
        'key the mapping does not mention, and for a renamed key the record lacks it manufactures ' +
        '`{ contact: undefined }`, a key that did not exist before. Driving the transform from the data rather ' +
        'than from the rules keeps the output a faithful reshaping of the input, and the mapping stays pure ' +
        'configuration that can be loaded from JSON.',
      id: 'rename-keys-by-map',
      methods: ['Object.entries', 'map', 'Object.fromEntries'],
      order: 14,
      solution: code(`
export function solve(records: Record<string, unknown>[], renames: Record<string, string>): Record<string, unknown>[] {
  return records.map((record) =>
    Object.fromEntries(Object.entries(record).map(([key, value]) => [renames[key] ?? key, value])),
  );
}
`),
      starterCode: code(`
export function solve(records: Record<string, unknown>[], renames: Record<string, string>): Record<string, unknown>[] {
  // Walk each record's entries (not the mapping's), swap the key when a rename exists, rebuild the object.
  return records;
}
`),
      tests: [
        tc(
          'snake_case to camelCase, other keys pass through (trap)',
          [[{ age: 36, first_name: 'Ada' }], { first_name: 'firstName' }],
          [{ age: 36, firstName: 'Ada' }],
        ),
        tc('rename for an absent key adds nothing (trap)', [[{ id: 1 }], { email: 'contact' }], [{ id: 1 }]),
        tc('several renames at once', [[{ a: 1, b: 2, c: 3 }], { a: 'x', c: 'z' }], [{ b: 2, x: 1, z: 3 }]),
        tc(
          'records of different shapes',
          [[{ a: 1 }, { a: 2, b: 3 }], { a: 'alpha' }],
          [{ alpha: 1 }, { alpha: 2, b: 3 }],
        ),
        tc('empty renames leaves records alone', [[{ k: 'v' }], {}], [{ k: 'v' }]),
        tc('no records', [[], { a: 'b' }], []),
      ],
      title: 'Rename keys from a mapping',
      trap: code(`
export function solve(records: Record<string, unknown>[], renames: Record<string, string>): Record<string, unknown>[] {
  return records.map((record) =>
    Object.fromEntries(Object.entries(renames).map(([from, to]) => [to, record[from]])),
  );
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Normalise `records` against `defaults`: every output object has exactly the keys of `defaults` — a key ' +
        'the record has keeps the record’s value (even when that value is `null`), a key it lacks takes the ' +
        'default, and any extra key on the record is dropped.\n\n' +
        'Signature: `solve(records: Record<string, unknown>[], defaults: Record<string, unknown>): Record<string, unknown>[]`\n\n' +
        'The key list comes from `defaults`, so build each record from `Object.entries(defaults)` and `Object.fromEntries`.',
      difficulty: 'expert',
      explanation:
        '`defaults` is doing double duty here: it supplies fallback values *and* it defines the exact set of keys ' +
        'the output may have. `Object.entries(defaults)` is therefore the right thing to iterate — one pair per ' +
        'allowed key — and `map` decides each pair’s value with `key in record ? record[key] : fallback`, which ' +
        'honours a present `null` because the `in` test asks about presence, not nullishness; ' +
        '`record[key] ?? fallback` would quietly replace it. `Object.fromEntries` then assembles the conformed ' +
        'object, and the outer `map` does it per record. Spreading, `{ ...defaults, ...record }`, is the tempting ' +
        'one-liner: it fills gaps correctly but copies every extra key straight through, so the output shape ' +
        'depends on whatever the caller sent. Driving the build from the schema makes the output shape a guarantee ' +
        'rather than a hope.',
      id: 'conform-records-to-defaults',
      methods: ['Object.entries', 'map', 'Object.fromEntries'],
      order: 15,
      solution: code(`
export function solve(
  records: Record<string, unknown>[],
  defaults: Record<string, unknown>,
): Record<string, unknown>[] {
  return records.map((record) =>
    Object.fromEntries(
      Object.entries(defaults).map(([key, fallback]) => [key, key in record ? record[key] : fallback]),
    ),
  );
}
`),
      starterCode: code(`
export function solve(
  records: Record<string, unknown>[],
  defaults: Record<string, unknown>,
): Record<string, unknown>[] {
  // Iterate the entries of defaults, not of the record — and test presence with "in", not ??.
  return records;
}
`),
      tests: [
        tc(
          'extra keys are dropped (trap)',
          [[{ name: 'Ada', role: 'admin' }], { active: true, name: '' }],
          [{ active: true, name: 'Ada' }],
        ),
        tc(
          'missing keys take the default',
          [[{ name: 'Bob' }], { active: true, name: '' }],
          [{ active: true, name: 'Bob' }],
        ),
        tc('null is a value, not a gap', [[{ name: null }], { name: 'anon' }], [{ name: null }]),
        tc(
          'mixed records',
          [[{}, { a: 2, z: 9 }], { a: 1, b: 2 }],
          [
            { a: 1, b: 2 },
            { a: 2, b: 2 },
          ],
        ),
        tc('no records', [[], { a: 1 }], []),
      ],
      title: 'Conform records to a schema',
      trap: code(`
export function solve(
  records: Record<string, unknown>[],
  defaults: Record<string, unknown>,
): Record<string, unknown>[] {
  return records.map((record) => ({ ...defaults, ...record }));
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Render a rectangular grid of strings as an aligned text table: every cell is padded on the right to the ' +
        'width of the widest cell *in its column*, cells are joined with `" | "`, and rows are joined with ' +
        'newlines. No rows renders as an empty string.\n\n' +
        'Signature: `solve(rows: string[][]): string`\n\n' +
        'Column widths need a pass down each column before `map` and `join` can lay out the rows.',
      difficulty: 'expert',
      explanation:
        'A table is aligned by *column*, so the widths must be measured across rows before any row can be ' +
        'rendered — that is the transpose-shaped step. ' +
        '`rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)))` walks the columns of the ' +
        'first row and, for each, looks down every row to find the widest cell. With the widths known, rendering ' +
        'is two nested `map`s and two `join`s: each cell is `padEnd`ed to its column width, cells are joined with ' +
        '`" | "`, and rows with `"\\n"`. The tempting shortcut measures each row on its own, which pads every cell ' +
        'in a row to that row’s widest cell — the columns drift the moment a longer value shows up further down. ' +
        'The empty guard matters too: `rows[0]` is `undefined` when there are no rows, and `Math.max()` of nothing ' +
        'is `-Infinity`.',
      id: 'ascii-table',
      methods: ['map', 'join', 'padEnd'],
      order: 16,
      solution: code(`
export function solve(rows: string[][]): string {
  if (rows.length === 0) {
    return '';
  }
  const widths = rows[0].map((_cell, column) => Math.max(...rows.map((row) => row[column].length)));
  return rows.map((row) => row.map((cell, column) => cell.padEnd(widths[column])).join(' | ')).join('\\n');
}
`),
      starterCode: code(`
export function solve(rows: string[][]): string {
  // Measure each column across ALL rows first, then padEnd every cell to its column's width.
  return '';
}
`),
      tests: [
        tc(
          'widest cell sits in a later row (trap)',
          [
            [
              ['id', 'name'],
              ['1', 'Grace Hopper'],
            ],
          ],
          'id | name        \n1  | Grace Hopper',
        ),
        tc(
          'already equal widths',
          [
            [
              ['a', 'b'],
              ['c', 'd'],
            ],
          ],
          'a | b\nc | d',
        ),
        tc('single row', [[['x', 'yy', 'zzz']]], 'x | yy | zzz'),
        tc('single column', [[['one'], ['three'], ['sixty']]], 'one  \nthree\nsixty'),
        tc(
          'empty cells are padded (trap)',
          [
            [
              ['', 'b'],
              ['aa', ''],
            ],
          ],
          '   | b\naa |  ',
        ),
        tc('no rows', [[]], ''),
      ],
      title: 'Render an ASCII table',
      trap: code(`
export function solve(rows: string[][]): string {
  return rows
    .map((row) => {
      const width = Math.max(...row.map((cell) => cell.length));
      return row.map((cell) => cell.padEnd(width)).join(' | ');
    })
    .join('\\n');
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Flatten a nested object into a single level whose keys are dot-separated paths: ' +
        '`{ a: { b: 1, c: { d: 2 } }, e: 3 }` becomes `{ "a.b": 1, "a.c.d": 2, e: 3 }`. Only plain objects nest — ' +
        'arrays, `null`, and primitives are leaves. An empty nested object contributes nothing.\n\n' +
        'Signature: `solve(source: Record<string, unknown>): Record<string, unknown>`\n\n' +
        '`Object.entries`, a recursive `flatMap`, and `Object.fromEntries` do this in one expression each.',
      difficulty: 'expert',
      explanation:
        'Flattening is recursion over entries, and `flatMap` is the method that lets a recursive step return ' +
        '*several* pairs or *none* and still land in one flat list. `Object.entries` opens the current level; for ' +
        'each `[key, value]` the callback either returns the single leaf pair `[path, value]` or recurses into a ' +
        'plain-object value with the extended prefix and returns everything it found — `flatMap` splices those ' +
        'results in at the right depth, which is why an empty nested object simply vanishes. `Object.fromEntries` ' +
        'turns the finished path list back into an object. The one-level version, mapping over ' +
        '`Object.entries(value)` inside the callback, handles `a.b` and stops: `a.c` comes back as a nested object ' +
        'instead of `a.c.d`. Recursing *through* the same helper is what makes depth irrelevant. The leaf test must ' +
        'exclude arrays and `null`: both report `typeof "object"`, and neither should be walked.',
      id: 'flatten-object-paths',
      methods: ['Object.entries', 'flatMap', 'Object.fromEntries'],
      order: 17,
      solution: code(`
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function pathEntries(source: Record<string, unknown>, prefix: string): [string, unknown][] {
  return Object.entries(source).flatMap(([key, value]): [string, unknown][] => {
    const path = prefix === '' ? key : prefix + '.' + key;
    return isPlainObject(value) ? pathEntries(value, path) : [[path, value]];
  });
}

export function solve(source: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(pathEntries(source, ''));
}
`),
      starterCode: code(`
export function solve(source: Record<string, unknown>): Record<string, unknown> {
  // A helper that flatMaps entries and calls itself for plain-object values, carrying the path prefix.
  return source;
}
`),
      tests: [
        tc('three levels deep (trap)', [{ a: { b: 1, c: { d: 2 } }, e: 3 }], { 'a.b': 1, 'a.c.d': 2, e: 3 }),
        tc('already flat', [{ x: 1, y: 'two' }], { x: 1, y: 'two' }),
        tc('arrays are leaves', [{ list: { items: [1, 2] } }], { 'list.items': [1, 2] }),
        tc('null is a leaf', [{ a: { b: null } }], { 'a.b': null }),
        tc('empty nested object contributes nothing', [{ a: {}, b: 1 }], { b: 1 }),
        tc('empty source', [{}], {}),
      ],
      title: 'Flatten nested keys into paths',
      trap: code(`
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function solve(source: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(source).flatMap(([key, value]): [string, unknown][] =>
      isPlainObject(value) ? Object.entries(value).map(([inner, leaf]) => [key + '.' + inner, leaf]) : [[key, value]],
    ),
  );
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Serialise `params` as a URL query string: `key=value` pairs joined with `&`, keys in the object’s own ' +
        'order, every key and value passed through `encodeURIComponent`. An array value expands to one pair per ' +
        'element (`tags=x&tags=y`); a `null` or `undefined` value is omitted entirely. No pairs at all gives an ' +
        'empty string.\n\n' +
        'Signature: `solve(params: Record<string, unknown>): string`\n\n' +
        '`Object.entries`, `flatMap`, `map`, and `join` — and beware of what `String` does to an array.',
      difficulty: 'expert',
      explanation:
        'The shape of this problem is one-to-*many*: a single entry can produce several pairs or none, which is ' +
        'exactly the case `map` cannot express and `flatMap` can. `Object.entries` exposes the pairs in insertion ' +
        'order; `flatMap` returns `[]` for a `null` or `undefined` value (dropping it), wraps a scalar in a ' +
        'one-element array, and `map`s each item to `key=value`, so an array value becomes one pair per element ' +
        'and an empty array becomes nothing; `join("&")` closes the string. The tempting `map`-and-`String` ' +
        'version stringifies the array as `"x,y"` — `Array.prototype.toString` joining with commas — and then ' +
        'encodes the comma to `%2C`, producing a single parameter with a value the server will not split. ' +
        '`encodeURIComponent` on both key and value is the boundary that keeps `&`, `=`, and `/` from being read ' +
        'as syntax.',
      id: 'query-string-from-object',
      methods: ['Object.entries', 'flatMap', 'map', 'join'],
      order: 18,
      solution: code(`
export function solve(params: Record<string, unknown>): string {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      if (value === null || value === undefined) {
        return [];
      }
      const values = Array.isArray(value) ? value : [value];
      return values.map((item) => encodeURIComponent(key) + '=' + encodeURIComponent(String(item)));
    })
    .join('&');
}
`),
      starterCode: code(`
export function solve(params: Record<string, unknown>): string {
  // One entry can become zero pairs (null) or many (array) — that is flatMap territory, not map.
  return '';
}
`),
      tests: [
        tc('array value repeats the key (trap)', [{ q: 'a b', tags: ['x', 'y'] }], 'q=a%20b&tags=x&tags=y'),
        tc('null and undefined are omitted', [{ a: 1, b: null, c: undefined, d: 'x' }], 'a=1&d=x'),
        tc('special characters are encoded', [{ redirect: '/home?x=1&y=2' }], 'redirect=%2Fhome%3Fx%3D1%26y%3D2'),
        tc('booleans and numbers serialise as text', [{ exact: false, page: 2 }], 'exact=false&page=2'),
        tc('empty array contributes nothing (trap)', [{ page: 1, tags: [] }], 'page=1'),
        tc('no params', [{}], ''),
      ],
      title: 'Object to query string',
      trap: code(`
export function solve(params: Record<string, unknown>): string {
  return Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => encodeURIComponent(key) + '=' + encodeURIComponent(String(value)))
    .join('&');
}
`),
    },
    {
      categoryId: 'mapping-and-transforming',
      description:
        'Pivot flat sales rows into a nested table keyed by region, then by quarter, summing `amount` when the ' +
        'same region and quarter appear more than once: `[{ region: "EU", quarter: "Q1", amount: 5 }, ' +
        '{ region: "EU", quarter: "Q1", amount: 2 }]` becomes `{ EU: { Q1: 7 } }`.\n\n' +
        'Signature: `solve(rows: { amount: number; quarter: string; region: string }[]): Record<string, Record<string, number>>`\n\n' +
        'Group, then `reduce` each group into its quarter totals, then let `map` and `Object.fromEntries` rebuild ' +
        'the outer object.',
      difficulty: 'expert',
      explanation:
        'A pivot is a group-then-aggregate, and each half has a method. `Map.groupBy` splits the rows by `region` ' +
        'into buckets that keep encounter order; spreading the map yields `[region, rows]` pairs, `map` turns each ' +
        'bucket into `[region, quarterTotals]`, and `Object.fromEntries` builds the outer object. The inner step ' +
        'is where the trap lives: `Object.fromEntries(sales.map(({ quarter, amount }) => [quarter, amount]))` ' +
        'looks like the obvious mirror of the outer step, but `Object.fromEntries` keeps the *last* pair per key, ' +
        'so a second `Q1` row for the same region overwrites the first instead of adding to it. Aggregation needs a ' +
        'fold — `reduce` with a `{}` seed and `(totals[quarter] ?? 0) + amount` — so that every row contributes. ' +
        'The pattern generalises: whenever the inner key can repeat, the inner builder must be a `reduce`, not a ' +
        '`fromEntries`.',
      id: 'pivot-sales-table',
      methods: ['Map.groupBy', 'map', 'Object.fromEntries', 'reduce'],
      order: 19,
      solution: code(`
interface SaleRow {
  amount: number;
  quarter: string;
  region: string;
}

export function solve(rows: SaleRow[]): Record<string, Record<string, number>> {
  const byRegion = Map.groupBy(rows, (row) => row.region);
  return Object.fromEntries(
    [...byRegion].map(([region, sales]) => [
      region,
      sales.reduce<Record<string, number>>((totals, { amount, quarter }) => {
        totals[quarter] = (totals[quarter] ?? 0) + amount;
        return totals;
      }, {}),
    ]),
  );
}
`),
      starterCode: code(`
interface SaleRow {
  amount: number;
  quarter: string;
  region: string;
}

export function solve(rows: SaleRow[]): Record<string, Record<string, number>> {
  // Group by region, fold each group into quarter totals, then fromEntries the outer pairs.
  return {};
}
`),
      tests: [
        tc(
          'repeated region and quarter sum (trap)',
          [
            [
              { amount: 5, quarter: 'Q1', region: 'EU' },
              { amount: 2, quarter: 'Q1', region: 'EU' },
            ],
          ],
          { EU: { Q1: 7 } },
        ),
        tc(
          'two regions, two quarters',
          [
            [
              { amount: 5, quarter: 'Q1', region: 'EU' },
              { amount: 3, quarter: 'Q1', region: 'US' },
              { amount: 4, quarter: 'Q2', region: 'EU' },
              { amount: 1, quarter: 'Q2', region: 'US' },
            ],
          ],
          { EU: { Q1: 5, Q2: 4 }, US: { Q1: 3, Q2: 1 } },
        ),
        tc(
          'regions with different quarters',
          [
            [
              { amount: 1, quarter: 'Q1', region: 'EU' },
              { amount: 9, quarter: 'Q3', region: 'US' },
            ],
          ],
          { EU: { Q1: 1 }, US: { Q3: 9 } },
        ),
        tc(
          'interleaved rows still sum (trap)',
          [
            [
              { amount: 1, quarter: 'Q1', region: 'EU' },
              { amount: 1, quarter: 'Q1', region: 'US' },
              { amount: 1, quarter: 'Q1', region: 'EU' },
            ],
          ],
          { EU: { Q1: 2 }, US: { Q1: 1 } },
        ),
        tc('single row', [[{ amount: 12, quarter: 'Q4', region: 'APAC' }]], { APAC: { Q4: 12 } }),
        tc('no rows', [[]], {}),
      ],
      title: 'Pivot rows into a nested table',
      trap: code(`
interface SaleRow {
  amount: number;
  quarter: string;
  region: string;
}

export function solve(rows: SaleRow[]): Record<string, Record<string, number>> {
  const byRegion = Map.groupBy(rows, (row) => row.region);
  return Object.fromEntries(
    [...byRegion].map(([region, sales]) => [
      region,
      Object.fromEntries(sales.map(({ amount, quarter }) => [quarter, amount])),
    ]),
  );
}
`),
    },
  ],
};
