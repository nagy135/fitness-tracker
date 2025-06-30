import { Record as WorkoutRecord } from '@/lib/types/record';

export interface ExerciseProgress {
  date: string;
  totalWeight: number;
  recordCount: number;
}

export interface ExerciseStatistics {
  exerciseId: number;
  exerciseName: string;
  progress: ExerciseProgress[];
  totalRecords: number;
  firstRecordDate: string;
  lastRecordDate: string;
}

export function processRecordsForStatistics(records: WorkoutRecord[]): ExerciseStatistics[] {
  // Helper function to get the display date for a record
  const getRecordDate = (record: WorkoutRecord): string => {
    return record.date || record.createdAt;
  };

  // Group records by exercise
  const exerciseGroups = records.reduce<Record<number, WorkoutRecord[]>>((acc, record) => {
    const key = record.exerciseId;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(record);
    return acc;
  }, {});

  return Object.entries(exerciseGroups).map(([exerciseId, exerciseRecords]) => {
    // Sort records by date (using custom date if available, otherwise createdAt)
    const sortedRecords = exerciseRecords.sort(
      (a, b) => new Date(getRecordDate(a)).getTime() - new Date(getRecordDate(b)).getTime()
    );

    // Calculate total weight per date
    const progressMap = new Map<string, { totalWeight: number; recordCount: number }>();

    sortedRecords.forEach(record => {
      const recordDate = getRecordDate(record);
      const date = new Date(recordDate).toISOString().split('T')[0]; // YYYY-MM-DD format
      const totalWeight = record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      
      if (progressMap.has(date)) {
        const existing = progressMap.get(date)!;
        progressMap.set(date, {
          totalWeight: existing.totalWeight + totalWeight,
          recordCount: existing.recordCount + 1,
        });
      } else {
        progressMap.set(date, {
          totalWeight,
          recordCount: 1,
        });
      }
    });

    // Convert to array and sort by date
    const progress: ExerciseProgress[] = Array.from(progressMap.entries())
      .map(([date, data]) => ({
        date,
        totalWeight: data.totalWeight,
        recordCount: data.recordCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      exerciseId: parseInt(exerciseId),
      exerciseName: sortedRecords[0].exercise.name,
      progress,
      totalRecords: exerciseRecords.length,
      firstRecordDate: getRecordDate(sortedRecords[0]),
      lastRecordDate: getRecordDate(sortedRecords[sortedRecords.length - 1]),
    };
  }).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
} 