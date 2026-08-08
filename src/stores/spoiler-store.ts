import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SpoilerState {
  isRevealed: (challengeId: string) => boolean;
  reveal: (challengeId: string) => void;
  revealed: Record<string, true>;
}

/** Once a spoiler is revealed it stays revealed — the user has already seen the solution. */
export const useSpoilerStore = create<SpoilerState>()(
  persist(
    (set, get) => ({
      isRevealed: (challengeId) => get().revealed[challengeId] === true,
      reveal: (challengeId) => set((state) => ({ revealed: { ...state.revealed, [challengeId]: true } })),
      revealed: {},
    }),
    { name: 'array-challenges-spoilers' },
  ),
);
