'use client';

import { useQuery } from '@/hooks/useQuery';
import { RecordsAPI } from '@/lib/api/records';
import { ExerciseOptionsResponse } from '@/lib/types/record';

export function useExerciseOptionsQuery() {
  return useQuery<ExerciseOptionsResponse>(() => RecordsAPI.getExerciseOptions());
} 