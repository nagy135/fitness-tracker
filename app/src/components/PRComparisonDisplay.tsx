import React from 'react';
import { useExercisePRQuery } from '@/lib/queries/useExercisePRQuery';

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

  // Determine the comparison status
  let comparisonStatus = 'neutral';
  let comparisonText = '';
  let differenceText = '';

  if (pr) {
    const prWeight = pr.maxTotalWeight;
    const difference = currentTotalVolume - prWeight;
    
    if (difference > 0) {
      comparisonStatus = 'beating';
      comparisonText = `+${difference.toFixed(1)}kg above PR!`;
      differenceText = `You're beating your PR by ${difference.toFixed(1)}kg!`;
    } else if (difference < 0) {
      comparisonStatus = 'below';
      comparisonText = `${Math.abs(difference).toFixed(1)}kg to beat PR`;
      differenceText = `Add ${Math.abs(difference).toFixed(1)}kg more to break your PR`;
    } else {
      comparisonStatus = 'tied';
      comparisonText = 'Tied with PR!';
      differenceText = 'You tied your personal record!';
    }
  }

  const getStatusColor = () => {
    switch (comparisonStatus) {
      case 'beating':
        return 'from-green-50 to-green-100 border-green-200';
      case 'below':
        return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 'tied':
        return 'from-blue-50 to-blue-100 border-blue-200';
      default:
        return 'from-purple-50 to-purple-100 border-purple-200';
    }
  };

  const getTextColor = () => {
    switch (comparisonStatus) {
      case 'beating':
        return 'text-green-700';
      case 'below':
        return 'text-yellow-700';
      case 'tied':
        return 'text-blue-700';
      default:
        return 'text-purple-700';
    }
  };

  const getValueColor = () => {
    switch (comparisonStatus) {
      case 'beating':
        return 'text-green-900';
      case 'below':
        return 'text-yellow-900';
      case 'tied':
        return 'text-blue-900';
      default:
        return 'text-purple-900';
    }
  };

  return (
    <div className={`p-3 bg-gradient-to-r ${getStatusColor()} rounded-lg border`}>
      <div className="space-y-2">
        {/* Current volume vs PR */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getTextColor()}`}>Current Volume</span>
          <span className={`text-lg font-bold ${getValueColor()}`}>
            {currentTotalVolume.toFixed(1)}kg
          </span>
        </div>

        {/* PR display */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getTextColor()}`}>Personal Record</span>
          <span className={`text-sm font-semibold ${getValueColor()}`}>
            {pr ? `${Math.round(pr.maxTotalWeight)}kg` : 'No PR yet'}
          </span>
        </div>

        {/* Comparison info */}
        {pr && currentTotalVolume > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="flex items-center justify-between">
              <span className={`text-xs ${getTextColor()}`}>Status:</span>
              <span className={`text-xs font-medium ${getValueColor()}`}>
                {comparisonText}
              </span>
            </div>
            <div className={`text-xs ${getTextColor()} mt-1`}>
              {differenceText}
            </div>
          </div>
        )}

        {/* PR date */}
        {pr && (
          <div className={`text-xs ${getTextColor()} opacity-75`}>
            PR set on {new Date(pr.date).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
} 