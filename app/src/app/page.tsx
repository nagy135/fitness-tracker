"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Fitness Tracker</h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">Welcome back!</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => router.push("/exercises")}
              className="w-full"
              size="lg"
            >
              Exercises
            </Button>
            <Button
              onClick={() => router.push("/records")}
              className="w-full"
              size="lg"
            >
              Records
            </Button>
            <Button
              onClick={() => router.push("/workouts")}
              className="w-full"
              size="lg"
            >
              Workouts
            </Button>
            <Button
              onClick={() => router.push("/statistics")}
              className="w-full"
              size="lg"
            >
              Statistics
            </Button>

            <Button onClick={logout} variant="outline" className="w-full">
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Fitness Tracker</h1>
          <p className="text-gray-600 text-sm sm:text-base">Please log in to continue</p>
        </div>
        <LoginForm onSuccess={() => window.location.reload()} />
      </div>
    </div>
  );
}
