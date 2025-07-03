import { AuthService } from '@/lib/auth';
import { API_CONFIG } from '@/lib/config/api';
import { RecordsResponse, CreateRecordRequest, UpdateRecordRequest, Record, ExerciseOptionsResponse } from '@/lib/types/record';

export class RecordsAPI {
  private static async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...AuthService.getAuthHeaders(),
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
      body: JSON.stringify(record),
    });
  }

  static async updateRecord(id: number, record: UpdateRecordRequest): Promise<Record> {
    return this.makeRequest<Record>(API_CONFIG.ENDPOINTS.RECORD_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(record),
    });
  }

  static async getExerciseOptions(): Promise<ExerciseOptionsResponse> {
    return this.makeRequest<ExerciseOptionsResponse>(API_CONFIG.ENDPOINTS.EXERCISE_OPTIONS);
  }
} 