// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { useSpoilerStore } from '@/stores/spoiler-store';

beforeEach(() => {
  localStorage.clear();
  useSpoilerStore.setState(useSpoilerStore.getInitialState());
});

describe('useSpoilerStore', () => {
  it('reports unrevealed challenges as hidden', () => {
    expect(useSpoilerStore.getState().isRevealed('range-of-numbers')).toBe(false);
  });

  it('remembers revealed challenges', () => {
    useSpoilerStore.getState().reveal('range-of-numbers');
    expect(useSpoilerStore.getState().isRevealed('range-of-numbers')).toBe(true);
    expect(useSpoilerStore.getState().isRevealed('repeat-value')).toBe(false);
  });

  it('persists reveals to localStorage', () => {
    useSpoilerStore.getState().reveal('range-of-numbers');
    const raw = localStorage.getItem('array-challenges-spoilers');
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw ?? '{}')).toMatchObject({ state: { revealed: { 'range-of-numbers': true } } });
  });
});
