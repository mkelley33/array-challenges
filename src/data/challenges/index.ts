import type { Category, CategoryModule, Challenge } from '@/data/types';

import { creatingArrays } from './creating-arrays';

const modules: CategoryModule[] = [creatingArrays];

const sortedModules = [...modules].sort((a, b) => a.category.order - b.category.order);

export const allModules: CategoryModule[] = sortedModules;

export const allCategories: Category[] = sortedModules.map((module) => module.category);

export const allChallenges: Challenge[] = sortedModules.flatMap((module) =>
  [...module.challenges].sort((a, b) => a.order - b.order),
);
