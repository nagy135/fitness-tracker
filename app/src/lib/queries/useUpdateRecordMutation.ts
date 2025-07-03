'use client';

import { useState } from 'react';
import { RecordsAPI } from '@/lib/api/records';
import { Record, UpdateRecordRequest } from '@/lib/types/record';

export function useUpdateRecordMutation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRecord = async (id: number, record: UpdateRecordRequest): Promise<Record> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await RecordsAPI.updateRecord(id, record);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update record';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateRecord,
    isLoading,
    error,
  };
} 