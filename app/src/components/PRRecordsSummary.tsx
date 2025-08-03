"use client";

import React from "react";
import { formatDateTime } from "@/lib/utils/date";
import { Record } from "@/lib/types/record";
import { useExercisePRQuery } from "@/lib/queries/useExercisePRQuery";
import { useExerciseQuery } from "@/lib/queries/useExerciseQuery";

interface PRRecordsSummaryProps {
  records: Record[];
  exerciseId: number | undefined;
  className?: string;
}

export function PRRecordsSummary({ records, exerciseId, className = "" }: PRRecordsSummaryProps) {
  const { data: prData, isLoading, error } = useExercisePRQuery(exerciseId);
  const { data: exercise } = useExerciseQuery(exerciseId ? exerciseId.toString() : "0");

  if (!exerciseId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`p-3 bg-purple-50 rounded-lg border border-purple-200 ${className}`}>
        <div className="text-sm text-purple-600">Loading PR...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-3 bg-red-50 rounded-lg border border-red-200 ${className}`}>
        <div className="text-sm text-red-600">Error loading PR</div>
      </div>
    );
  }

  const pr = prData?.pr;

  if (!pr) {
    return (
      <div className={`p-3 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="text-sm text-gray-600">No PR found for this exercise</div>
      </div>
    );
  }

  // Find the PR record in the records array using the recordId
  const prRecord = records.find(record => record.id === pr.recordId);

  if (!prRecord) {
    return (
      <div className={`p-3 bg-purple-50 rounded-lg border border-purple-200 ${className}`}>
        <div className="text-sm text-purple-700 font-medium mb-2">Personal Record</div>
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-purple-800">
              {pr.maxTotalWeight.toFixed(1)} kg total
            </span>
            <span className="text-xs text-purple-600">
              {formatDateTime(pr.date)}
            </span>
          </div>
          <div className="text-xs text-purple-600">
            Sets data not available
          </div>
        </div>
        {exercise && exercise.totalWeightMultiplier !== 1.0 && (
          <div className="text-xs text-blue-600 mt-1">
            ⚡ PR adjusted for {exercise.totalWeightMultiplier}x multiplier
          </div>
        )}
      </div>
    );
  }

  const displayDate = prRecord.date ? prRecord.date : prRecord.createdAt;
  const isCustomDate = !!prRecord.date;

  return (
    <div className={`p-3 bg-purple-50 rounded-lg border border-purple-200 ${className}`}>
      <div className="text-sm text-purple-700 font-medium mb-2">Personal Record</div>
      <div className="text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-purple-800">
            {pr.maxTotalWeight.toFixed(1)} kg total
          </span>
          <span className="text-xs text-purple-600">
            {isCustomDate ? formatDateTime(displayDate) : formatDateTime(prRecord.createdAt)}
          </span>
        </div>
        <div className="text-xs text-purple-600">
          {prRecord.sets.length} set{prRecord.sets.length !== 1 ? 's' : ''}: {prRecord.sets.map(set => `${set.reps}×${set.weight}kg`).join(', ')}
        </div>
      </div>
      {exercise && exercise.totalWeightMultiplier !== 1.0 && (
        <div className="text-xs text-blue-600 mt-1">
          ⚡ PR adjusted for {exercise.totalWeightMultiplier}x multiplier
        </div>
      )}
    </div>
  );
} 