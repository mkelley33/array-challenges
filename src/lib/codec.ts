/**
 * Extended-JSON codec for challenge test data.
 *
 * Challenge inputs and expected outputs must live in `db.json` (plain JSON), but the
 * catalog exercises values JSON cannot express: `undefined`, `NaN`, `±Infinity`, `-0`,
 * `Date`, `Map`, and `Set`. Those are encoded as tagged objects (`{ $t: ... }`); plain
 * objects that happen to contain a literal `$t` key are wrapped in an escape tag so the
 * encoding is unambiguous. `decode(encode(x))` is also the deep-clone used to isolate
 * user solutions from shared test fixtures.
 */

const TAG_KEY = '$t';

export type Encoded = boolean | Encoded[] | null | number | string | { [key: string]: Encoded };

export class CodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CodecError';
  }
}

function isPlainObject(value: object): boolean {
  const proto: unknown = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

export function encode(value: unknown): Encoded {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return { [TAG_KEY]: 'undef' };
  }
  switch (typeof value) {
    case 'boolean':
    case 'string':
      return value;
    case 'number':
      if (Number.isNaN(value)) {
        return { [TAG_KEY]: 'nan' };
      }
      if (value === Infinity) {
        return { [TAG_KEY]: 'inf', s: 1 };
      }
      if (value === -Infinity) {
        return { [TAG_KEY]: 'inf', s: -1 };
      }
      if (Object.is(value, -0)) {
        return { [TAG_KEY]: 'negzero' };
      }
      return value;
    case 'object':
      break;
    default:
      throw new CodecError(`Cannot encode value of type ${typeof value}`);
  }

  if (Array.isArray(value)) {
    return value.map((item) => encode(item));
  }
  if (value instanceof Date) {
    return { [TAG_KEY]: 'date', v: value.toISOString() };
  }
  if (value instanceof Map) {
    return {
      [TAG_KEY]: 'map',
      v: [...value.entries()].map(([key, entry]): Encoded => [encode(key), encode(entry)]),
    };
  }
  if (value instanceof Set) {
    return { [TAG_KEY]: 'set', v: [...value].map((item) => encode(item)) };
  }
  if (!isPlainObject(value)) {
    throw new CodecError(`Cannot encode class instance (${value.constructor?.name ?? 'unknown'})`);
  }

  const entries = Object.entries(value as Record<string, unknown>);
  const encodedEntries: Record<string, Encoded> = {};
  for (const [key, entry] of entries) {
    encodedEntries[key] = encode(entry);
  }
  if (TAG_KEY in encodedEntries) {
    return { [TAG_KEY]: 'raw', v: encodedEntries };
  }
  return encodedEntries;
}

function decodeTagged(tagged: { [key: string]: Encoded }): unknown {
  const tag = tagged[TAG_KEY];
  switch (tag) {
    case 'undef':
      return undefined;
    case 'nan':
      return NaN;
    case 'inf':
      return tagged['s'] === -1 ? -Infinity : Infinity;
    case 'negzero':
      return -0;
    case 'date':
      return new Date(String(tagged['v']));
    case 'map': {
      const entries = tagged['v'];
      if (!Array.isArray(entries)) {
        throw new CodecError('Malformed map encoding');
      }
      return new Map(
        entries.map((pair) => {
          if (!Array.isArray(pair) || pair.length !== 2) {
            throw new CodecError('Malformed map entry encoding');
          }
          return [decode(pair[0] as Encoded), decode(pair[1] as Encoded)] as const;
        }),
      );
    }
    case 'set': {
      const items = tagged['v'];
      if (!Array.isArray(items)) {
        throw new CodecError('Malformed set encoding');
      }
      return new Set(items.map((item) => decode(item)));
    }
    case 'raw': {
      const raw = tagged['v'];
      if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new CodecError('Malformed raw encoding');
      }
      return decodePlainObject(raw);
    }
    default:
      throw new CodecError(`Unknown codec tag: ${String(tag)}`);
  }
}

function decodePlainObject(encoded: { [key: string]: Encoded }): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(encoded)) {
    result[key] = decode(entry);
  }
  return result;
}

export function decode(encoded: Encoded): unknown {
  if (encoded === null || typeof encoded !== 'object') {
    return encoded;
  }
  if (Array.isArray(encoded)) {
    return encoded.map((item) => decode(item));
  }
  if (TAG_KEY in encoded) {
    return decodeTagged(encoded);
  }
  return decodePlainObject(encoded);
}
