'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useExerciseQuery } from '@/lib/queries/useExerciseQuery';
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Exercise Details</h1>
            <p className="text-gray-600 mt-2">
              {exercise ? `Viewing exercise: ${exercise.name}` : `Loading exercise ${resolvedParams.id}...`}
            </p>
          </div>
          <div className="space-x-4">
            <Button 
              onClick={() => refetch()}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button 
              onClick={() => router.push('/exercises')}
              variant="outline"
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
                    onClick={() => router.push('/exercises')}
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
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {exercise.images && exercise.images.length > 0 ? (
                        <div>
                          <p className="font-medium">Images:</p>
                          <div className="grid gap-2 mt-2">
                            {exercise.images.map((image, index) => (
                              <Image
                                key={index}
                                src={image} 
                                alt={`${exercise.name} image ${index + 1}`}
                                width={400}
                                height={300}
                                className="w-full max-w-sm rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p>No images available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

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