'use client';

import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';

interface UseQueryOptions {
  enabled?: boolean;
  dependencies?: React.DependencyList;
}

interface UseQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useQuery<T>(
  queryFn: () => Promise<T>,
  options: UseQueryOptions = {}
): UseQueryResult<T> {
  const { enabled = true, dependencies = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && AuthService.isAuthenticated()) {
      fetchData();
    } else if (!AuthService.isAuthenticated()) {
      setIsLoading(false);
      setError('Not authenticated');
    } else if (!enabled) {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...dependencies]);

  const refetch = async (): Promise<void> => {
    await fetchData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
} 