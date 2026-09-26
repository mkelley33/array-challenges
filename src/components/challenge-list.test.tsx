// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ChallengeList } from '@/components/challenge-list';
import { makeChallenge } from '@/test/fixtures';

const challenges = [
  makeChallenge({ difficulty: 'novice', id: 'double-it', methods: ['map'], title: 'Double it' }),
  makeChallenge({ difficulty: 'expert', id: 'async-tax', methods: ['Array.fromAsync'], order: 2, title: 'Async tax' }),
];

describe('ChallengeList', () => {
  it('renders a row per challenge with difficulty and methods', () => {
    render(<ChallengeList challenges={challenges} onOpen={vi.fn()} solvedIds={new Set()} />);
    expect(screen.getByText('Double it')).toBeInTheDocument();
    expect(screen.getByText('Async tax')).toBeInTheDocument();
    expect(screen.getByText('novice')).toBeInTheDocument();
    expect(screen.getByText('expert')).toBeInTheDocument();
    expect(screen.getByText('Array.fromAsync')).toBeInTheDocument();
  });

  it('marks solved challenges', () => {
    render(<ChallengeList challenges={challenges} onOpen={vi.fn()} solvedIds={new Set(['double-it'])} />);
    expect(screen.getByRole('button', { name: /Double it/ })).toHaveAccessibleName(/solved/i);
    expect(screen.getByRole('button', { name: /Async tax/ })).not.toHaveAccessibleName(/solved/i);
  });

  it('opens a challenge on click', async () => {
    const onOpen = vi.fn();
    const user = userEvent.setup();
    render(<ChallengeList challenges={challenges} onOpen={onOpen} solvedIds={new Set()} />);
    await user.click(screen.getByRole('button', { name: /Async tax/ }));
    expect(onOpen).toHaveBeenCalledWith('async-tax');
  });

  it('shows an empty state when no challenges match', () => {
    render(<ChallengeList challenges={[]} onOpen={vi.fn()} solvedIds={new Set()} />);
    expect(screen.getByText(/no challenges/i)).toBeInTheDocument();
  });

  it('keeps filtered-out rows mounted but hidden, so refiltering never remounts them', () => {
    const { rerender } = render(
      <ChallengeList
        challenges={challenges}
        onOpen={vi.fn()}
        solvedIds={new Set()}
        visibleIds={new Set(['double-it'])}
      />,
    );
    const hiddenRow = screen.getByText('Async tax').closest('li');
    expect(hiddenRow).not.toBeVisible();
    expect(screen.queryByRole('button', { name: /Async tax/ })).not.toBeInTheDocument();

    rerender(<ChallengeList challenges={challenges} onOpen={vi.fn()} solvedIds={new Set()} />);
    expect(screen.getByText('Async tax').closest('li')).toBe(hiddenRow);
    expect(screen.getByRole('button', { name: /Async tax/ })).toBeInTheDocument();
  });

  it('shows the empty state when every row is filtered out', () => {
    render(<ChallengeList challenges={challenges} onOpen={vi.fn()} solvedIds={new Set()} visibleIds={new Set()} />);
    expect(screen.getByText(/no challenges/i)).toBeInTheDocument();
  });
});
