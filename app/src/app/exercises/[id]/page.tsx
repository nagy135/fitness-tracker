'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseQuery } from '@/lib/queries/useExerciseQuery';
import { EditExerciseForm } from '@/components/EditExerciseForm';
import { formatDateTime } from '@/lib/utils/date';

interface ExerciseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const resolvedParams = use(params);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: exercise, isLoading, error, refetch } = useExerciseQuery(resolvedParams.id);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
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
            <h1 className="text-2xl font-bold sm:text-3xl">Exercise Details</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              {exercise ? `Viewing exercise: ${exercise.name}` : `Loading exercise ${resolvedParams.id}...`}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-4">
            {exercise && (
              <EditExerciseForm
                exercise={exercise}
                onSubmit={refetch}
                isLoading={isLoading}
              />
            )}
            <Button 
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              Back to Exercises
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="text-red-800">
                <h3 className="font-semibold mb-2">Error loading exercise</h3>
                <p>{error}</p>
                <div className="mt-4 space-x-2">
                  <Button 
                    onClick={() => refetch()}
                    variant="outline"
                    size="sm"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => router.back()}
                    variant="outline"
                    size="sm"
                  >
                    Back to List
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && !exercise && (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading exercise details...</div>
          </div>
        )}

        {exercise && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{exercise.name}</CardTitle>
                <CardDescription>
                  Exercise ID: {exercise.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {exercise.name}</p>
                      <p><span className="font-medium">ID:</span> {exercise.id}</p>
                      <p><span className="font-medium">Created:</span> {formatDateTime(exercise.createdAt)}</p>
                      <p><span className="font-medium">Updated:</span> {formatDateTime(exercise.updatedAt)}</p>
                      {exercise.totalWeightMultiplier !== 1.0 && (
                        <p>
                          <span className="font-medium">Weight Multiplier:</span>{" "}
                          <span className="text-blue-600 font-medium">
                            {exercise.totalWeightMultiplier}x (halved weight - uses pulleys)
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Primary Muscles</h3>
                    <div className="space-y-2 text-sm">
                      {exercise.primaryMuscles && exercise.primaryMuscles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {exercise.primaryMuscles.map((muscle, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No muscle groups specified</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructions Section */}
            {exercise.instructions && exercise.instructions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Instructions</CardTitle>
                  <CardDescription>How to perform this exercise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {exercise.instructions.map((instruction, index) => (
                      <div key={index} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                        <p className="text-sm leading-relaxed">{instruction}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Images Section */}
            {exercise.images && exercise.images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Exercise Images</CardTitle>
                  <CardDescription>Visual demonstration of the exercise</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {exercise.images.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={image} 
                          alt={`${exercise.name} image ${index + 1}`}
                          width={400}
                          height={300}
                          className="w-full rounded-lg border aspect-video object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Placeholder for future features */}
            <Card>
              <CardHeader>
                <CardTitle>Related Records</CardTitle>
                <CardDescription>Exercise history and performance data</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Records for this exercise will be displayed here in a future update.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 