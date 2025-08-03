import React from 'react';
import { useExercisePRQuery } from '@/lib/queries/useExercisePRQuery';
import { useExerciseQuery } from '@/lib/queries/useExerciseQuery';

interface PRDisplayProps {
  exerciseId: number | undefined;
}

export function PRDisplay({ exerciseId }: PRDisplayProps) {
  const { data, isLoading, error } = useExercisePRQuery(exerciseId);
  const { data: exercise } = useExerciseQuery(exerciseId ? exerciseId.toString() : "0");

  // Don't show anything if no exercise is selected
  if (!exerciseId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-purple-700">Personal Record</span>
          <span className="text-sm text-purple-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-700">Personal Record</span>
          <span className="text-sm text-red-600">Error loading PR</span>
        </div>
      </div>
    );
  }

  const pr = data?.pr;

  return (
    <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-purple-700">Personal Record</span>
        <span className="text-lg font-bold text-purple-900">
          PR: {pr ? `${Math.round(pr.maxTotalWeight)}kg` : 'No PR yet'}
        </span>
      </div>
      {pr && (
        <div className="text-xs text-purple-600 mt-1">
          Set on {new Date(pr.date).toLocaleDateString()}
        </div>
      )}
      {exercise && exercise.totalWeightMultiplier !== 1.0 && (
        <div className="text-xs text-blue-600 mt-1">
          ⚡ PR adjusted for {exercise.totalWeightMultiplier}x multiplier
        </div>
      )}
    </div>
  );
} 