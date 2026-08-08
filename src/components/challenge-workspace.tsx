import { ArrowLeft, LoaderCircle, Play, RotateCcw, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import type { Challenge } from '@/data/types';
import type { SolutionExecutor } from '@/execution/executor';

import { useClearSubmission, useSaveSubmission, useSubmissions } from '@/api/hooks';
import { Editor } from '@/components/editor';
import { ResultsPanel } from '@/components/results-panel';
import { SpoilerPanel } from '@/components/spoiler-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SOLVE_FN_NAME } from '@/data/types';
import { useRunSolution } from '@/execution/use-run-solution';
import { createSolutionWorker, WorkerExecutor } from '@/execution/worker-executor';
import { decode } from '@/lib/codec';
import { formatValue } from '@/lib/format-value';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

export interface ChallengeWorkspaceProps {
  challenge: Challenge;
  executor?: SolutionExecutor;
}

type MobileSection = 'editor' | 'problem' | 'results';

const MOBILE_SECTIONS: { label: string; section: MobileSection }[] = [
  { label: 'Problem', section: 'problem' },
  { label: 'Editor', section: 'editor' },
  { label: 'Results', section: 'results' },
];

function WorkspaceInner({
  challenge,
  executor,
  initialSource,
}: {
  challenge: Challenge;
  executor: SolutionExecutor;
  initialSource: string;
}): React.JSX.Element {
  const [source, setSource] = useState(initialSource);
  const [mobileSection, setMobileSection] = useState<MobileSection>('problem');
  const { report, reset, run, running } = useRunSolution(executor);
  const saveSubmission = useSaveSubmission();
  const clearSubmission = useClearSubmission();
  const showDashboard = useUiStore((state) => state.showDashboard);

  const handleRun = async (): Promise<void> => {
    setMobileSection('results');
    const runReport = await run(source, SOLVE_FN_NAME, challenge.tests);
    if (runReport === null) {
      return;
    }
    const passed = runReport.overall === 'passed';
    saveSubmission.mutate(
      {
        challengeId: challenge.id,
        code: source,
        id: challenge.id,
        status: passed ? 'passed' : 'failed',
        updatedAt: new Date().toISOString(),
      },
      {
        onError: () => toast.error('Could not save your submission — is the API running?'),
        onSuccess: () => {
          if (passed) {
            toast.success('Challenge solved!');
          }
        },
      },
    );
  };

  const handleReset = (): void => {
    setSource(challenge.starterCode);
    reset();
  };

  const handleClear = (): void => {
    clearSubmission.mutate(challenge.id, {
      onError: () => toast.error('Could not clear the submission — is the API running?'),
      onSuccess: () => toast.info('Submission cleared'),
    });
    handleReset();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={showDashboard} size="sm" variant="ghost">
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{challenge.title}</h1>
        <Badge variant="secondary">{challenge.difficulty}</Badge>
      </div>

      <div aria-label="Workspace sections" className="grid grid-cols-3 gap-1 md:hidden" role="group">
        {MOBILE_SECTIONS.map(({ label, section }) => (
          <Button
            aria-pressed={mobileSection === section}
            key={section}
            onClick={() => setMobileSection(section)}
            size="sm"
            variant={mobileSection === section ? 'default' : 'outline'}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section
          aria-label="Problem"
          className={cn('flex-col gap-3', mobileSection === 'problem' ? 'flex' : 'hidden', 'md:flex')}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{challenge.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {challenge.methods.map((method) => (
              <Badge key={method} variant="outline">
                {method}
              </Badge>
            ))}
          </div>
          <Separator />
          <h2 className="text-sm font-semibold">Test cases</h2>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {challenge.tests.map((test) => (
              <li className="text-muted-foreground break-all" key={test.name}>
                {SOLVE_FN_NAME}({test.args.map((arg) => formatValue(decode(arg))).join(', ')}) →{' '}
                {formatValue(decode(test.expected))}
              </li>
            ))}
          </ul>
          <Separator />
          <SpoilerPanel challenge={challenge} />
        </section>

        <div className="flex flex-col gap-4">
          <section
            aria-label="Editor"
            className={cn('flex-col gap-2', mobileSection === 'editor' ? 'flex' : 'hidden', 'md:flex')}
          >
            <Editor onChange={setSource} value={source} />
            <div className="flex flex-wrap gap-2">
              <Button disabled={running} onClick={() => void handleRun()} size="sm">
                {running ? (
                  <LoaderCircle aria-hidden className="size-4 animate-spin" />
                ) : (
                  <Play aria-hidden className="size-4" />
                )}
                Run
              </Button>
              <Button onClick={handleReset} size="sm" variant="outline">
                <RotateCcw aria-hidden className="size-4" />
                Reset to starter
              </Button>
              <Button onClick={handleClear} size="sm" variant="outline">
                <Trash2 aria-hidden className="size-4" />
                Clear submission
              </Button>
            </div>
          </section>

          <section
            aria-label="Results"
            className={cn('flex-col', mobileSection === 'results' ? 'flex' : 'hidden', 'md:flex')}
          >
            <ResultsPanel report={report} running={running} />
          </section>
        </div>
      </div>
    </div>
  );
}

/**
 * The challenge solving screen: problem statement, editor, and results.
 * Waits for submissions to load so the editor opens with the user's last
 * submitted code (or the starter code) — keyed remount per challenge keeps
 * editor state isolated between challenges.
 */
export function ChallengeWorkspace({ challenge, executor }: ChallengeWorkspaceProps): React.JSX.Element {
  const submissionsQuery = useSubmissions();
  const defaultExecutor = useMemo(() => executor ?? new WorkerExecutor(createSolutionWorker), [executor]);

  if (!submissionsQuery.data) {
    return <p className="text-muted-foreground py-12 text-center">Loading challenge…</p>;
  }

  const existing = submissionsQuery.data.find((submission) => submission.challengeId === challenge.id);

  return (
    <WorkspaceInner
      challenge={challenge}
      executor={defaultExecutor}
      initialSource={existing?.code ?? challenge.starterCode}
      key={`${challenge.id}:${existing?.updatedAt ?? 'starter'}`}
    />
  );
}
