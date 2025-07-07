'use client';

import { useState, useEffect } from 'react';
import { RecordsAPI, ExercisePRResponse } from '@/lib/api/records';

export function useExercisePRQuery(exerciseId: number | undefined) {
  const [data, setData] = useState<ExercisePRResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseId) {
      setData(null);
      setError(null);
      return;
    }

    const fetchPR = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await RecordsAPI.getExercisePR(exerciseId);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch PR data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPR();
  }, [exerciseId]);

  return { data, isLoading, error };
} 