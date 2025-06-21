'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useExercisesQuery } from '@/lib/queries/useExercisesQuery';

export default function ExercisesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useExercisesQuery();
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
            <h1 className="text-3xl font-bold">Exercises</h1>
            <p className="text-gray-600 mt-2">
              {data ? `${data.count} exercise${data.count !== 1 ? 's' : ''} found` : 'Loading exercises...'}
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
              onClick={() => router.push('/')}
              variant="outline"
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
              <Card key={exercise.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  <CardDescription>
                    Exercise ID: {exercise.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Created: {new Date(exercise.created_at).toLocaleDateString()}</p>
                    <p>Updated: {new Date(exercise.updated_at).toLocaleDateString()}</p>
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