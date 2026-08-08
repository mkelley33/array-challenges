import { CircleCheck } from 'lucide-react';

import type { Challenge, Difficulty } from '@/data/types';

import { Badge } from '@/components/ui/badge';

export interface ChallengeListProps {
  challenges: Challenge[];
  onOpen: (challengeId: string) => void;
  solvedIds: Set<string>;
}

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  advanced: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  expert: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  intermediate: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  novice: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
};

export function ChallengeList({ challenges, onOpen, solvedIds }: ChallengeListProps): React.JSX.Element {
  if (challenges.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">No challenges match the current filters.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {challenges.map((challenge) => {
        const solved = solvedIds.has(challenge.id);
        return (
          <li key={challenge.id}>
            <button
              className="hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
              onClick={() => onOpen(challenge.id)}
              type="button"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-center gap-2 font-medium">
                  {challenge.title}
                  {solved ? (
                    <>
                      <CircleCheck aria-hidden className="size-4 text-green-600 dark:text-green-400" />
                      <span className="sr-only">solved</span>
                    </>
                  ) : null}
                </span>
                <span className="flex flex-wrap items-center gap-1.5">
                  <Badge className={DIFFICULTY_STYLES[challenge.difficulty]} variant="secondary">
                    {challenge.difficulty}
                  </Badge>
                  {challenge.methods.map((method) => (
                    <Badge key={method} variant="outline">
                      {method}
                    </Badge>
                  ))}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
