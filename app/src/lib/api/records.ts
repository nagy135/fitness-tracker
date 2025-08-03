import { AuthService } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config/api';
import { RecordsResponse, CreateRecordRequest, UpdateRecordRequest, Record, ExerciseOptionsResponse, PRResponse } from '@/lib/types/record';

export type ExercisePRResponse = PRResponse;

export class RecordsAPI {
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

  static async getAllRecords(): Promise<RecordsResponse> {
    return this.makeRequest<RecordsResponse>(API_CONFIG.ENDPOINTS.RECORDS);
  }

  static async createRecord(record: CreateRecordRequest): Promise<Record> {
    return this.makeRequest<Record>(API_CONFIG.ENDPOINTS.RECORDS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
  }

  static async updateRecord(id: number, record: UpdateRecordRequest): Promise<Record> {
    return this.makeRequest<Record>(API_CONFIG.ENDPOINTS.RECORD_BY_ID(id), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });
  }

  static async getExerciseOptions(): Promise<ExerciseOptionsResponse> {
    return this.makeRequest<ExerciseOptionsResponse>(API_CONFIG.ENDPOINTS.EXERCISE_OPTIONS);
  }

  static async getExercisePR(exerciseId: number): Promise<ExercisePRResponse> {
    return this.makeRequest<ExercisePRResponse>(API_CONFIG.ENDPOINTS.RECORD_PR(exerciseId));
  }
} 