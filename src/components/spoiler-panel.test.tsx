// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { SpoilerPanel } from '@/components/spoiler-panel';
import { useSpoilerStore } from '@/stores/spoiler-store';
import { makeChallenge } from '@/test/fixtures';

const challenge = makeChallenge();

beforeEach(() => {
  localStorage.clear();
  useSpoilerStore.setState({ revealed: {} });
});

describe('SpoilerPanel', () => {
  it('hides the solution behind a reveal button', () => {
    render(<SpoilerPanel challenge={challenge} />);
    expect(screen.queryByText(/return n \* 2/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reveal/i })).toBeInTheDocument();
  });

  it('shows solution and explanation after revealing', async () => {
    const user = userEvent.setup();
    render(<SpoilerPanel challenge={challenge} />);
    await user.click(screen.getByRole('button', { name: /reveal/i }));
    expect(screen.getByText(/return n \* 2/)).toBeInTheDocument();
    expect(screen.getByText(/map applies the callback/)).toBeInTheDocument();
  });

  it('stays revealed for challenges already revealed in the store', () => {
    useSpoilerStore.setState({ revealed: { 'double-it': true } });
    render(<SpoilerPanel challenge={challenge} />);
    expect(screen.getByText(/return n \* 2/)).toBeInTheDocument();
  });
});
