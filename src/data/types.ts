import type { TestCaseInput } from '@/execution/executor';

export type Difficulty = 'advanced' | 'expert' | 'intermediate' | 'novice';

export interface Category {
  description: string;
  id: string;
  order: number;
  title: string;
}

export interface Challenge {
  categoryId: string;
  description: string;
  difficulty: Difficulty;
  explanation: string;
  id: string;
  methods: string[];
  order: number;
  solution: string;
  starterCode: string;
  tests: TestCaseInput[];
  title: string;
  /**
   * The tempting-but-wrong solution the challenge is built around. Required on
   * the advanced tier; the catalog gate proves it fails at least one test so the
   * "trap" label is never an empty promise.
   */
  trap?: string;
}

export interface CategoryModule {
  category: Category;
  challenges: Challenge[];
}

export interface Submission {
  challengeId: string;
  code: string;
  id: string;
  status: 'failed' | 'passed';
  updatedAt: string;
}

/**
 * A submission the client wants stored. The `id` is server-assigned on
 * creation (json-server ignores client-supplied ids on POST), so callers
 * never provide one — `challengeId` is the logical key.
 */
export type UnsavedSubmission = Omit<Submission, 'id'>;

export interface DbFile {
  categories: Category[];
  challenges: Challenge[];
  submissions: Submission[];
}

export const SOLVE_FN_NAME = 'solve';
