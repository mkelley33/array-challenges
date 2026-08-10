import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense, useState } from 'react';
import { Toaster } from 'sonner';

import { useChallenges } from '@/api/hooks';
import { AppShell } from '@/components/app-shell';
import { Dashboard } from '@/components/dashboard';
import { useCatalogStaleNotice } from '@/lib/use-catalog-stale-notice';
import { useApplyTheme, useEffectiveTheme } from '@/lib/use-theme';
import { useUiStore } from '@/stores/ui-store';

const ChallengeWorkspace = lazy(() =>
  import('@/components/challenge-workspace').then((module) => ({ default: module.ChallengeWorkspace })),
);

function CurrentView(): React.JSX.Element {
  const view = useUiStore((state) => state.view);
  const showDashboard = useUiStore((state) => state.showDashboard);
  const challengesQuery = useChallenges();

  if (view.name === 'dashboard') {
    return <Dashboard />;
  }

  if (!challengesQuery.data) {
    return <p className="text-muted-foreground py-12 text-center">Loading challenge…</p>;
  }

  const challenge = challengesQuery.data.find((candidate) => candidate.id === view.challengeId);
  if (challenge === undefined) {
    return (
      <div className="flex flex-col items-center gap-2 py-12">
        <p>That challenge does not exist.</p>
        <button className="text-primary underline" onClick={showDashboard} type="button">
          Back to the dashboard
        </button>
      </div>
    );
  }

  return (
    <Suspense fallback={<p className="text-muted-foreground py-12 text-center">Loading challenge…</p>}>
      <ChallengeWorkspace challenge={challenge} />
    </Suspense>
  );
}

function ThemedApp(): React.JSX.Element {
  useApplyTheme();
  useCatalogStaleNotice();
  const effectiveTheme = useEffectiveTheme();

  return (
    <>
      <AppShell>
        <CurrentView />
      </AppShell>
      <Toaster position="top-center" richColors theme={effectiveTheme} />
    </>
  );
}

export function App(): React.JSX.Element {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
    </QueryClientProvider>
  );
}
