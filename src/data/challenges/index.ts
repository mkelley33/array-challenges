import type { Category, CategoryModule, Challenge } from '@/data/types';

import { accessAndSearch } from './access-and-search';
import { creatingArrays } from './creating-arrays';
import { filteringAndSlicing } from './filtering-and-slicing';
import { flatteningAndComposing } from './flattening-and-composing';
import { groupingAndAggregation } from './grouping-and-aggregation';
import { immutableUpdates } from './immutable-updates';
import { iterationBasics } from './iteration-basics';
import { mappingAndTransforming } from './mapping-and-transforming';
import { reduceAndFolding } from './reduce-and-folding';
import { sortingAndOrdering } from './sorting-and-ordering';
import { tricksAndPatterns } from './tricks-and-patterns';

const modules: CategoryModule[] = [
  accessAndSearch,
  creatingArrays,
  filteringAndSlicing,
  flatteningAndComposing,
  groupingAndAggregation,
  immutableUpdates,
  iterationBasics,
  mappingAndTransforming,
  reduceAndFolding,
  sortingAndOrdering,
  tricksAndPatterns,
];

const sortedModules = [...modules].sort((a, b) => a.category.order - b.category.order);

export const allModules: CategoryModule[] = sortedModules;

export const allCategories: Category[] = sortedModules.map((module) => module.category);

export const allChallenges: Challenge[] = sortedModules.flatMap((module) =>
  [...module.challenges].sort((a, b) => a.order - b.order),
);
