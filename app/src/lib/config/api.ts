export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  ENDPOINTS: {
    EXERCISES: "/exercises",
    EXERCISE_OPTIONS: "/exercises/options",
    EXERCISE_BY_ID: (id: string | number) => `/exercises/${id}`,
    LOGIN: "/login",
    RECORDS: "/records",
    RECORD_BY_ID: (id: string | number) => `/records/${id}`,
    RECORD_PR: (exerciseId: string | number) => `/records/pr/${exerciseId}`,
    USERS: "/users",
    ASYNC_JOBS: "/async-jobs",
    WORKOUTS: "/workouts",
    WORKOUT_STATS: "/workouts/stats",
    WORKOUT_STATS_BY_DATE: (date: string) => `/workouts/stats/${date}`,
  },
} as const;
