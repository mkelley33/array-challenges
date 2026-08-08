import { Eye } from 'lucide-react';

import type { Challenge } from '@/data/types';

import { Button } from '@/components/ui/button';
import { useSpoilerStore } from '@/stores/spoiler-store';

export interface SpoilerPanelProps {
  challenge: Challenge;
}

/**
 * Gated reveal of the reference solution. Once revealed, the state persists
 * (per challenge) so the temptation bookkeeping is honest across sessions.
 */
export function SpoilerPanel({ challenge }: SpoilerPanelProps): React.JSX.Element {
  const revealed = useSpoilerStore((state) => state.revealed[challenge.id] === true);
  const reveal = useSpoilerStore((state) => state.reveal);

  if (!revealed) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-lg border border-dashed p-4">
        <p className="text-muted-foreground text-sm">
          Stuck? You can reveal a correct solution with an explanation. This is permanent for this challenge.
        </p>
        <Button onClick={() => reveal(challenge.id)} size="sm" variant="outline">
          <Eye aria-hidden className="size-4" />
          Reveal solution
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4">
      <h3 className="text-sm font-semibold">Reference solution</h3>
      <pre className="bg-muted overflow-x-auto rounded-md p-3 text-sm">
        <code>{challenge.solution}</code>
      </pre>
      <h3 className="text-sm font-semibold">Why it works</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{challenge.explanation}</p>
    </div>
  );
}
