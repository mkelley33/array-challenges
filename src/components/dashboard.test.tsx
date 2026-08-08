// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
