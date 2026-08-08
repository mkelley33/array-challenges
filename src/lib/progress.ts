import type { Challenge, Submission } from '@/data/types';

export interface ProgressCount {
  solved: number;
  total: number;
}

export interface Progress {
  byCategory: Record<string, ProgressCount>;
  overall: ProgressCount;
}

type ChallengeRef = Pick<Challenge, 'categoryId' | 'id'>;
type SubmissionRef = Pick<Submission, 'challengeId' | 'status'>;

/**
 * Derives solved/total counts per category and overall from the challenge
 * catalog and the user's submissions. A challenge counts as solved when at
 * least one submission for it has status "passed"; submissions referencing
 * challenges not in the catalog are ignored.
 */
export function deriveProgress(challenges: ChallengeRef[], submissions: SubmissionRef[]): Progress {
  const knownIds = new Set(challenges.map((challenge) => challenge.id));
  const solvedIds = new Set(
    submissions
      .filter((submission) => submission.status === 'passed' && knownIds.has(submission.challengeId))
      .map((submission) => submission.challengeId),
  );

  const byCategory: Record<string, ProgressCount> = {};
  for (const challenge of challenges) {
    const count = (byCategory[challenge.categoryId] ??= { solved: 0, total: 0 });
    count.total += 1;
    if (solvedIds.has(challenge.id)) {
      count.solved += 1;
    }
  }

  return { byCategory, overall: { solved: solvedIds.size, total: challenges.length } };
}
