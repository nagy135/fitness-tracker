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
import { MuscleGroupStatistics, formatDate } from "@/lib/utils/statistics";

interface MuscleGroupProgressChartProps {
  muscleGroupStats: MuscleGroupStatistics;
}

interface TooltipPayload {
  value: number;
  payload: {
    totalWeight: number;
    recordCount: number;
    exerciseCount: number;
  };
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayload[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{formatDate(label || '')}</p>
        <p className="text-blue-600">
          Total Weight: <span className="font-semibold">{Math.round(payload[0].value)}kg</span>
        </p>
        <p className="text-gray-600">
          Records: <span className="font-semibold">{payload[0].payload.recordCount}</span>
        </p>
        <p className="text-gray-600">
          Exercises: <span className="font-semibold">{payload[0].payload.exerciseCount}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function MuscleGroupProgressChart({ muscleGroupStats }: MuscleGroupProgressChartProps) {
  const { muscleGroup, progress, totalRecords, firstRecordDate, lastRecordDate, exercises } = muscleGroupStats;

  if (progress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{muscleGroup}</CardTitle>
          <CardDescription>No progress data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No records found for this muscle group
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
        <CardTitle className="text-xl">{muscleGroup}</CardTitle>
        <CardDescription>
          Progress over time • {totalRecords} total records • {exercises.length} exercises
        </CardDescription>
        <div className="text-sm text-gray-600">
          <p>First record: {formatDate(firstRecordDate)} • Last record: {formatDate(lastRecordDate)}</p>
          <p className="mt-1">
            Exercises: {exercises.slice(0, 3).join(", ")}
            {exercises.length > 3 && ` +${exercises.length - 3} more`}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={progress} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={yAxisDomain}
                stroke="#666"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${Math.round(value)}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="totalWeight"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 
