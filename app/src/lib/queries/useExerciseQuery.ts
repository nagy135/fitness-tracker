'use client';

import { useQuery } from '@/hooks/useQuery';
import { ExercisesAPI } from '@/lib/api/exercises';
import { Exercise } from '@/lib/types/exercise';

export function useExerciseQuery(id: string | number) {
  return useQuery<Exercise>(
    () => ExercisesAPI.getExerciseById(id),
    {
      enabled: !!id,
      dependencies: [id],
    }
  );
} 