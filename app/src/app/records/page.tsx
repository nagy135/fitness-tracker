"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useRecordsQuery } from "@/lib/queries/useRecordsQuery";
import { RecordForm } from "@/components/RecordForm";
import { EditRecordForm } from "@/components/EditRecordForm";
import { formatDateTime } from "@/lib/utils/date";
import { Record } from "@/lib/types/record";

function RecordCard({ record, onRecordUpdated, exerciseRecordCounts, records }: { 
  record: Record; 
  onRecordUpdated: () => void; 
  exerciseRecordCounts: { [exerciseId: number]: number };
  records: Record[];
}) {
  const totalVolume = record.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const adjustedTotalVolume = totalVolume * record.exercise.totalWeightMultiplier;
  
  // Use custom date if available, otherwise use createdAt
  const displayDate = record.date ? record.date : record.createdAt;
  const isCustomDate = !!record.date;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{record.exercise.name}</CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              {record.sets.length} set{record.sets.length !== 1 ? 's' : ''}
            </div>
            <EditRecordForm 
              record={record} 
              onSuccess={onRecordUpdated} 
              exerciseRecordCounts={exerciseRecordCounts} 
              records={records}
            />
          </div>
        </div>
        <CardDescription>
          {isCustomDate ? formatDateTime(displayDate) : formatDateTime(record.createdAt)}
          {isCustomDate && (
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Custom Date
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">
              {adjustedTotalVolume.toFixed(1)} kg total
            </div>
            <div className="text-sm text-gray-500">Record #{record.id}</div>
          </div>
          
          {record.exercise.totalWeightMultiplier !== 1.0 && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              ⚡ Adjusted for {record.exercise.totalWeightMultiplier}x multiplier (raw: {totalVolume.toFixed(1)}kg)
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Sets:</div>
            <div className="grid gap-2">
              {record.sets.map((set, index) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">#{index + 1}</span>
                    <span className="font-medium">{set.reps} × {set.weight} kg</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {(set.reps * set.weight).toFixed(1)} kg
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function RecordsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useRecordsQuery();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // Calculate exercise record counts
  const exerciseRecordCounts = React.useMemo(() => {
    if (!data?.records) return {};
    
    const counts: { [exerciseId: number]: number } = {};
    data.records.forEach(record => {
      counts[record.exerciseId] = (counts[record.exerciseId] || 0) + 1;
    });
    return counts;
  }, [data?.records]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const handleRecordCreated = () => {
    refetch(); // Refresh the records list when a new record is created
  };

  const handleRecordUpdated = () => {
    refetch(); // Refresh the records list when a record is updated
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Records</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              {data
                ? `${data.count} record${data.count !== 1 ? "s" : ""} found`
                : "Loading records..."}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button
              onClick={() => router.push("/exercises")}
              variant="default"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              View Exercises
            </Button>
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <RecordForm 
              onSuccess={handleRecordCreated} 
              exerciseRecordCounts={exerciseRecordCounts} 
              records={data?.records || []}
            />
          </div>

          {/* Records List Section */}
          <div className="lg:col-span-2">
            {error && (
              <Card className="mb-6 border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-red-800">
                    <h3 className="font-semibold mb-2">Error loading records</h3>
                    <p>{error}</p>
                    <Button
                      onClick={() => refetch()}
                      className="mt-4"
                      variant="outline"
                      size="sm"
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {isLoading && !data && (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading records...</div>
              </div>
            )}

            {data && data.records && data.records.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Your Records</h2>
                <div className="grid gap-4">
                  {data.records
                    .sort((a, b) => {
                      // Sort by custom date if available, otherwise by createdAt
                      const dateA = a.date ? new Date(a.date).getTime() : new Date(a.createdAt).getTime();
                      const dateB = b.date ? new Date(b.date).getTime() : new Date(b.createdAt).getTime();
                      return dateB - dateA; // Sort by newest first
                    })
                    .map((record) => (
                    <RecordCard 
                      key={record.id} 
                      record={record} 
                      onRecordUpdated={handleRecordUpdated} 
                      exerciseRecordCounts={exerciseRecordCounts} 
                      records={data?.records || []}
                    />
                  ))}
                </div>
              </div>
            )}

            {data && data.records && data.records.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600">
                    <h3 className="font-semibold mb-2">No records found</h3>
                    <p className="mb-4">Start by creating your first record using the form on the left!</p>
                    <Button
                      onClick={() => router.push("/exercises")}
                      variant="outline"
                      size="sm"
                    >
                      Browse Exercises
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 