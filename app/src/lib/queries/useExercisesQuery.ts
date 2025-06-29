'use client';

import { useQuery } from '@/hooks/useQuery';
import { ExercisesAPI } from '@/lib/api/exercises';
import { ExercisesResponse } from '@/lib/types/exercise';

export function useExercisesQuery() {
  return useQuery<ExercisesResponse>(() => ExercisesAPI.getAllExercises());
} 