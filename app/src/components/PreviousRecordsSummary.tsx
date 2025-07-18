"use client";

import React from "react";
import { formatDateTime } from "@/lib/utils/date";
import { Record } from "@/lib/types/record";

interface PreviousRecordsSummaryProps {
  records: Record[];
  exerciseId: number | undefined;
  className?: string;
}

export function PreviousRecordsSummary({ records, exerciseId, className = "" }: PreviousRecordsSummaryProps) {
  if (!exerciseId || !records || records.length === 0) {
    return null;
  }

  // Find previous records for this exercise (excluding the current one if editing)
  const exerciseRecords = records
    .filter(record => record.exerciseId === exerciseId)
    .sort((a, b) => {
      // Sort by custom date if available, otherwise by createdAt
      const dateA = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA; // Sort by newest first
    });

  // Get the most recent record (excluding current if editing)
  const previousRecord = exerciseRecords[1]; // Second most recent

  if (!previousRecord) {
    return (
      <div className={`p-3 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="text-sm text-gray-600">No previous records found for this exercise</div>
      </div>
    );
  }

  const totalVolume = previousRecord.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const displayDate = previousRecord.date ? previousRecord.date : previousRecord.createdAt;
  const isCustomDate = !!previousRecord.date;

  return (
    <div className={`p-3 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <div className="text-sm text-blue-700 font-medium mb-2">Previous Record</div>
      <div className="text-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium text-blue-800">
            {totalVolume.toFixed(1)} kg total
          </span>
          <span className="text-xs text-blue-600">
            {isCustomDate ? formatDateTime(displayDate) : formatDateTime(previousRecord.createdAt)}
          </span>
        </div>
        <div className="text-xs text-blue-600">
          {previousRecord.sets.length} set{previousRecord.sets.length !== 1 ? 's' : ''}: {previousRecord.sets.map(set => `${set.reps}×${set.weight}kg`).join(', ')}
        </div>
      </div>
    </div>
  );
} 