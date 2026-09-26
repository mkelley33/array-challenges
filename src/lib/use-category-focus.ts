import type { RefObject } from 'react';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { FocusState, FocusStep, Point } from '@/lib/category-focus';

import {
  FADE_MS,
  GLIDE_MS,
  initialFocusState,
  isFocusLocked,
  reconcileFocus,
  settleFocus,
  STAGGER_WINDOW_MS,
  staggerDelays,
} from '@/lib/category-focus';
import { usePrefersReducedMotion } from '@/lib/use-prefers-reduced-motion';

const GLIDE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

export interface CategoryFocus {
  /** True once a transition made on this page has come to rest; arriving already focused does not count. */
  announce: boolean;
  challengesRef: RefObject<HTMLElement | null>;
  focus: FocusState;
  locked: boolean;
  registerCard: (categoryId: string, element: HTMLElement | null) => void;
}

interface GliderRects {
  card: DOMRect | undefined;
  challenges: DOMRect | undefined;
}

function centerOf(rect: DOMRect): Point {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

/** FLIP "invert + play": start `element` where it was (`first`) and animate its transform back to where it is now. */
function glide(element: HTMLElement | undefined | null, first: DOMRect | undefined): Animation | null {
  if (!element || !first) {
    return null;
  }
  const last = element.getBoundingClientRect();
  const dx = first.left - last.left;
  const dy = first.top - last.top;
  // Even a zero-distance glide runs, so every transition takes the same time (e.g. the top-left card never moves).
  return element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], {
    duration: GLIDE_MS,
    easing: GLIDE_EASING,
  });
}

/**
 * Drives the dashboard's category-focus choreography (see `category-focus.ts`) with a hand-rolled FLIP on the Web
 * Animations API. Each animated step starts its animations in a layout effect, before paint, and settles when they all
 * finish. With reduced motion — or no `element.animate`, as in jsdom — every step settles in the same tick, so the
 * same state path produces the same final layout without any motion.
 */
export function useCategoryFocus(requestedCategoryId: null | string): CategoryFocus {
  const reducedMotion = usePrefersReducedMotion();
  const [focus, setFocus] = useState<FocusState>(() => initialFocusState(requestedCategoryId));
  const [announce, setAnnounce] = useState(false);
  const cards = useRef(new Map<string, HTMLElement>());
  const challengesRef = useRef<HTMLElement>(null);
  const firstRects = useRef<GliderRects>({ card: undefined, challenges: undefined });

  const registerCard = useCallback((categoryId: string, element: HTMLElement | null): void => {
    if (element) {
      cards.current.set(categoryId, element);
    } else {
      cards.current.delete(categoryId);
    }
  }, []);

  const measureGliders = useCallback(
    (categoryId: null | string): GliderRects => ({
      card: categoryId === null ? undefined : cards.current.get(categoryId)?.getBoundingClientRect(),
      challenges: challengesRef.current?.getBoundingClientRect(),
    }),
    [],
  );

  // At rest, start whatever animation moves the display toward the requested category. A request that arrives
  // mid-animation is picked up here once the machine settles, because `focus` changes then.
  useLayoutEffect(() => {
    const next = reconcileFocus(focus, requestedCategoryId);
    if (next === focus) {
      return;
    }
    if (next.step === 'expanding') {
      firstRects.current = measureGliders(focus.shownCategoryId);
    }
    setAnnounce(false);
    setFocus(next);
  }, [focus, measureGliders, requestedCategoryId]);

  useLayoutEffect(() => {
    if (!isFocusLocked(focus.step)) {
      return;
    }

    const advance = (): void => {
      if (focus.step === 'hiding') {
        // FLIP "first": the selected card's grid slot, captured while its siblings still hold the layout open.
        firstRects.current = measureGliders(focus.shownCategoryId);
      }
      const next = settleFocus(focus);
      if (!isFocusLocked(next.step)) {
        setAnnounce(true);
      }
      setFocus(next);
    };

    const animations = reducedMotion ? [] : startStep(focus, cards.current, challengesRef.current, firstRects.current);
    if (animations.length === 0) {
      advance();
      return;
    }

    let cancelled = false;
    Promise.all(animations.map((animation) => animation.finished)).then(
      () => {
        if (!cancelled) {
          advance();
        }
      },
      () => undefined, // cancelled by the cleanup below
    );
    return () => {
      cancelled = true;
      animations.forEach((animation) => animation.cancel());
    };
  }, [focus, measureGliders, reducedMotion]);

  return { announce, challengesRef, focus, locked: isFocusLocked(focus.step), registerCard };
}

function startStep(
  { shownCategoryId, step }: FocusState,
  cards: ReadonlyMap<string, HTMLElement>,
  challenges: HTMLElement | null,
  first: GliderRects,
): Animation[] {
  const selectedCard = shownCategoryId === null ? undefined : cards.get(shownCategoryId);
  if (typeof selectedCard?.animate !== 'function') {
    return [];
  }
  const fadeStep: Partial<Record<FocusStep, 'in' | 'out'>> = { hiding: 'out', revealing: 'in' };
  const direction = fadeStep[step];

  if (direction !== undefined && shownCategoryId !== null) {
    const centers = new Map([...cards].map(([id, element]) => [id, centerOf(element.getBoundingClientRect())]));
    const delays = staggerDelays(centers, shownCategoryId, STAGGER_WINDOW_MS, direction);
    const keyframes = direction === 'out' ? [{ opacity: 1 }, { opacity: 0 }] : [{ opacity: 0 }, { opacity: 1 }];
    return [...delays].flatMap(([id, delay]) => {
      const element = cards.get(id);
      return element
        ? [element.animate(keyframes, { delay, duration: FADE_MS, easing: 'ease-out', fill: 'both' })]
        : [];
    });
  }

  return [glide(selectedCard, first.card), glide(challenges, first.challenges)].filter(
    (animation): animation is Animation => animation !== null,
  );
}
