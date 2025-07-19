import { AuthService } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config/api';
import { Exercise, ExercisesResponse, CreateExerciseRequest } from '@/lib/types/exercise';

export class ExercisesAPI {
  private static async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await AuthService.makeAuthenticatedRequest(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Resource not found');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getAllExercises(): Promise<ExercisesResponse> {
    return this.makeRequest<ExercisesResponse>(API_CONFIG.ENDPOINTS.EXERCISES);
  }

  static async getExerciseById(id: string | number): Promise<Exercise> {
    return this.makeRequest<Exercise>(API_CONFIG.ENDPOINTS.EXERCISE_BY_ID(id));
  }

  static async createExercise(exercise: CreateExerciseRequest): Promise<Exercise> {
    return this.makeRequest<Exercise>(API_CONFIG.ENDPOINTS.EXERCISES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(exercise),
    });
  }
} 