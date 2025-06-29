"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ProgressPerExercise } from "@/components/ProgressPerExercise";

export default function StatisticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
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
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-gray-600 mt-2">
              Analyze your workout performance and progress
            </p>
          </div>
          <Button onClick={() => router.push("/")} variant="outline">
            Back to Home
          </Button>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="volume" disabled>
              Volume
            </TabsTrigger>
            <TabsTrigger value="strength" disabled>
              Strength
            </TabsTrigger>
            <TabsTrigger value="trends" disabled>
              Trends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <ProgressPerExercise />
          </TabsContent>

          <TabsContent value="volume" className="mt-6">
            <div className="text-center text-gray-500 py-12">
              <h3 className="text-lg font-semibold mb-2">Volume Analysis</h3>
              <p>Coming soon - Track your training volume over time</p>
            </div>
          </TabsContent>

          <TabsContent value="strength" className="mt-6">
            <div className="text-center text-gray-500 py-12">
              <h3 className="text-lg font-semibold mb-2">Strength Metrics</h3>
              <p>Coming soon - Analyze your strength gains and PRs</p>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <div className="text-center text-gray-500 py-12">
              <h3 className="text-lg font-semibold mb-2">Workout Trends</h3>
              <p>Coming soon - Discover patterns in your training</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 