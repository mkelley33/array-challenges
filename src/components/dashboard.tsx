import { useId } from 'react';

import { useCategories, useChallenges, useSubmissions } from '@/api/hooks';
import { ChallengeList } from '@/components/challenge-list';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { listedCategoryId } from '@/lib/category-focus';
import { deriveProgress } from '@/lib/progress';
import { useCategoryFocus } from '@/lib/use-category-focus';
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
  const categoriesId = useId();
  const { announce, challengesRef, focus, locked, registerCard } = useCategoryFocus(categoryFilter);

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
  // The list trails the cards: it only changes what it lists while it is faded out (see `listedCategoryId`).
  const listedId = listedCategoryId(focus);
  const visibleChallenges = challenges.filter(
    (challenge) =>
      (listedId === null || challenge.categoryId === listedId) &&
      (difficultyFilter === 'all' || challenge.difficulty === difficultyFilter),
  );
  const listedCategory = categories.find((category) => category.id === listedId);
  const collapsed = focus.step === 'collapsing' || focus.step === 'focused';
  const siblingsInvisible = focus.step === 'expanding' || focus.step === 'revealing';
  const statusMessage = !announce
    ? ''
    : listedCategory === undefined
      ? `Showing all ${categories.length} categories`
      : `Showing ${listedCategory.title} — ${visibleChallenges.length} ${visibleChallenges.length === 1 ? 'challenge' : 'challenges'}`;

  const viewAllCategories = (): void => {
    if (locked || focus.shownCategoryId === null) {
      return;
    }
    // The button unmounts once the grid is back; hand focus to the card being closed rather than dropping it on <body>.
    const card = document.getElementById(`${categoriesId}-${focus.shownCategoryId}`);
    card?.focus();
    setCategoryFilter(null);
  };

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

      <section
        aria-busy={locked}
        aria-label="Categories"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        id={categoriesId}
      >
        {categories.map((category) => {
          const count = progress.byCategory[category.id] ?? { solved: 0, total: 0 };
          const selected = focus.shownCategoryId === category.id;
          if (collapsed && !selected) {
            return null;
          }
          return (
            <button
              aria-disabled={locked}
              aria-pressed={selected}
              className="rounded-xl text-left focus-visible:outline-none"
              id={`${categoriesId}-${category.id}`}
              key={category.id}
              onClick={() => {
                // aria-disabled rather than disabled: a disabled button drops keyboard focus mid-animation.
                if (!locked) {
                  setCategoryFilter(selected ? null : category.id);
                }
              }}
              ref={(element) => {
                registerCard(category.id, element);
              }}
              style={siblingsInvisible && !selected ? { opacity: 0 } : undefined}
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

      <section aria-label="Challenges" className="flex flex-col gap-3" ref={challengesRef}>
        <div className="flex items-center justify-between gap-3">
          {/* When listing one category, its card sits directly above and names it; a visible heading would repeat it. */}
          <h2 className={cn('text-lg font-semibold', listedCategory && 'sr-only')}>
            {listedCategory?.title ?? 'All challenges'}
          </h2>
          {listedCategory && (
            <Button
              aria-controls={categoriesId}
              aria-disabled={locked}
              className="px-0"
              onClick={viewAllCategories}
              variant="link"
            >
              View all categories
            </Button>
          )}
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

      <p className="sr-only" role="status">
        {statusMessage}
      </p>
    </div>
  );
}
