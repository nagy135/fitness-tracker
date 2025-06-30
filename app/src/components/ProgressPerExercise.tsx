"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressChart } from "@/components/ProgressChart";
import { useRecordsQuery } from "@/lib/queries/useRecordsQuery";
import { processRecordsForStatistics } from "@/lib/utils/statistics";

export function ProgressPerExercise() {
  const { data: recordsData, isLoading, error } = useRecordsQuery();
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading progress data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-800">
            <h3 className="font-semibold mb-2">Error loading progress data</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recordsData || recordsData.records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Per Exercise</CardTitle>
          <CardDescription>Track your strength progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <h3 className="font-semibold mb-2">No workout data found</h3>
            <p>Start recording workouts to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const exerciseStatistics = processRecordsForStatistics(recordsData.records);

  if (exerciseStatistics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Per Exercise</CardTitle>
          <CardDescription>Track your strength progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <h3 className="font-semibold mb-2">No exercise data found</h3>
            <p>Your workout records don&apos;t contain exercise information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Set default selection to first exercise if none selected
  const currentExerciseId = selectedExerciseId || exerciseStatistics[0].exerciseId;
  const currentExercise = exerciseStatistics.find(ex => ex.exerciseId === currentExerciseId);

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Progress Per Exercise</CardTitle>
          <CardDescription>
            Track your strength progression over time by exercise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <label htmlFor="exercise-select" className="text-sm font-medium">
              Select Exercise:
            </label>
            <Select
              id="exercise-select"
              value={currentExerciseId.toString()}
              onChange={(e) => setSelectedExerciseId(parseInt(e.target.value))}
              className="flex-1 sm:flex-none"
            >
              {exerciseStatistics.map((exerciseStats) => (
                <option key={exerciseStats.exerciseId} value={exerciseStats.exerciseId}>
                  {exerciseStats.exerciseName} ({exerciseStats.totalRecords} records)
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart */}
      {currentExercise && <ProgressChart exerciseStats={currentExercise} />}
    </div>
  );
} 