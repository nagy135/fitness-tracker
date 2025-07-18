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

export interface MuscleGroupProgress {
  date: string;
  totalWeight: number;
  recordCount: number;
  exerciseCount: number;
}

export interface MuscleGroupStatistics {
  muscleGroup: string;
  progress: MuscleGroupProgress[];
  totalRecords: number;
  firstRecordDate: string;
  lastRecordDate: string;
  exercises: string[];
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

export function processRecordsForMuscleGroupStatistics(records: WorkoutRecord[]): MuscleGroupStatistics[] {
  // Helper function to get the display date for a record
  const getRecordDate = (record: WorkoutRecord): string => {
    return record.date || record.createdAt;
  };

  // Helper function to normalize muscle group names (remove "s" suffix for grouping)
  const normalizeMuscleGroup = (muscleGroup: string): string => {
    return muscleGroup.toLowerCase().replace(/s$/, '');
  };

  // Create a map to store muscle group data
  const muscleGroupMap = new Map<string, {
    records: WorkoutRecord[];
    exercises: Set<string>;
    exerciseRecordCounts: Map<string, number>;
    originalNames: Set<string>; // Track original muscle group names for display
  }>();

  // Process each record and group by muscle groups
  records.forEach(record => {
    const muscleGroups = record.exercise.primaryMuscles || [];
    
    // If no muscle groups, skip this record
    if (muscleGroups.length === 0) {
      return;
    }

    // Add record to each muscle group it targets
    muscleGroups.forEach(muscleGroup => {
      const normalizedGroup = normalizeMuscleGroup(muscleGroup);
      
      if (!muscleGroupMap.has(normalizedGroup)) {
        muscleGroupMap.set(normalizedGroup, {
          records: [],
          exercises: new Set(),
          exerciseRecordCounts: new Map(),
          originalNames: new Set(),
        });
      }
      
      const groupData = muscleGroupMap.get(normalizedGroup)!;
      groupData.records.push(record);
      groupData.exercises.add(record.exercise.name);
      groupData.originalNames.add(muscleGroup); // Keep track of original name
      
      // Track record count for each exercise
      const currentCount = groupData.exerciseRecordCounts.get(record.exercise.name) || 0;
      groupData.exerciseRecordCounts.set(record.exercise.name, currentCount + 1);
    });
  });

  // Convert map to array of MuscleGroupStatistics
  return Array.from(muscleGroupMap.entries()).map(([normalizedGroup, groupData]) => {
    // Sort records by date
    const sortedRecords = groupData.records.sort(
      (a, b) => new Date(getRecordDate(a)).getTime() - new Date(getRecordDate(b)).getTime()
    );

    // Calculate total weight per date
    const progressMap = new Map<string, { 
      totalWeight: number; 
      recordCount: number; 
      exerciseCount: number;
      exercises: Set<string>;
    }>();

    sortedRecords.forEach(record => {
      const recordDate = getRecordDate(record);
      const date = new Date(recordDate).toISOString().split('T')[0]; // YYYY-MM-DD format
      const totalWeight = record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      
      if (progressMap.has(date)) {
        const existing = progressMap.get(date)!;
        existing.exercises.add(record.exercise.name);
        progressMap.set(date, {
          totalWeight: existing.totalWeight + totalWeight,
          recordCount: existing.recordCount + 1,
          exerciseCount: existing.exercises.size,
          exercises: existing.exercises,
        });
      } else {
        const exercises = new Set([record.exercise.name]);
        progressMap.set(date, {
          totalWeight,
          recordCount: 1,
          exerciseCount: 1,
          exercises,
        });
      }
    });

    // Convert to array and sort by date
    const progress: MuscleGroupProgress[] = Array.from(progressMap.entries())
      .map(([date, data]) => ({
        date,
        totalWeight: data.totalWeight,
        recordCount: data.recordCount,
        exerciseCount: data.exerciseCount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Sort exercises by record count (descending), then by name (ascending) for ties
    const sortedExercises = Array.from(groupData.exercises).sort((a, b) => {
      const countA = groupData.exerciseRecordCounts.get(a) || 0;
      const countB = groupData.exerciseRecordCounts.get(b) || 0;
      
      if (countB !== countA) {
        return countB - countA; // Higher count first
      }
      
      return a.localeCompare(b); // Alphabetical for ties
    });

    // Choose the most common original name for display (prefer singular form)
    const originalNames = Array.from(groupData.originalNames);
    const displayName = originalNames.find(name => !name.toLowerCase().endsWith('s')) || originalNames[0];

    return {
      muscleGroup: displayName,
      progress,
      totalRecords: groupData.records.length,
      firstRecordDate: getRecordDate(sortedRecords[0]),
      lastRecordDate: getRecordDate(sortedRecords[sortedRecords.length - 1]),
      exercises: sortedExercises,
    };
  }).sort((a, b) => a.muscleGroup.localeCompare(b.muscleGroup));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
} 