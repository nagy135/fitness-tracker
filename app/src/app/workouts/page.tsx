"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { WorkoutsAPI } from "@/lib/api/workouts";
import { Workout, WorkoutStats } from "@/lib/types/workout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import "react-day-picker/style.css";

interface WorkoutFormData {
  label: string;
  date: string;
}

export default function WorkoutsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WorkoutFormData>({
    label: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [workoutsResponse, statsResponse] = await Promise.all([
        WorkoutsAPI.getAllWorkouts(),
        WorkoutsAPI.getWorkoutStats(),
      ]);
      setWorkouts(workoutsResponse.workouts);
      setWorkoutStats(statsResponse.stats);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await WorkoutsAPI.createWorkout(formData);
      setFormData({ label: "", date: format(new Date(), "yyyy-MM-dd") });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error("Error creating workout:", error);
    }
  };

  const getWorkoutForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return workouts?.find((workout) => {
      const workoutDate = workout.date
        ? format(parseISO(workout.date), "yyyy-MM-dd")
        : format(parseISO(workout.createdAt), "yyyy-MM-dd");
      return workoutDate === dateStr;
    });
  };

  const getStatsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return workoutStats?.find((stat) => {
      // Extract date part from ISO format (e.g., "2025-07-02T00:00:00Z" -> "2025-07-02")
      const statDateStr = stat.date.split("T")[0];
      return statDateStr === dateStr;
    });
  };

  const getWorkoutDays = () => {
    return workouts.map((workout) => {
      const dateStr = workout.date || workout.createdAt;
      return parseISO(dateStr.split("T")[0]);
    });
  };

  const selectedDateWorkout = selectedDate
    ? getWorkoutForDate(selectedDate)
    : null;
  const selectedDateStats = selectedDate ? getStatsForDate(selectedDate) : null;

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading workouts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Workouts</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base sm:mt-2">
              {workouts.length > 0
                ? `${workouts.length} workout${workouts.length !== 1 ? "s" : ""} found`
                : "Track your workout calendar"}
            </p>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            Back to Home
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Workout Calendar</CardTitle>
              <CardDescription>
                Click on a date to view or add workouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="calendar-container">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    workout: getWorkoutDays(),
                  }}
                  modifiersStyles={{
                    workout: {
                      backgroundColor: "#dcfce7",
                      border: "2px solid #16a34a",
                      borderRadius: "6px",
                    },
                  }}
                  className="w-full"
                />
              </div>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded"></div>
                  <span>Workout Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-700 rounded text-white text-xs flex items-center justify-center font-bold">
                    kg
                  </div>
                  <span>Total Weight Lifted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Date Info */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate
                    ? format(selectedDate, "MMMM d, yyyy")
                    : "Select a date"}
                </CardTitle>
                <CardDescription>
                  {selectedDateWorkout ? "Workout Day" : "No workout recorded"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDate && selectedDateWorkout ? (
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm text-gray-600">Workout:</span>
                      <div className="font-semibold text-lg">
                        {selectedDateWorkout.label}
                      </div>
                    </div>
                    {selectedDateStats && selectedDateStats.totalWeight > 0 ? (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="text-sm text-green-700 font-medium">
                          Total Weight Lifted
                        </div>
                        <div className="text-3xl font-bold text-green-900">
                          {Math.round(selectedDateStats.totalWeight)}kg
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          Great workout! 💪
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm text-gray-600">
                          No weight data recorded
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Add exercises with sets to see total weight lifted
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedDate ? (
                  <Button
                    onClick={() => {
                      setFormData({
                        label: "",
                        date: format(selectedDate, "yyyy-MM-dd"),
                      });
                      setShowForm(true);
                    }}
                    className="w-full"
                  >
                    Add Workout
                  </Button>
                ) : (
                  <p className="text-gray-500">
                    Select a date to view or add workouts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Workout Form */}
            {showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add Workout</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="label">Workout Name</Label>
                      <Input
                        id="label"
                        value={formData.label}
                        onChange={(e) =>
                          setFormData({ ...formData, label: e.target.value })
                        }
                        placeholder="e.g., Push Day, Leg Day"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Recent Workouts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workouts.slice(0, 5).map((workout) => {
                    const workoutDate = workout.date || workout.createdAt;
                    const workoutDateStr = format(
                      parseISO(workoutDate),
                      "yyyy-MM-dd",
                    );
                    const stats = workoutStats.find((stat) => {
                      // Extract date part from ISO format (e.g., "2025-07-02T00:00:00Z" -> "2025-07-02")
                      const statDateStr = stat.date.split("T")[0];
                      return statDateStr === workoutDateStr;
                    });

                    return (
                      <div
                        key={workout.id}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{workout.label}</div>
                          <div className="text-sm text-gray-500">
                            {format(parseISO(workoutDate), "MMM d, yyyy")}
                          </div>
                        </div>
                        <div className="text-right">
                          {stats && stats.totalWeight > 0 ? (
                            <div className="text-lg font-bold text-green-700">
                              {Math.round(stats.totalWeight)}kg
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400">No data</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Stats Summary */}
          {workoutStats?.length > 0 && (
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Workout Stats Summary</CardTitle>
                <CardDescription>Total weight lifted by day</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {workoutStats
                    .filter((stat) => stat.totalWeight > 0)
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime(),
                    )
                    .slice(0, 12)
                    .map((stat) => (
                      <div
                        key={stat.date}
                        className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200"
                      >
                        <div className="text-sm font-medium text-green-800">
                          {format(parseISO(stat.date), "MMM d")}
                        </div>
                        <div className="text-lg font-bold text-green-900">
                          {Math.round(stat.totalWeight)}kg
                        </div>
                        <div className="text-xs text-green-600">
                          {stat.workoutName}
                        </div>
                      </div>
                    ))}
                </div>
                {workoutStats.filter((stat) => stat.totalWeight > 0).length ===
                  0 && (
                  <div className="text-center text-gray-500 py-4">
                    <span>
                      No weight data available yet. Start recording your
                      workouts!
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
