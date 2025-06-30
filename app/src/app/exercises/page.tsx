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
import { useExercisesQuery } from "@/lib/queries/useExercisesQuery";
import { formatDate } from "@/lib/utils/date";

export default function ExercisesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useExercisesQuery();
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

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Exercises</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              {data
                ? `${data.count} exercise${data.count !== 1 ? "s" : ""} found`
                : "Loading exercises..."}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Back to Home
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <h3 className="font-semibold mb-2">Error loading exercises</h3>
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
            <div className="text-lg text-gray-600">Loading exercises...</div>
          </div>
        )}

        {data && data.exercises && data.exercises.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription>Exercise ID: {exercise.id}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {formatDate(exercise.createdAt)}</p>
                    <p>Updated: {formatDate(exercise.updatedAt)}</p>
                  </div>
                  <div className="mt-4">
                    <Button
                      onClick={() => router.push(`/exercises/${exercise.id}`)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && data.exercises && data.exercises.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                <h3 className="font-semibold mb-2">No exercises found</h3>
                <p>Start by creating your first exercise!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
