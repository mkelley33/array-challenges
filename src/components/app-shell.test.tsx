// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '@/components/app-shell';
import { useUiStore } from '@/stores/ui-store';
import { makeCategory } from '@/test/fixtures';

const categories = [
  makeCategory({ id: 'creating-arrays', order: 1, title: 'Creating Arrays' }),
  makeCategory({ id: 'sorting-and-ordering', order: 2, title: 'Sorting and Ordering' }),
];

function renderShell(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const body = String(input).endsWith('/categories') ? categories : [];
      return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    }),
  );
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  render(
    <AppShell>
      <p>page content</p>
    </AppShell>,
    { wrapper: Wrapper },
  );
}

beforeEach(() => {
  useUiStore.setState(useUiStore.getInitialState());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AppShell', () => {
  it('renders the app title, children, and category navigation', async () => {
    renderShell();
    expect(screen.getByText('page content')).toBeInTheDocument();
    expect(screen.getAllByText(/array methods challenge/i).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(
        within(screen.getByRole('navigation')).getByRole('button', { name: 'Creating Arrays' }),
      ).toBeInTheDocument();
    });
  });

  it('filters by category and returns to the dashboard from the sidebar', async () => {
    const user = userEvent.setup();
    useUiStore.setState({ view: { challengeId: 'double-it', name: 'challenge' } });
    renderShell();
    const nav = screen.getByRole('navigation');
    await waitFor(() => {
      expect(within(nav).getByRole('button', { name: 'Sorting and Ordering' })).toBeInTheDocument();
    });
    await user.click(within(nav).getByRole('button', { name: 'Sorting and Ordering' }));
    expect(useUiStore.getState().categoryFilter).toBe('sorting-and-ordering');
    expect(useUiStore.getState().view).toEqual({ name: 'dashboard' });
    await user.click(within(nav).getByRole('button', { name: /all challenges/i }));
    expect(useUiStore.getState().categoryFilter).toBeNull();
  });
});
