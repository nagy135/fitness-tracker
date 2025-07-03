'use client';

import { useState } from 'react';
import { ExercisesAPI } from '@/lib/api/exercises';
import { Exercise, CreateExerciseRequest } from '@/lib/types/exercise';

export function useCreateExerciseMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExercise = async (exercise: CreateExerciseRequest): Promise<Exercise> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await ExercisesAPI.createExercise(exercise);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create exercise';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createExercise,
    isLoading,
    error,
  };
} 