import { describe, expect, it } from 'vitest';

import type { FocusState } from '@/lib/category-focus';

import {
  glideKeyframes,
  initialFocusState,
  isFocusLocked,
  listedCategoryId,
  reconcileFocus,
  settleFocus,
  staggerDelays,
} from '@/lib/category-focus';

const grid: FocusState = { shownCategoryId: null, step: 'grid' };
const focusedOnSets: FocusState = { shownCategoryId: 'sets', step: 'focused' };

describe('initialFocusState', () => {
  it('starts on the grid when no category is selected', () => {
    expect(initialFocusState(null)).toEqual(grid);
  });

  it('starts already focused, without animating, when a category is selected', () => {
    expect(initialFocusState('sets')).toEqual(focusedOnSets);
  });
});

describe('reconcileFocus', () => {
  it('starts hiding the other categories when a category is selected from the grid', () => {
    expect(reconcileFocus(grid, 'sets')).toEqual({ shownCategoryId: 'sets', step: 'hiding' });
  });

  it('leaves the grid alone when nothing is selected', () => {
    expect(reconcileFocus(grid, null)).toBe(grid);
  });

  it('starts the reverse when the selection is cleared while focused', () => {
    expect(reconcileFocus(focusedOnSets, null)).toEqual({ shownCategoryId: 'sets', step: 'expanding' });
  });

  it('starts the reverse first when a different category is selected while focused', () => {
    expect(reconcileFocus(focusedOnSets, 'sorting')).toEqual({ shownCategoryId: 'sets', step: 'expanding' });
  });

  it('stays focused when the selection already matches', () => {
    expect(reconcileFocus(focusedOnSets, 'sets')).toBe(focusedOnSets);
  });

  it.each(['hiding', 'collapsing', 'expanding', 'revealing'] as const)(
    'defers any selection change while %s',
    (step) => {
      const state: FocusState = { shownCategoryId: 'sets', step };
      expect(reconcileFocus(state, 'sorting')).toBe(state);
      expect(reconcileFocus(state, null)).toBe(state);
    },
  );
});

describe('settleFocus', () => {
  it('runs forward: hiding → collapsing → focused', () => {
    const collapsing = settleFocus({ shownCategoryId: 'sets', step: 'hiding' });
    expect(collapsing).toEqual({ shownCategoryId: 'sets', step: 'collapsing' });
    expect(settleFocus(collapsing)).toEqual(focusedOnSets);
  });

  it('runs backwards: expanding → revealing → grid, clearing the shown category only at the end', () => {
    const revealing = settleFocus({ shownCategoryId: 'sets', step: 'expanding' });
    expect(revealing).toEqual({ shownCategoryId: 'sets', step: 'revealing' });
    expect(settleFocus(revealing)).toEqual(grid);
  });

  it('is a no-op on the resting steps', () => {
    expect(settleFocus(grid)).toBe(grid);
    expect(settleFocus(focusedOnSets)).toBe(focusedOnSets);
  });
});

describe('isFocusLocked', () => {
  it('locks only while animating', () => {
    expect(isFocusLocked('grid')).toBe(false);
    expect(isFocusLocked('focused')).toBe(false);
    expect(isFocusLocked('hiding')).toBe(true);
    expect(isFocusLocked('collapsing')).toBe(true);
    expect(isFocusLocked('expanding')).toBe(true);
    expect(isFocusLocked('revealing')).toBe(true);
  });
});

describe('staggerDelays', () => {
  // A 3-column row: a | sets | c, with d directly below a.
  const centers = new Map([
    ['a', { x: 0, y: 0 }],
    ['c', { x: 200, y: 0 }],
    ['d', { x: 0, y: 100 }],
    ['sets', { x: 100, y: 0 }],
  ]);

  it('radiates out from the selected card, the farthest card using the whole window', () => {
    const delays = staggerDelays(centers, 'sets', 200, 'out');
    expect(delays.get('a')).toBeCloseTo(delays.get('c') ?? Number.NaN);
    expect(delays.get('a')).toBe(0);
    expect(delays.get('d')).toBe(200);
    expect(delays.has('sets')).toBe(false);
  });

  it('mirrors inward on the way back: farthest first, nearest last', () => {
    const outward = staggerDelays(centers, 'sets', 200, 'out');
    const inward = staggerDelays(centers, 'sets', 200, 'in');
    expect(inward.get('d')).toBe(0);
    for (const [id, delay] of outward) {
      expect(inward.get(id)).toBeCloseTo(200 - delay);
    }
  });

  it('falls back to no delay when the selected card was not measured', () => {
    const delays = staggerDelays(centers, 'missing', 200, 'out');
    expect([...delays.values()]).toEqual([0, 0, 0, 0]);
  });
});

describe('listedCategoryId', () => {
  it('keeps listing every challenge while the other cards fade out, so the list never swaps in plain sight', () => {
    expect(listedCategoryId({ shownCategoryId: 'sets', step: 'hiding' })).toBeNull();
  });

  it.each(['collapsing', 'focused', 'expanding'] as const)('lists the shown category while %s', (step) => {
    expect(listedCategoryId({ shownCategoryId: 'sets', step })).toBe('sets');
  });

  it('lists every challenge again as the other cards fade back in', () => {
    expect(listedCategoryId({ shownCategoryId: 'sets', step: 'revealing' })).toBeNull();
    expect(listedCategoryId(grid)).toBeNull();
  });
});

describe('glideKeyframes', () => {
  it('starts from the inverted offset and ends at rest', () => {
    const keyframes = glideKeyframes({ x: -40, y: 120 }, 'none');
    expect(keyframes[0]).toEqual({ transform: 'translate(-40px, 120px)' });
    expect(keyframes.at(-1)).toEqual({ transform: 'none' });
  });

  it('fades in over the first part of the glide', () => {
    const keyframes = glideKeyframes({ x: 0, y: 300 }, 'in');
    expect(keyframes[0]).toMatchObject({ opacity: 0, transform: 'translate(0px, 300px)' });
    expect(keyframes.at(-1)).toMatchObject({ opacity: 1, transform: 'none' });
  });

  it('fades out as the exact mirror of fading in', () => {
    const fadeIn = glideKeyframes({ x: 0, y: 300 }, 'in');
    const fadeOut = glideKeyframes({ x: 0, y: -300 }, 'out');
    expect(fadeOut.map((frame) => frame.opacity)).toEqual(fadeIn.map((frame) => frame.opacity).reverse());
    expect(fadeOut.map((frame) => frame.offset ?? null)).toEqual(
      fadeIn.map((frame) => (frame.offset === undefined ? null : 1 - (frame.offset ?? 0))).reverse(),
    );
  });
});
