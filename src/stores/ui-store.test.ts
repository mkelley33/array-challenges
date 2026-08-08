// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { useUiStore } from '@/stores/ui-store';

beforeEach(() => {
  useUiStore.setState(useUiStore.getInitialState());
});

describe('useUiStore', () => {
  it('starts on the dashboard with no filters', () => {
    const state = useUiStore.getState();
    expect(state.view).toEqual({ name: 'dashboard' });
    expect(state.categoryFilter).toBeNull();
    expect(state.difficultyFilter).toBe('all');
  });

  it('opens a challenge and returns to the dashboard', () => {
    useUiStore.getState().openChallenge('range-of-numbers');
    expect(useUiStore.getState().view).toEqual({ challengeId: 'range-of-numbers', name: 'challenge' });
    useUiStore.getState().showDashboard();
    expect(useUiStore.getState().view).toEqual({ name: 'dashboard' });
  });

  it('tracks category and difficulty filters', () => {
    useUiStore.getState().setCategoryFilter('creating-arrays');
    useUiStore.getState().setDifficultyFilter('expert');
    const state = useUiStore.getState();
    expect(state.categoryFilter).toBe('creating-arrays');
    expect(state.difficultyFilter).toBe('expert');
    useUiStore.getState().setCategoryFilter(null);
    expect(useUiStore.getState().categoryFilter).toBeNull();
  });
});
