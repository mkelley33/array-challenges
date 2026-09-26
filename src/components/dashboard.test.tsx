// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Dashboard } from '@/components/dashboard';
import { useUiStore } from '@/stores/ui-store';
import { makeCategory, makeChallenge, makeSubmission } from '@/test/fixtures';

const categories = [
  makeCategory({ id: 'creating-arrays', order: 1, title: 'Creating Arrays' }),
  makeCategory({ id: 'sorting-and-ordering', order: 2, title: 'Sorting and Ordering' }),
];
const challenges = [
  makeChallenge({ categoryId: 'creating-arrays', id: 'double-it', title: 'Double it' }),
  makeChallenge({
    categoryId: 'sorting-and-ordering',
    difficulty: 'expert',
    id: 'numeric-sort-trap',
    order: 2,
    title: 'Numeric sort trap',
  }),
];
const submissions = [makeSubmission({ challengeId: 'double-it', id: 'double-it', status: 'passed' })];

function stubApi(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.endsWith('/categories') ? categories : url.endsWith('/challenges') ? challenges : submissions;
      return Promise.resolve(
        new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' }, status: 200 }),
      );
    }),
  );
}

function renderDashboard(): void {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  render(<Dashboard />, { wrapper: Wrapper });
}

beforeEach(() => {
  stubApi();
  useUiStore.setState(useUiStore.getInitialState());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Dashboard', () => {
  it('shows overall progress and per-category counts', async () => {
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByText(/1 of 2 solved/i)).toBeInTheDocument();
    });
    expect(screen.getByText('Creating Arrays')).toBeInTheDocument();
    expect(screen.getByText('Sorting and Ordering')).toBeInTheDocument();
  });

  it('lists challenges and opens one on click', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Numeric sort trap/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Numeric sort trap/ }));
    expect(useUiStore.getState().view).toEqual({ challengeId: 'numeric-sort-trap', name: 'challenge' });
  });

  it('filters the list by category when a category card is selected', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Numeric sort trap/ })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /Creating Arrays/ }));
    expect(screen.queryByRole('button', { name: /Numeric sort trap/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Double it/ })).toBeInTheDocument();
  });
});

interface PendingAnimation {
  finish: () => void;
}

/** jsdom has no Web Animations API; this records calls and lets a test decide when each animation finishes. */
function stubAnimate(): { animate: ReturnType<typeof vi.fn>; finishAll: () => Promise<void> } {
  const pending: PendingAnimation[] = [];
  const animate = vi.fn(() => {
    let resolve: () => void = () => undefined;
    const finished = new Promise<void>((done) => {
      resolve = done;
    });
    pending.push({ finish: resolve });
    return { cancel: vi.fn(), finished };
  });
  Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: animate, writable: true });
  return {
    animate,
    finishAll: async () => {
      await act(async () => {
        pending.splice(0).forEach((animation) => animation.finish());
        await Promise.resolve();
      });
    },
  };
}

function stubReducedMotion(reduce: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({ addEventListener: vi.fn(), matches: reduce, removeEventListener: vi.fn() })),
  );
}

function categoryCard(title: RegExp): HTMLElement {
  return screen.getByRole('button', { name: title });
}

async function waitForDashboard(): Promise<void> {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /Numeric sort trap/ })).toBeInTheDocument();
  });
}

describe('Dashboard category focus', () => {
  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  it('hides the other categories and offers a way back when a category is selected', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();

    await user.click(categoryCard(/Creating Arrays/));

    expect(categoryCard(/Creating Arrays/)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Sorting and Ordering/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View all categories' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Showing Creating Arrays — 1 challenge');
  });

  it('shows every category and every challenge again from "View all categories"', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();
    await user.click(categoryCard(/Creating Arrays/));

    await user.click(screen.getByRole('button', { name: 'View all categories' }));

    expect(useUiStore.getState().categoryFilter).toBeNull();
    expect(categoryCard(/Sorting and Ordering/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Numeric sort trap/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View all categories' })).not.toBeInTheDocument();
    expect(categoryCard(/Creating Arrays/)).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('Showing all 2 categories');
  });

  it('toggles the other categories back on when the selected card is clicked again', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();

    await user.click(categoryCard(/Creating Arrays/));
    await user.click(categoryCard(/Creating Arrays/));

    expect(categoryCard(/Creating Arrays/)).toHaveAttribute('aria-pressed', 'false');
    expect(categoryCard(/Sorting and Ordering/)).toBeInTheDocument();
    expect(useUiStore.getState().categoryFilter).toBeNull();
  });

  it('keeps the duplicate list heading for screen readers only while focused', async () => {
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();
    expect(screen.getByRole('heading', { name: 'All challenges' })).not.toHaveClass('sr-only');

    await user.click(categoryCard(/Creating Arrays/));

    expect(screen.getByRole('heading', { name: 'Creating Arrays' })).toHaveClass('sr-only');
  });

  it('opens already focused, without announcing, when a category was selected before arriving', async () => {
    useUiStore.setState({ categoryFilter: 'sorting-and-ordering' });
    renderDashboard();
    await waitForDashboard();

    expect(screen.queryByRole('button', { name: /Creating Arrays/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View all categories' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('keeps the other cards on screen while they fade, and ignores clicks until the animation settles', async () => {
    const { animate, finishAll } = stubAnimate();
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();

    await user.click(categoryCard(/Creating Arrays/));
    expect(animate).toHaveBeenCalled();
    expect(categoryCard(/Sorting and Ordering/)).toHaveAttribute('aria-disabled', 'true');
    await user.click(categoryCard(/Sorting and Ordering/));
    expect(useUiStore.getState().categoryFilter).toBe('creating-arrays');

    await finishAll(); // sibling fades → glide
    expect(screen.queryByRole('button', { name: /Sorting and Ordering/ })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    await finishAll(); // glide → focused
    expect(screen.getByRole('status')).toHaveTextContent('Showing Creating Arrays');
    expect(categoryCard(/Creating Arrays/)).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('queues a selection made elsewhere mid-animation, reversing before focusing the new category', async () => {
    const { finishAll } = stubAnimate();
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();

    await user.click(categoryCard(/Creating Arrays/));
    act(() => {
      useUiStore.getState().setCategoryFilter('sorting-and-ordering'); // e.g. the sidebar
    });

    await finishAll(); // hiding → collapsing
    await finishAll(); // collapsing → focused, then immediately expanding
    expect(categoryCard(/Creating Arrays/)).toHaveAttribute('aria-pressed', 'true');
    await finishAll(); // expanding → revealing
    await finishAll(); // revealing → grid, then hiding toward the queued category
    await finishAll(); // hiding → collapsing
    await finishAll(); // collapsing → focused

    expect(categoryCard(/Sorting and Ordering/)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', { name: /Creating Arrays/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Numeric sort trap/ })).toBeInTheDocument();
  });

  it('never animates when the user agent prefers reduced motion', async () => {
    const { animate } = stubAnimate();
    stubReducedMotion(true);
    const user = userEvent.setup();
    renderDashboard();
    await waitForDashboard();

    await user.click(categoryCard(/Creating Arrays/));
    await user.click(screen.getByRole('button', { name: 'View all categories' }));

    expect(animate).not.toHaveBeenCalled();
    expect(categoryCard(/Sorting and Ordering/)).toBeInTheDocument();
  });
});
