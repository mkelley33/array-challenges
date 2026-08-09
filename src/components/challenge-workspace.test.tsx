// @vitest-environment jsdom
import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Submission } from '@/data/types';

import { ChallengeWorkspace } from '@/components/challenge-workspace';
import { DirectExecutor } from '@/execution/executor';
import { useUiStore } from '@/stores/ui-store';
import { makeChallenge, makeSubmission } from '@/test/fixtures';

vi.mock('@/components/editor', () => ({
  Editor: ({ onChange, value }: { onChange: (value: string) => void; value: string }) => (
    <textarea aria-label="Code editor" onChange={(event) => onChange(event.target.value)} value={value} />
  ),
}));

const challenge = makeChallenge();

interface RecordedCall {
  body: unknown;
  method: string;
  url: string;
}

function stubApi(existing: Submission[], { persistSaves = false }: { persistSaves?: boolean } = {}): RecordedCall[] {
  const calls: RecordedCall[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method ?? 'GET';
      const body = typeof init?.body === 'string' ? (JSON.parse(init.body) as unknown) : undefined;
      calls.push({ body, method, url });
      if (method === 'GET') {
        return Promise.resolve(new Response(JSON.stringify(existing), { status: 200 }));
      }
      if (method === 'DELETE') {
        return Promise.resolve(new Response(null, { status: 200 }));
      }
      if (method === 'PUT' && existing.length === 0) {
        return Promise.resolve(new Response(null, { status: 404 }));
      }
      if (persistSaves && (method === 'POST' || method === 'PUT')) {
        const saved = body as Submission;
        const index = existing.findIndex((submission) => submission.id === saved.id);
        if (index === -1) {
          existing.push(saved);
        } else {
          existing[index] = saved;
        }
      }
      return Promise.resolve(new Response(init?.body ?? null, { status: method === 'POST' ? 201 : 200 }));
    }),
  );
  return calls;
}

function renderWorkspace(): QueryClient {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }): ReactNode {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  render(<ChallengeWorkspace challenge={challenge} executor={new DirectExecutor()} />, { wrapper: Wrapper });
  return queryClient;
}

beforeEach(() => {
  useUiStore.setState(useUiStore.getInitialState());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ChallengeWorkspace', () => {
  it('loads the starter code when there is no submission', async () => {
    stubApi([]);
    renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(challenge.starterCode);
    });
    expect(screen.getByText(/multiplied by two/)).toBeInTheDocument();
  });

  it('loads the submitted code when a submission exists', async () => {
    stubApi([makeSubmission()]);
    renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(makeSubmission().code);
    });
  });

  it('runs the code, shows failing results, and saves a failed submission', async () => {
    const calls = stubApi([]);
    const user = userEvent.setup();
    renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(challenge.starterCode);
    });
    await user.click(screen.getByRole('button', { name: /^run$/i }));
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 3 passing/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      const save = calls.find((call) => call.method === 'POST');
      expect(save?.body).toMatchObject({ challengeId: 'double-it', id: 'double-it', status: 'failed' });
    });
  });

  it('runs a correct solution and saves a passed submission', async () => {
    const calls = stubApi([]);
    const user = userEvent.setup();
    renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(challenge.starterCode);
    });
    const editor = screen.getByLabelText('Code editor');
    await user.clear(editor);
    await user.paste(challenge.solution);
    await user.click(screen.getByRole('button', { name: /^run$/i }));
    await waitFor(() => {
      expect(screen.getByText(/3 \/ 3 passing/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      const save = calls.find((call) => call.method === 'POST');
      expect(save?.body).toMatchObject({ status: 'passed' });
    });
  });

  it('keeps the failing results visible after the saved submission is refetched', async () => {
    stubApi([], { persistSaves: true });
    const user = userEvent.setup();
    const queryClient = renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(challenge.starterCode);
    });
    await user.click(screen.getByRole('button', { name: /^run$/i }));
    await waitFor(() => {
      expect(screen.getByText(/1 \/ 3 passing/i)).toBeInTheDocument();
    });
    await waitFor(() => {
      const submissions = queryClient.getQueryData<Submission[]>(['submissions']);
      expect(submissions).toHaveLength(1);
    });
    expect(screen.getByText(/1 \/ 3 passing/i)).toBeInTheDocument();
    expect(screen.queryByText('Run your code to see test results.')).not.toBeInTheDocument();
  });

  it('clears the submission and restores the starter code', async () => {
    const calls = stubApi([makeSubmission()]);
    const user = userEvent.setup();
    renderWorkspace();
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(makeSubmission().code);
    });
    await user.click(screen.getByRole('button', { name: /clear submission/i }));
    await waitFor(() => {
      expect(screen.getByLabelText('Code editor')).toHaveValue(challenge.starterCode);
    });
    expect(calls.some((call) => call.method === 'DELETE' && call.url === '/api/submissions/double-it')).toBe(true);
  });
});
