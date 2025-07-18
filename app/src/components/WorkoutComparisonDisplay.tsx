import { useMemo, useEffect, useState } from "react";
import { WorkoutStats, DayStats } from "@/lib/types/workout";
import { WorkoutsAPI } from "@/lib/api/workouts";
import { formatDistance, parseISO } from "date-fns";

interface WorkoutComparisonDisplayProps {
  currentWorkoutName: string;
  currentTotalWeight: number;
  workoutStats: WorkoutStats[];
  currentDate: string;
}

export function WorkoutComparisonDisplay({
  currentWorkoutName,
  currentTotalWeight,
  workoutStats,
  currentDate,
}: WorkoutComparisonDisplayProps) {
  const [previousWorkoutDetails, setPreviousWorkoutDetails] =
    useState<DayStats | null>(null);
  const [loadingPreviousDetails, setLoadingPreviousDetails] = useState(false);

  // Find the previous workout with the same name
  const previousWorkout = useMemo(() => {
    if (!currentWorkoutName) {
      return null;
    }

    // Filter workouts with the same name, excluding the current date and future dates
    const sameNameWorkouts = workoutStats.filter((stat) => {
      // Check if workout names match (handle cases where multiple workouts might be combined with " + ")
      const statWorkoutNames = stat.workoutName.split(" + ");
      const currentWorkoutNames = currentWorkoutName.split(" + ");

      // Check if any workout name matches
      const hasMatchingName = statWorkoutNames.some((name) =>
        currentWorkoutNames.some(
          (currentName) => name.trim() === currentName.trim(),
        ),
      );

      // Only include workouts that are before the current date (not future dates)
      const statDate = new Date(stat.date);
      const currentDateObj = new Date(currentDate);
      const isBeforeCurrentDate = statDate < currentDateObj;

      return (
        hasMatchingName && stat.date !== currentDate && isBeforeCurrentDate
      );
    });

    // Sort by date descending and get the most recent one (closest to current date but before it)
    const sortedWorkouts = sameNameWorkouts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return sortedWorkouts.length > 0 ? sortedWorkouts[0] : null;
  }, [currentWorkoutName, workoutStats, currentDate]);

  // Fetch previous workout details when previousWorkout changes
  useEffect(() => {
    if (previousWorkout) {
      setLoadingPreviousDetails(true);
      WorkoutsAPI.getWorkoutStatsByDate(previousWorkout.date)
        .then((details) => {
          setPreviousWorkoutDetails(details);
        })
        .catch((error) => {
          console.error("Error fetching previous workout details:", error);
          setPreviousWorkoutDetails(null);
        })
        .finally(() => {
          setLoadingPreviousDetails(false);
        });
    } else {
      setPreviousWorkoutDetails(null);
    }
  }, [previousWorkout]);

  // Don't show anything if no previous workout found
  if (!previousWorkout) {
    return null;
  }

  const difference = currentTotalWeight - previousWorkout.totalWeight;

  // Determine the comparison status
  let comparisonStatus = "neutral";
  let comparisonText = "";

  if (difference > 0) {
    comparisonStatus = "improved";
    comparisonText = `+${difference.toFixed(1)}kg more`;
  } else if (difference < 0) {
    comparisonStatus = "decreased";
    comparisonText = `${Math.abs(difference).toFixed(1)}kg less`;
  } else {
    comparisonStatus = "same";
    comparisonText = "Same weight";
  }

  const getStatusColor = () => {
    switch (comparisonStatus) {
      case "improved":
        return "from-green-50 to-green-100 border-green-200";
      case "decreased":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "same":
        return "from-blue-50 to-blue-100 border-blue-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const getTextColor = () => {
    switch (comparisonStatus) {
      case "improved":
        return "text-green-700";
      case "decreased":
        return "text-yellow-700";
      case "same":
        return "text-blue-700";
      default:
        return "text-gray-700";
    }
  };

  const getValueColor = () => {
    switch (comparisonStatus) {
      case "improved":
        return "text-green-900";
      case "decreased":
        return "text-yellow-900";
      case "same":
        return "text-blue-900";
      default:
        return "text-gray-900";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSets = (setDetails: { reps: number; weight: number }[]) => {
    return setDetails.map((set) => `${set.reps}x${set.weight}kg`).join(", ");
  };

  const daysAgo = formatDistance(parseISO(previousWorkout.date), new Date(), {
    addSuffix: true,
  });

  return (
    <div
      className={`p-4 bg-gradient-to-r ${getStatusColor()} rounded-lg border`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${getTextColor()}`}>
            vs Last {currentWorkoutName}
          </span>
          <span className={`text-lg font-bold ${getValueColor()}`}>
            {comparisonText}
          </span>
        </div>

        {/* Current vs Previous Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`text-xs ${getTextColor()} opacity-75`}>
              Current
            </div>
            <div className={`text-sm font-semibold ${getValueColor()}`}>
              {Math.round(currentTotalWeight)}kg
            </div>
          </div>
          <div>
            <div className={`text-xs ${getTextColor()} opacity-75`}>
              Previous
            </div>
            <div className={`text-sm font-semibold ${getValueColor()}`}>
              {Math.round(previousWorkout.totalWeight)}kg
            </div>
          </div>
        </div>

        {/* Exercise Breakdown Comparison */}
        <div className="border-t pt-3">
          <div className={`text-xs font-medium ${getTextColor()} mb-2`}>
            Exercise Breakdown
          </div>

          {loadingPreviousDetails ? (
            <div className={`text-xs ${getTextColor()} opacity-75`}>
              Loading previous workout details...
            </div>
          ) : previousWorkoutDetails &&
            previousWorkoutDetails.exerciseDetails?.length > 0 ? (
            <div className="space-y-2">
              {previousWorkoutDetails.exerciseDetails.map((exercise, index) => (
                <div key={index} className="text-xs">
                  <span className={`font-medium ${getTextColor()}`}>
                    {exercise.exerciseName}:
                  </span>{" "}
                  <span className={`font-semibold ${getValueColor()}`}>
                    {Math.round(exercise.totalWeight)}kg
                  </span>
                  <span className={`${getTextColor()} opacity-75 ml-1`}>
                    ({formatSets(exercise.setDetails)})
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-xs ${getTextColor()} opacity-75`}>
              No exercise details available for previous workout
            </div>
          )}
        </div>

        {/* Previous workout date */}
        <div className={`text-xs ${getTextColor()} opacity-75`}>
          {`Last ${currentWorkoutName} on ${formatDate(previousWorkout.date)} (${daysAgo})`}
        </div>
      </div>
    </div>
  );
}
