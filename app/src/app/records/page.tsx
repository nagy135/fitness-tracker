"use client";

import { useEffect } from "react";
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
import { formatDateTime } from "@/lib/utils/date";
import { Record } from "@/lib/types/record";

function FeelingBadge({ feeling }: { feeling: string }) {
  const colorMap = {
    easy: "bg-green-100 text-green-800",
    normal: "bg-yellow-100 text-yellow-800", 
    hard: "bg-red-100 text-red-800",
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[feeling as keyof typeof colorMap]}`}>
      {feeling.charAt(0).toUpperCase() + feeling.slice(1)}
    </span>
  );
}

function RecordCard({ record }: { record: Record }) {
  const totalWeight = record.reps.reduce((sum, rep) => sum + rep.weight, 0);
  const averageWeight = totalWeight / record.reps.length;
  
  // Use custom date if available, otherwise use createdAt
  const displayDate = record.date ? record.date : record.createdAt;
  const isCustomDate = !!record.date;
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{record.exercise.name}</CardTitle>
          <div className="text-sm text-gray-500">
            {record.reps.length} rep{record.reps.length !== 1 ? 's' : ''}
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
              {averageWeight.toFixed(1)} kg avg
            </div>
            <div className="text-sm text-gray-500">Record #{record.id}</div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Reps:</div>
            <div className="grid gap-2">
              {record.reps.map((rep, index) => (
                <div
                  key={rep.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">#{index + 1}</span>
                    <span className="font-medium">{rep.weight} kg</span>
                  </div>
                  <FeelingBadge feeling={rep.feeling} />
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

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Records</h1>
            <p className="text-gray-600 mt-2">
              {data
                ? `${data.count} record${data.count !== 1 ? "s" : ""} found`
                : "Loading records..."}
            </p>
          </div>
          <div className="space-x-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button onClick={() => router.push("/")} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-1">
            <RecordForm onSuccess={handleRecordCreated} />
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
                    <RecordCard key={record.id} record={record} />
                  ))}
                </div>
              </div>
            )}

            {data && data.records && data.records.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-gray-600">
                    <h3 className="font-semibold mb-2">No records found</h3>
                    <p>Start by creating your first record using the form on the left!</p>
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