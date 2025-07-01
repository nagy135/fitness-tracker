export interface Workout {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  userId: number;
  label: string;
  date?: string;
}

export interface WorkoutsResponse {
  workouts: Workout[];
  count: number;
}

export interface CreateWorkoutRequest {
  label: string;
  date?: string;
}

export interface WorkoutStats {
  date: string;
  totalWeight: number;
  workoutName: string;
}

export interface WorkoutStatsResponse {
  stats: WorkoutStats[];
  count: number;
} 