import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Category, Challenge, Submission } from '@/data/types';

import { clearSubmission, fetchCategories, fetchChallenges, fetchSubmissions, saveSubmission } from '@/api/client';

export const queryKeys = {
  categories: ['categories'] as const,
  challenges: ['challenges'] as const,
  submissions: ['submissions'] as const,
};

/** The catalog is static per db.json generation, so category/challenge queries never go stale. */
export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryFn: fetchCategories, queryKey: queryKeys.categories, staleTime: Infinity });
}

export function useChallenges(): UseQueryResult<Challenge[]> {
  return useQuery({ queryFn: fetchChallenges, queryKey: queryKeys.challenges, staleTime: Infinity });
}

export function useSubmissions(): UseQueryResult<Submission[]> {
  return useQuery({ queryFn: fetchSubmissions, queryKey: queryKeys.submissions });
}

export function useSaveSubmission(): UseMutationResult<Submission, Error, Submission> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSubmission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.submissions }),
  });
}

export function useClearSubmission(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clearSubmission,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.submissions }),
  });
}
