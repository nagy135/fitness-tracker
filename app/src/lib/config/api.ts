export const API_CONFIG = {
  BASE_URL: "https://fit-api.infiniter.tech",
  ENDPOINTS: {
    EXERCISES: "/exercises",
    EXERCISE_OPTIONS: "/exercises/options",
    EXERCISE_BY_ID: (id: string | number) => `/exercises/${id}`,
    LOGIN: "/login",
    RECORDS: "/records",
    USERS: "/users",
    ASYNC_JOBS: "/async-jobs",
  },
} as const;

