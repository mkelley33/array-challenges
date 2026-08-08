import { CircleAlert, CircleCheck, CircleX, LoaderCircle } from 'lucide-react';

import type { CaseResult } from '@/execution/executor';
import type { RunReport } from '@/execution/run-challenge';

import { decode } from '@/lib/codec';
import { formatValue } from '@/lib/format-value';

export interface ResultsPanelProps {
  report: null | RunReport;
  running: boolean;
}

function CaseRow({ caseResult }: { caseResult: CaseResult }): React.JSX.Element {
  const icon =
    caseResult.status === 'pass' ? (
      <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
    ) : caseResult.status === 'fail' ? (
      <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
    ) : (
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
    );

  return (
    <li className="flex items-start gap-2 rounded-md border p-2 text-sm">
      {icon}
      <div className="flex min-w-0 flex-col gap-1">
        <span className="font-medium">
          {caseResult.name}
          <span className="sr-only"> — {caseResult.status}</span>
        </span>
        {caseResult.status !== 'pass' ? (
          <dl className="text-muted-foreground grid grid-cols-[auto_1fr] gap-x-2 font-mono text-xs break-all">
            <dt>expected</dt>
            <dd>{formatValue(decode(caseResult.expected))}</dd>
            {caseResult.error === undefined ? (
              <>
                <dt>received</dt>
                <dd>{caseResult.actual === undefined ? 'undefined' : formatValue(decode(caseResult.actual))}</dd>
              </>
            ) : (
              <>
                <dt>error</dt>
                <dd className="text-destructive">{caseResult.error}</dd>
              </>
            )}
          </dl>
        ) : null}
        {caseResult.logs.length > 0 ? (
          <pre className="bg-muted text-muted-foreground overflow-x-auto rounded p-1.5 text-xs">
            {caseResult.logs.join('\n')}
          </pre>
        ) : null}
      </div>
    </li>
  );
}

export function ResultsPanel({ report, running }: ResultsPanelProps): React.JSX.Element {
  if (running) {
    return (
      <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm" role="status">
        <LoaderCircle aria-hidden className="size-4 animate-spin" />
        Running your solution…
      </div>
    );
  }

  if (report === null) {
    return <p className="text-muted-foreground py-6 text-sm">Run your code to see test results.</p>;
  }

  if (report.overall === 'transpile-error') {
    return (
      <div className="text-destructive flex flex-col gap-1 py-4 text-sm" role="alert">
        <span className="font-semibold">Your code does not compile</span>
        <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">{report.transpileError}</pre>
      </div>
    );
  }

  if (report.overall === 'timeout') {
    return (
      <p className="text-destructive py-4 text-sm" role="alert">
        Your solution timed out — check for infinite loops.
      </p>
    );
  }

  if (report.overall === 'code-error') {
    return (
      <div className="text-destructive flex flex-col gap-1 py-4 text-sm" role="alert">
        <span className="font-semibold">Your code threw before any test ran</span>
        <pre className="overflow-x-auto font-mono text-xs whitespace-pre-wrap">{report.executionError}</pre>
      </div>
    );
  }

  const passing = report.cases.filter((caseResult) => caseResult.status === 'pass').length;

  return (
    <div className="flex flex-col gap-2">
      <p className={report.overall === 'passed' ? 'font-semibold text-green-600 dark:text-green-400' : 'font-semibold'}>
        {passing} / {report.cases.length} passing
        {report.overall === 'passed' ? ' — solved!' : ''}
      </p>
      <ul className="flex flex-col gap-1.5">
        {report.cases.map((caseResult) => (
          <CaseRow caseResult={caseResult} key={caseResult.name} />
        ))}
      </ul>
    </div>
  );
}
