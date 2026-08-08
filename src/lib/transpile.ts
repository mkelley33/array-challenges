import { transform } from 'sucrase';

/**
 * Transpiles user-written TypeScript to CommonJS JavaScript for sandboxed execution.
 * Types are erased, not checked — challenge test cases judge behavior, so a solution
 * with unsound types but correct output still passes (and vice versa).
 */

export type TranspileResult =
  | { code: string; ok: true }
  | { column?: number; line?: number; message: string; ok: false };

const LOCATION_PATTERN = /\((\d+):(\d+)\)\s*$/;

interface MaybeLocatedError {
  loc?: { column?: number; line?: number };
}

export function transpileTs(source: string): TranspileResult {
  try {
    const { code } = transform(source, { transforms: ['typescript', 'imports'] });
    return { code, ok: true };
  } catch (error) {
    if (!(error instanceof Error)) {
      return { message: String(error), ok: false };
    }
    const located = error as Error & MaybeLocatedError;
    let line = located.loc?.line;
    let column = located.loc?.column;
    let message = error.message;
    const match = LOCATION_PATTERN.exec(message);
    if (match !== null) {
      line ??= Number(match[1]);
      column ??= Number(match[2]);
      message = message.slice(0, match.index).trim();
    }
    return { column, line, message, ok: false };
  }
}
