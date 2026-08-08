import { create } from 'zustand';

import type { Difficulty } from '@/data/types';

export type View = { challengeId: string; name: 'challenge' } | { name: 'dashboard' };

export interface UiState {
  categoryFilter: null | string;
  difficultyFilter: 'all' | Difficulty;
  openChallenge: (challengeId: string) => void;
  setCategoryFilter: (categoryId: null | string) => void;
  setDifficultyFilter: (difficulty: 'all' | Difficulty) => void;
  showDashboard: () => void;
  view: View;
}

export const useUiStore = create<UiState>()((set) => ({
  categoryFilter: null,
  difficultyFilter: 'all',
  openChallenge: (challengeId) => set({ view: { challengeId, name: 'challenge' } }),
  setCategoryFilter: (categoryId) => set({ categoryFilter: categoryId }),
  setDifficultyFilter: (difficulty) => set({ difficultyFilter: difficulty }),
  showDashboard: () => set({ view: { name: 'dashboard' } }),
  view: { name: 'dashboard' },
}));
