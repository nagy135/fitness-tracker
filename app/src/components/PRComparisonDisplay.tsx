import React from 'react';
import { useExercisePRQuery } from '@/lib/queries/useExercisePRQuery';
import { useExerciseQuery } from '@/lib/queries/useExerciseQuery';

interface Set {
  reps: string;
  weight: string;
}

interface PRComparisonDisplayProps {
  exerciseId: number | undefined;
  currentSets: Set[];
}

export function PRComparisonDisplay({ exerciseId, currentSets }: PRComparisonDisplayProps) {
  const { data, isLoading, error } = useExercisePRQuery(exerciseId);
  const { data: exercise } = useExerciseQuery(exerciseId ? exerciseId.toString() : "0");

  // Don't show anything if no exercise is selected
  if (!exerciseId) {
    return null;
  }

  // Calculate current total volume
  const currentTotalVolume = currentSets.reduce((total, set) => {
    const reps = parseInt(set.reps) || 0;
    const weight = parseFloat(set.weight) || 0;
    return total + (reps * weight);
  }, 0);

  // Apply exercise weight multiplier if available
  const adjustedTotalVolume = exercise 
    ? currentTotalVolume * exercise.totalWeightMultiplier
    : currentTotalVolume;

  if (isLoading) {
    return (
      <div className="p-2 bg-gray-50 rounded border text-xs text-gray-600">
        Loading PR...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 bg-red-50 rounded border text-xs text-red-600">
        Error loading PR
      </div>
    );
  }

  const pr = data?.pr;

  // Determine the comparison status
  let status = '';
  let statusColor = 'text-gray-600';

  if (pr) {
    if (adjustedTotalVolume === 0) {
      status = `PR: ${Math.round(pr.maxTotalWeight)}kg`;
      statusColor = 'text-gray-600';
    } else {
      const difference = adjustedTotalVolume - pr.maxTotalWeight;
      
      if (difference > 0) {
        status = `+${difference.toFixed(1)}kg above PR`;
        statusColor = 'text-green-600';
      } else if (difference < 0) {
        status = `${Math.abs(difference).toFixed(1)}kg below PR`;
        statusColor = 'text-yellow-600';
      } else {
        status = 'Tied with PR';
        statusColor = 'text-blue-600';
      }
    }
  } else {
    status = 'No PR yet';
    statusColor = 'text-gray-500';
  }

  return (
    <div className="p-2 bg-gray-50 rounded border text-xs">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">
          {adjustedTotalVolume > 0 ? `Current: ${adjustedTotalVolume.toFixed(1)}kg` : 'Current Volume'}
        </span>
        <span className={statusColor}>{status}</span>
      </div>
      {exercise && exercise.totalWeightMultiplier !== 1.0 && (
        <div className="text-xs text-blue-600 mt-1">
          ⚡ Adjusted for {exercise.totalWeightMultiplier}x multiplier
        </div>
      )}
    </div>
  );
} 