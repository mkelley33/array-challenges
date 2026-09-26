/**
 * The category-focus choreography on the dashboard, as a pure state machine.
 *
 * Selecting a category is the same thing as focusing it: the other categories fade out and the selected card glides
 * to the top of the grid. The store's `categoryFilter` is the *requested* category; `shownCategoryId` is the one the
 * dashboard is actually displaying, which trails the request until the animation reaches a resting step. That lag is
 * what lets a selection made mid-animation (e.g. from the sidebar) wait its turn instead of interrupting.
 *
 *   grid → hiding → collapsing → focused → expanding → revealing → grid
 *
 * `hiding`/`revealing` are the staggered sibling fades; `collapsing`/`expanding` are the FLIP glides.
 */

export type FocusStep = 'collapsing' | 'expanding' | 'focused' | 'grid' | 'hiding' | 'revealing';

export interface FocusState {
  shownCategoryId: null | string;
  step: FocusStep;
}

export interface Point {
  x: number;
  y: number;
}

export type StaggerDirection = 'in' | 'out';

export const STAGGER_WINDOW_MS = 200;
export const FADE_MS = 150;
export const GLIDE_MS = 250;

const GRID_STATE: FocusState = { shownCategoryId: null, step: 'grid' };

/** Arriving at the dashboard never animates: a remembered selection renders already focused. */
export function initialFocusState(requestedCategoryId: null | string): FocusState {
  return requestedCategoryId === null ? GRID_STATE : { shownCategoryId: requestedCategoryId, step: 'focused' };
}

/** True while an animation is running; the dashboard ignores clicks until it settles. */
export function isFocusLocked(step: FocusStep): boolean {
  return step !== 'grid' && step !== 'focused';
}

/**
 * Starts the next animation needed to move from what is shown toward what is requested. Only resting steps respond;
 * mid-animation the request is left pending and picked up again when the machine settles.
 */
export function reconcileFocus(state: FocusState, requestedCategoryId: null | string): FocusState {
  if (state.step === 'grid' && requestedCategoryId !== null) {
    return { shownCategoryId: requestedCategoryId, step: 'hiding' };
  }
  if (state.step === 'focused' && requestedCategoryId !== state.shownCategoryId) {
    return { ...state, step: 'expanding' };
  }
  return state;
}

/** Advances past a finished animation. The shown category is cleared only once the grid is fully back. */
export function settleFocus(state: FocusState): FocusState {
  switch (state.step) {
    case 'collapsing':
      return { ...state, step: 'focused' };
    case 'expanding':
      return { ...state, step: 'revealing' };
    case 'hiding':
      return { ...state, step: 'collapsing' };
    case 'revealing':
      return GRID_STATE;
    default:
      return state;
  }
}

/**
 * Per-card fade delays that radiate from the selected card, normalised so the nearest card starts at 0 and the
 * farthest at `windowMs` — the total stagger stays fixed however many categories the catalog grows to. `'in'` mirrors
 * the order for the return trip. Distances come from measured centres, so no breakpoint/column logic is needed.
 */
export function staggerDelays(
  centers: ReadonlyMap<string, Point>,
  selectedId: string,
  windowMs: number,
  direction: StaggerDirection,
): Map<string, number> {
  const origin = centers.get(selectedId);
  const siblings = [...centers.entries()].filter(([id]) => id !== selectedId);
  if (origin === undefined) {
    return new Map(siblings.map(([id]) => [id, 0]));
  }

  const distances = siblings.map(([id, center]) => [id, Math.hypot(center.x - origin.x, center.y - origin.y)] as const);
  const values = distances.map(([, distance]) => distance);
  const nearest = Math.min(...values);
  const span = Math.max(...values) - nearest;

  return new Map(
    distances.map(([id, distance]) => {
      const outward = span === 0 ? 0 : ((distance - nearest) / span) * windowMs;
      return [id, direction === 'out' ? outward : windowMs - outward];
    }),
  );
}
