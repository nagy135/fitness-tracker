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
    // Sort records by date
    const sortedRecords = exerciseRecords.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Calculate total weight per date
    const progressMap = new Map<string, { totalWeight: number; recordCount: number }>();

    sortedRecords.forEach(record => {
      const date = new Date(record.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD format
      const totalWeight = record.reps.reduce((sum, rep) => sum + rep.weight, 0);
      
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
      firstRecordDate: sortedRecords[0].createdAt,
      lastRecordDate: sortedRecords[sortedRecords.length - 1].createdAt,
    };
  }).sort((a, b) => a.exerciseName.localeCompare(b.exerciseName));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
} 