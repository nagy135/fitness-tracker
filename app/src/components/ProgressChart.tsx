"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ExerciseStatistics, formatDate } from "@/lib/utils/statistics";

interface ProgressChartProps {
  exerciseStats: ExerciseStatistics;
}

interface TooltipPayload {
  payload: {
    totalWeight: number;
    recordCount: number;
  };
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{formatDate(label || '')}</p>
        <p className="text-blue-600">
          Total Weight: <span className="font-bold">{data.totalWeight} kg</span>
        </p>
        <p className="text-gray-600">
          Records: {data.recordCount}
        </p>
      </div>
    );
  }
  return null;
}

export function ProgressChart({ exerciseStats }: ProgressChartProps) {
  const { exerciseName, progress, totalRecords, firstRecordDate, lastRecordDate } = exerciseStats;

  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{exerciseName}</CardTitle>
          <CardDescription>No progress data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No records found for this exercise
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxWeight = Math.max(...progress.map(p => p.totalWeight));
  const minWeight = Math.min(...progress.map(p => p.totalWeight));
  const weightRange = maxWeight - minWeight;
  const yAxisDomain = [
    Math.max(0, minWeight - weightRange * 0.1),
    maxWeight + weightRange * 0.1
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{exerciseName}</CardTitle>
        <CardDescription>
          Progress from {formatDate(firstRecordDate)} to {formatDate(lastRecordDate)} • {totalRecords} total records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={progress}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                className="text-sm"
              />
              <YAxis
                domain={yAxisDomain}
                className="text-sm"
                label={{ value: 'Total Weight (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="totalWeight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Best Session</p>
            <p className="text-lg font-bold text-green-600">{maxWeight} kg</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Average</p>
            <p className="text-lg font-bold">
              {(progress.reduce((sum, p) => sum + p.totalWeight, 0) / progress.length).toFixed(1)} kg
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Sessions</p>
            <p className="text-lg font-bold">{progress.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 