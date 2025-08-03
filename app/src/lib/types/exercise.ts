export interface Exercise {
  id: number;
  name: string;
  totalWeightMultiplier: number;
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
  totalWeightMultiplier?: number;
  primaryMuscles: string[];
  instructions: string;
}

export interface UpdateExerciseRequest {
  name?: string;
  totalWeightMultiplier?: number;
  force?: string;
  level?: string;
  mechanic?: string;
  equipment?: string;
  category?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
  images?: string[];
} 