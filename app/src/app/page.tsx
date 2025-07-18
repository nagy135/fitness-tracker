"use client";

import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

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
            <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Welcome to Fitness Tracker</h1>
            <p className="text-gray-600 mb-8 text-sm sm:text-base">
              Use the navigation bar above to access different sections of your fitness tracking app.
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Navigate to:
              </p>
              <ul className="mt-2 text-sm text-gray-500 space-y-1">
                <li>• <strong>Exercises</strong> - Browse and manage your exercise library</li>
                <li>• <strong>Records</strong> - Track your personal records and achievements</li>
                <li>• <strong>Workouts</strong> - Plan and log your workout sessions</li>
                <li>• <strong>Statistics</strong> - View your progress and analytics</li>
              </ul>
            </div>
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
