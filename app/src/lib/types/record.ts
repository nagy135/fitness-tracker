import { Exercise } from './exercise';

export interface Set {
  id: number;
  createdAt: string;
  updatedAt: string;
  reps: number;
  weight: number;
  recordId: number;
}

export interface Record {
  id: number;
  createdAt: string;
  updatedAt: string;
  exerciseId: number;
  exercise: Exercise;
  userId: number;
  sets: Set[];
  date?: string;
}

export interface RecordsResponse {
  records: Record[];
  count: number;
}

export interface CreateSetRequest {
  reps: number;
  weight: number;
}

export interface CreateRecordRequest {
  exerciseId: number;
  sets: CreateSetRequest[];
  date?: string;
}

export interface ExerciseOption {
  id: number;
  name: string;
}

export interface ExerciseOptionsResponse {
  exercises: ExerciseOption[];
  count: number;
} 