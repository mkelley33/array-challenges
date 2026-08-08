import { useCategories, useChallenges, useSubmissions } from '@/api/hooks';
import { ChallengeList } from '@/components/challenge-list';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { deriveProgress } from '@/lib/progress';
import { cn } from '@/lib/utils';
import { useUiStore } from '@/stores/ui-store';

const DIFFICULTY_OPTIONS = ['all', 'novice', 'intermediate', 'advanced', 'expert'] as const;

export function Dashboard(): React.JSX.Element {
  const categoriesQuery = useCategories();
  const challengesQuery = useChallenges();
  const submissionsQuery = useSubmissions();
  const categoryFilter = useUiStore((state) => state.categoryFilter);
  const difficultyFilter = useUiStore((state) => state.difficultyFilter);
  const openChallenge = useUiStore((state) => state.openChallenge);
  const setCategoryFilter = useUiStore((state) => state.setCategoryFilter);
  const setDifficultyFilter = useUiStore((state) => state.setDifficultyFilter);

  if (categoriesQuery.isError || challengesQuery.isError || submissionsQuery.isError) {
    return (
      <p className="text-destructive py-12 text-center">
        Could not reach the challenge API. Is <code>pnpm dev</code> running (it starts JSON Server on port 3001)?
      </p>
    );
  }

  if (!categoriesQuery.data || !challengesQuery.data || !submissionsQuery.data) {
    return <p className="text-muted-foreground py-12 text-center">Loading challenges…</p>;
  }

  const categories = categoriesQuery.data;
  const challenges = challengesQuery.data;
  const submissions = submissionsQuery.data;
  const progress = deriveProgress(challenges, submissions);
  const solvedIds = new Set(
    submissions.filter((submission) => submission.status === 'passed').map((submission) => submission.challengeId),
  );
  const visibleChallenges = challenges.filter(
    (challenge) =>
      (categoryFilter === null || challenge.categoryId === categoryFilter) &&
      (difficultyFilter === 'all' || challenge.difficulty === difficultyFilter),
  );
  const overallPercent = progress.overall.total === 0 ? 0 : (progress.overall.solved / progress.overall.total) * 100;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Your progress</CardTitle>
          <CardDescription>
            {progress.overall.solved} of {progress.overall.total} solved
          </CardDescription>
          <Progress aria-label="Overall progress" value={overallPercent} />
        </CardHeader>
      </Card>

      <section aria-label="Categories" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = progress.byCategory[category.id] ?? { solved: 0, total: 0 };
          const selected = categoryFilter === category.id;
          return (
            <button
              className="rounded-xl text-left focus-visible:outline-none"
              key={category.id}
              onClick={() => setCategoryFilter(selected ? null : category.id)}
              type="button"
            >
              <Card className={cn('h-full gap-2 py-4 transition-colors', selected && 'border-primary bg-accent')}>
                <CardHeader className="px-4">
                  <CardTitle className="text-base">{category.title}</CardTitle>
                  <CardDescription>
                    {count.solved}/{count.total} solved
                  </CardDescription>
                  <Progress
                    aria-label={`${category.title} progress`}
                    value={count.total === 0 ? 0 : (count.solved / count.total) * 100}
                  />
                </CardHeader>
              </Card>
            </button>
          );
        })}
      </section>

      <section aria-label="Challenges" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">
            {categoryFilter === null
              ? 'All challenges'
              : (categories.find((c) => c.id === categoryFilter)?.title ?? '')}
          </h2>
          <Select
            onValueChange={(value) => setDifficultyFilter(value as (typeof DIFFICULTY_OPTIONS)[number])}
            value={difficultyFilter}
          >
            <SelectTrigger aria-label="Filter by difficulty" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option === 'all' ? 'All levels' : option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ChallengeList challenges={visibleChallenges} onOpen={openChallenge} solvedIds={solvedIds} />
      </section>
    </div>
  );
}
