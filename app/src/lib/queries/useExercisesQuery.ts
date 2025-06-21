'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';

export interface Exercise {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ExercisesResponse {
  exercises: Exercise[];
  count: number;
}

interface UseExercisesQueryResult {
  data: ExercisesResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExercisesQuery(): UseExercisesQueryResult {
  const [data, setData] = useState<ExercisesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('http://localhost:8080/exercises', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...AuthService.getAuthHeaders(),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch exercises: ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      fetchExercises();
    } else {
      setIsLoading(false);
      setError('Not authenticated');
    }
  }, []);

  const refetch = async (): Promise<void> => {
    await fetchExercises();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
} 