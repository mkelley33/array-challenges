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
}

export interface CategoryModule {
  category: Category;
  challenges: Challenge[];
}

export const SOLVE_FN_NAME = 'solve';
