import { AuthService } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config/api';
import { WorkoutsResponse, CreateWorkoutRequest, Workout, WorkoutStatsResponse, DayStats } from '@/lib/types/workout';

export class WorkoutsAPI {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
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

  static async getAllWorkouts(): Promise<WorkoutsResponse> {
    return this.makeRequest<WorkoutsResponse>(API_CONFIG.ENDPOINTS.WORKOUTS);
  }

  static async getWorkoutStats(): Promise<WorkoutStatsResponse> {
    return this.makeRequest<WorkoutStatsResponse>(API_CONFIG.ENDPOINTS.WORKOUT_STATS);
  }

  static async getWorkoutStatsByDate(date: string): Promise<DayStats> {
    return this.makeRequest<DayStats>(API_CONFIG.ENDPOINTS.WORKOUT_STATS_BY_DATE(date));
  }

  static async createWorkout(workout: CreateWorkoutRequest): Promise<Workout> {
    return this.makeRequest<Workout>(API_CONFIG.ENDPOINTS.WORKOUTS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workout),
    });
  }
} 