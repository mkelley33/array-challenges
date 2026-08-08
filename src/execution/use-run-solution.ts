import { useCallback, useRef, useState } from 'react';

import type { SolutionExecutor, TestCaseInput } from '@/execution/executor';
import type { RunReport } from '@/execution/run-challenge';

import { runChallenge } from '@/execution/run-challenge';

export interface RunSolutionState {
  report: null | RunReport;
  reset: () => void;
  run: (source: string, fnName: string, tests: TestCaseInput[]) => Promise<null | RunReport>;
  running: boolean;
}

/**
 * Runs a user's solution source against a challenge's test cases through the
 * given executor and keeps the latest report as state. Stale runs are
 * discarded: only the most recently started run may publish its report.
 */
export function useRunSolution(executor: SolutionExecutor): RunSolutionState {
  const [report, setReport] = useState<null | RunReport>(null);
  const [running, setRunning] = useState(false);
  const runIdRef = useRef(0);

  const run = useCallback(
    async (source: string, fnName: string, tests: TestCaseInput[]): Promise<null | RunReport> => {
      const runId = runIdRef.current + 1;
      runIdRef.current = runId;
      setRunning(true);
      try {
        const nextReport = await runChallenge(executor, source, fnName, tests);
        if (runIdRef.current !== runId) {
          return null;
        }
        setReport(nextReport);
        return nextReport;
      } finally {
        if (runIdRef.current === runId) {
          setRunning(false);
        }
      }
    },
    [executor],
  );

  const reset = useCallback(() => {
    runIdRef.current += 1;
    setReport(null);
    setRunning(false);
  }, []);

  return { report, reset, run, running };
}
