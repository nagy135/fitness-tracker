export interface Exercise {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

export interface ExercisesResponse {
  exercises: Exercise[];
  count: number;
} 