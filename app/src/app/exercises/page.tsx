"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useExercisesQuery } from "@/lib/queries/useExercisesQuery";
import { useCreateExerciseMutation } from "@/lib/queries/useCreateExerciseMutation";
import { CreateExerciseForm } from "@/components/CreateExerciseForm";
import { formatDate } from "@/lib/utils/date";

function ExercisesContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useExercisesQuery();
  const { createExercise, isLoading: isCreating } = useCreateExerciseMutation();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get search term from URL or default to empty string
  const initialSearchTerm = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);

  // Filter exercises based on search term
  const filteredExercises = useMemo(() => {
    if (!data?.exercises) return [];

    if (!searchTerm.trim()) {
      return data.exercises;
    }

    return data.exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [data?.exercises, searchTerm]);

  // Update URL when search term changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) {
      params.set("search", searchTerm);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(`/exercises${newUrl}`, { scroll: false });
  }, [searchTerm, router]);

  // Restore scroll position when returning from exercise detail
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('exercisesScrollPosition');
    if (savedScrollPosition && data && filteredExercises.length > 0) {
      const scrollTop = parseInt(savedScrollPosition);
      setTimeout(() => {
        window.scrollTo(0, scrollTop);
        sessionStorage.removeItem('exercisesScrollPosition');
      }, 50);
    }
  }, [data, filteredExercises.length]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleCreateExercise = async (data: {
    name: string;
    primaryMuscles: string[];
    instructions: string;
  }) => {
    await createExercise(data);
    refetch(); // Refresh the exercises list
  };

  // Store scroll position before navigating to exercise detail
  const handleExerciseClick = (exerciseId: number) => {
    sessionStorage.setItem('exercisesScrollPosition', window.scrollY.toString());
    router.push(`/exercises/${exerciseId}`);
  };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Exercises</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              {data
                ? `${filteredExercises.length} of ${data.count} exercise${filteredExercises.length !== 1 ? "s" : ""} ${searchTerm.trim() ? "matching your search" : "found"}`
                : "Loading exercises..."}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            <CreateExerciseForm
              onSubmit={handleCreateExercise}
              isLoading={isCreating}
            />
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

        {/* Search Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Exercises</CardTitle>
            <CardDescription>Search exercises by name</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1"
              />
              {searchTerm && (
                <Button onClick={clearSearch} variant="outline" size="sm">
                  Clear
                </Button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-2">
                Showing {filteredExercises.length} exercise
                {filteredExercises.length !== 1 ? "s" : ""} matching{" "}
                {searchTerm}
              </p>
            )}
          </CardContent>
        </Card>

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

        {data && filteredExercises.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
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
                      onClick={() => handleExerciseClick(exercise.id)}
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

        {data && filteredExercises.length === 0 && searchTerm && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                <h3 className="font-semibold mb-2">No exercises found</h3>
                <p>No exercises match your search {searchTerm}</p>
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  Clear Search
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {data &&
          data.exercises &&
          data.exercises.length === 0 &&
          !searchTerm && (
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

function ExercisesLoadingFallback() {
  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg text-gray-600">Loading exercises...</div>
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <Suspense fallback={<ExercisesLoadingFallback />}>
      <ExercisesContent />
    </Suspense>
  );
}
