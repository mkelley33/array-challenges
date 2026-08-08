import type { TestCaseInput } from '@/execution/executor';

import { encode } from '@/lib/codec';

/**
 * Authoring helper: builds an encoded test case from plain runtime values.
 * Encoding happens at module-definition time so malformed fixtures
 * (functions, class instances) fail fast when the catalog loads.
 */
export function tc(name: string, args: unknown[], expected: unknown): TestCaseInput {
  return { args: args.map((arg) => encode(arg)), expected: encode(expected), name };
}

/** Strips the leading newline and trailing indentation from code template literals. */
export function code(source: string): string {
  return `${source.trim()}\n`;
}
