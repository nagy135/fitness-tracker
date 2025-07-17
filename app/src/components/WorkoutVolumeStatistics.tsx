"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { WorkoutsAPI } from "@/lib/api/workouts";
import { WorkoutStats } from "@/lib/types/workout";
import { useQuery } from "@/hooks/useQuery";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WorkoutVolumeProgress {
  date: string;
  totalWeight: number;
  formattedDate: string;
}

interface WorkoutVolumeData {
  workoutName: string;
  progress: WorkoutVolumeProgress[];
  totalSessions: number;
  totalVolume: number;
  avgVolumePerSession: number;
  firstSessionDate: string;
  lastSessionDate: string;
}

function processWorkoutStats(stats: WorkoutStats[]): WorkoutVolumeData[] {
  // Group by workout name
  const workoutGroups = stats.reduce<Record<string, WorkoutStats[]>>((acc, stat) => {
    if (!acc[stat.workoutName]) {
      acc[stat.workoutName] = [];
    }
    acc[stat.workoutName].push(stat);
    return acc;
  }, {});

  return Object.entries(workoutGroups).map(([workoutName, workoutStats]) => {
    // Sort by date
    const sortedStats = workoutStats.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate progress over time
    const progress: WorkoutVolumeProgress[] = sortedStats.map(stat => ({
      date: stat.date.split('T')[0], // YYYY-MM-DD format
      totalWeight: stat.totalWeight,
      formattedDate: format(parseISO(stat.date), 'MMM d, yyyy'),
    }));

    // Calculate summary statistics
    const totalVolume = sortedStats.reduce((sum, stat) => sum + stat.totalWeight, 0);
    const totalSessions = sortedStats.length;
    const avgVolumePerSession = totalVolume / totalSessions;

    return {
      workoutName,
      progress,
      totalSessions,
      totalVolume,
      avgVolumePerSession,
      firstSessionDate: sortedStats[0].date,
      lastSessionDate: sortedStats[sortedStats.length - 1].date,
    };
  }).sort((a, b) => a.workoutName.localeCompare(b.workoutName));
}

export function WorkoutVolumeStatistics() {
  const { data: workoutStatsData, isLoading, error } = useQuery(() => WorkoutsAPI.getWorkoutStats());
  const [selectedWorkout, setSelectedWorkout] = useState<string>("");

  const workoutVolumeData = useMemo(() => {
    if (!workoutStatsData?.stats) return [];
    return processWorkoutStats(workoutStatsData.stats.filter(stat => stat.totalWeight > 0));
  }, [workoutStatsData]);

  const selectedWorkoutData = useMemo(() => {
    if (!selectedWorkout) return null;
    return workoutVolumeData.find(data => data.workoutName === selectedWorkout);
  }, [workoutVolumeData, selectedWorkout]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading workout volume data...</div>
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
            <h3 className="font-semibold mb-2">Error loading workout volume data</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workoutVolumeData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Volume Analysis</CardTitle>
          <CardDescription>Track your training volume over time by workout type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-12">
            <h3 className="font-semibold mb-2">No workout volume data found</h3>
            <p>Start recording workouts with exercises to see your volume progression!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workout Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Workout Volume Analysis</CardTitle>
          <CardDescription>
            Select a workout to see how your training volume has changed over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedWorkout}
            onChange={(e) => setSelectedWorkout(e.target.value)}
            placeholder="Select a workout to analyze..."
          >
            <option value="">Select a workout to analyze...</option>
            {workoutVolumeData.map((data) => (
              <option key={data.workoutName} value={data.workoutName}>
                {data.workoutName} ({data.totalSessions} sessions)
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {/* Volume Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {workoutVolumeData.map((data) => (
          <Card key={data.workoutName} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{data.workoutName}</CardTitle>
              <CardDescription>{data.totalSessions} sessions recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Volume:</span>
                  <span className="font-semibold text-green-700">
                    {Math.round(data.totalVolume)}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg per Session:</span>
                  <span className="font-semibold text-blue-700">
                    {Math.round(data.avgVolumePerSession)}kg
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Date Range:</span>
                  <span className="text-xs text-gray-500">
                    {format(parseISO(data.firstSessionDate), 'MMM d')} - {format(parseISO(data.lastSessionDate), 'MMM d')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Volume Progression Chart */}
      {selectedWorkoutData && (
        <Card>
          <CardHeader>
            <CardTitle>Volume Progression - {selectedWorkoutData.workoutName}</CardTitle>
            <CardDescription>
              Track how your training volume has evolved over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedWorkoutData.progress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="formattedDate" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value: number) => [`${Math.round(value)}kg`, 'Volume']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="totalWeight" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    dot={{ fill: '#16a34a', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Total Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {/* Session Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Session Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Sessions:</span>
                  <div className="font-semibold">{selectedWorkoutData.totalSessions}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Volume:</span>
                  <div className="font-semibold text-green-700">{Math.round(selectedWorkoutData.totalVolume)}kg</div>
                </div>
                <div>
                  <span className="text-gray-600">Average Volume:</span>
                  <div className="font-semibold text-blue-700">{Math.round(selectedWorkoutData.avgVolumePerSession)}kg</div>
                </div>
                <div>
                  <span className="text-gray-600">Progress:</span>
                  <div className="font-semibold text-purple-700">
                    {selectedWorkoutData.progress.length > 1 ? (
                      selectedWorkoutData.progress[selectedWorkoutData.progress.length - 1].totalWeight > 
                      selectedWorkoutData.progress[0].totalWeight ? "↗️ Improving" : "↘️ Declining"
                    ) : "📊 Single Session"}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 