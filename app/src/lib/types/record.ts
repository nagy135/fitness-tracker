import { Exercise } from './exercise';

export interface Rep {
  id: number;
  createdAt: string;
  updatedAt: string;
  weight: number;
  feeling: 'easy' | 'normal' | 'hard';
  recordId: number;
}

export interface Record {
  id: number;
  createdAt: string;
  updatedAt: string;
  exerciseId: number;
  exercise: Exercise;
  userId: number;
  reps: Rep[];
}

export interface RecordsResponse {
  records: Record[];
  count: number;
}

export interface CreateRepRequest {
  weight: number;
  feeling: 'easy' | 'normal' | 'hard';
}

export interface CreateRecordRequest {
  exerciseId: number;
  reps: CreateRepRequest[];
}

export interface ExerciseOption {
  id: number;
  name: string;
}

export interface ExerciseOptionsResponse {
  exercises: ExerciseOption[];
  count: number;
} 