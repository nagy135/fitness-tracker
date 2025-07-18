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
import { MuscleGroupProgressChart } from "@/components/MuscleGroupProgressChart";
import { useRecordsQuery } from "@/lib/queries/useRecordsQuery";
import { processRecordsForMuscleGroupStatistics } from "@/lib/utils/statistics";

export function MuscleGroupsStatistics() {
  const { data: recordsData, isLoading, error } = useRecordsQuery();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg text-gray-600">Loading muscle groups data...</div>
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
            <h3 className="font-semibold mb-2">Error loading muscle groups data</h3>
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
          <CardTitle>Muscle Groups Progress</CardTitle>
          <CardDescription>Track your strength progression by muscle group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <h3 className="font-semibold mb-2">No workout data found</h3>
            <p>Start recording workouts to see your muscle group progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const muscleGroupStatistics = processRecordsForMuscleGroupStatistics(recordsData.records);

  if (muscleGroupStatistics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muscle Groups Progress</CardTitle>
          <CardDescription>Track your strength progression by muscle group</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <h3 className="font-semibold mb-2">No muscle group data found</h3>
            <p>Your workout records don&apos;t contain exercises with muscle group information.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Set default selection to first muscle group if none selected
  const currentMuscleGroup = selectedMuscleGroup || muscleGroupStatistics[0].muscleGroup;
  const currentMuscleGroupStats = muscleGroupStatistics.find(mg => mg.muscleGroup === currentMuscleGroup);

  return (
    <div className="space-y-6">
      {/* Muscle Group Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Muscle Groups Progress</CardTitle>
          <CardDescription>
            Track your strength progression over time by muscle group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
            <label htmlFor="muscle-group-select" className="text-sm font-medium">
              Select Muscle Group:
            </label>
            <Select
              id="muscle-group-select"
              value={currentMuscleGroup}
              onChange={(e) => setSelectedMuscleGroup(e.target.value)}
              className="flex-1 sm:flex-none"
            >
              {muscleGroupStatistics.map((muscleGroupStats) => (
                <option key={muscleGroupStats.muscleGroup} value={muscleGroupStats.muscleGroup}>
                  {muscleGroupStats.muscleGroup} ({muscleGroupStats.totalRecords} records, {muscleGroupStats.exercises.length} exercises)
                </option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Progress Chart */}
      {currentMuscleGroupStats && <MuscleGroupProgressChart muscleGroupStats={currentMuscleGroupStats} />}
    </div>
  );
} 