'use client';

import { useQuery } from '@/hooks/useQuery';
import { RecordsAPI } from '@/lib/api/records';
import { RecordsResponse } from '@/lib/types/record';

export function useRecordsQuery() {
  return useQuery<RecordsResponse>(() => RecordsAPI.getAllRecords());
} 