import { processRecordsForStatistics } from './statistics';
import { Record as WorkoutRecord } from '@/lib/types/record';

// Mock data for testing
const mockRecords: WorkoutRecord[] = [
  {
    id: 1,
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
    exerciseId: 1,
    exercise: { id: 1, name: 'Bench Press', createdAt: '', updatedAt: '' },
    userId: 1,
    sets: [
      { id: 1, reps: 10, weight: 100, recordId: 1, createdAt: '', updatedAt: '' },
      { id: 2, reps: 8, weight: 105, recordId: 1, createdAt: '', updatedAt: '' },
    ]
  },
  {
    id: 2,
    createdAt: '2024-01-05T10:00:00Z',
    updatedAt: '2024-01-05T10:00:00Z',
    exerciseId: 1,
    exercise: { id: 1, name: 'Bench Press', createdAt: '', updatedAt: '' },
    userId: 1,
    sets: [
      { id: 3, reps: 12, weight: 110, recordId: 2, createdAt: '', updatedAt: '' },
      { id: 4, reps: 6, weight: 115, recordId: 2, createdAt: '', updatedAt: '' },
    ]
  },
  {
    id: 3,
    createdAt: '2024-01-02T10:00:00Z',
    updatedAt: '2024-01-02T10:00:00Z',
    exerciseId: 2,
    exercise: { id: 2, name: 'Squat', createdAt: '', updatedAt: '' },
    userId: 1,
    sets: [
      { id: 5, reps: 15, weight: 150, recordId: 3, createdAt: '', updatedAt: '' },
    ]
  }
];

// Test function (just for verification, not actual test framework)
function testProcessRecordsForStatistics() {
  const result = processRecordsForStatistics(mockRecords);
  
  console.log('Test Results:', {
    numberOfExercises: result.length,
    exercises: result.map(ex => ({
      name: ex.exerciseName,
      totalRecords: ex.totalRecords,
      progressPoints: ex.progress.length
    }))
  });
  
  return result;
}

// Export for potential future use
export { testProcessRecordsForStatistics }; 