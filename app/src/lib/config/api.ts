export const API_CONFIG = {
  BASE_URL: "http://localhost:8080",
  ENDPOINTS: {
    EXERCISES: "/exercises",
    EXERCISE_OPTIONS: "/exercises/options",
    EXERCISE_BY_ID: (id: string | number) => `/exercises/${id}`,
    LOGIN: "/login",
    RECORDS: "/records",
    USERS: "/users",
    ASYNC_JOBS: "/async-jobs",
    WORKOUTS: "/workouts",
    WORKOUT_STATS: "/workouts/stats",
  },
} as const;
