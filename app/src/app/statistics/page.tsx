"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { ProgressPerExercise } from "@/components/ProgressPerExercise";
import { WorkoutVolumeStatistics } from "@/components/WorkoutVolumeStatistics";

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
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Statistics</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              Analyze your workout performance and progress
            </p>
          </div>

        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-none sm:max-w-md">
            <TabsTrigger value="progress" className="text-xs sm:text-sm">
              Progress
            </TabsTrigger>
            <TabsTrigger value="volume" className="text-xs sm:text-sm">
              Volume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress" className="mt-6">
            <ProgressPerExercise />
          </TabsContent>

          <TabsContent value="volume" className="mt-6">
            <WorkoutVolumeStatistics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

