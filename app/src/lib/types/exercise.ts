export interface Exercise {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  primaryMuscles?: string[];
  instructions?: string[];
}

export interface ExercisesResponse {
  exercises: Exercise[];
  count: number;
}

export interface CreateExerciseRequest {
  name: string;
  primaryMuscles: string[];
  instructions: string;
} 