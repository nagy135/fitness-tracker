package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/internal/auth"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

type WorkoutHandler struct {
	db *database.DBInstance
}

func NewWorkoutHandler(db *database.DBInstance) *WorkoutHandler {
	return &WorkoutHandler{db: db}
}

func (h *WorkoutHandler) GetWorkouts(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var workouts []models.Workout
	result := h.db.DB.Where("user_id = ?", userID).Find(&workouts)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"workouts": workouts,
		"count":    len(workouts),
	})
}

func (h *WorkoutHandler) CreateWorkout(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var workoutDto dto.WorkoutDto
	if err := c.BodyParser(&workoutDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(workoutDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	workout := models.Workout{
		UserID: userID,
		Label:  workoutDto.Label,
	}

	// Set custom date if provided
	if workoutDto.Date != nil && *workoutDto.Date != "" {
		if parsedDate, err := time.Parse("2006-01-02", *workoutDto.Date); err == nil {
			workout.Date = &parsedDate
		}
	}

	result := h.db.DB.Create(&workout)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(workout)
}

func (h *WorkoutHandler) GetWorkoutStats(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	type WorkoutStats struct {
		Date        string  `json:"date"`
		TotalWeight float32 `json:"totalWeight"`
		WorkoutName string  `json:"workoutName"`
	}

	// Get all records with their sets for the user
	var records []models.Record
	result := h.db.DB.Preload("Sets").Where("user_id = ?", userID).Find(&records)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Get all workouts for the user
	var workouts []models.Workout
	result = h.db.DB.Where("user_id = ?", userID).Find(&workouts)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Calculate daily weights from records
	dailyWeights := make(map[string]float32)
	for _, record := range records {
		// Use record date if available, otherwise use created_at
		var date time.Time
		if record.Date != nil {
			date = *record.Date
		} else {
			date = record.CreatedAt
		}

		dateStr := date.Format("2006-01-02")

		// Calculate total weight for this record (sum of all sets)
		var recordWeight float32
		for _, set := range record.Sets {
			recordWeight += set.Weight * float32(set.Reps)
		}

		// Add to daily total
		dailyWeights[dateStr] += recordWeight
	}

	// Create workout name lookup by date
	workoutsByDate := make(map[string]string)
	for _, workout := range workouts {
		// Use workout date if available, otherwise use created_at
		var date time.Time
		if workout.Date != nil {
			date = *workout.Date
		} else {
			date = workout.CreatedAt
		}

		dateStr := date.Format("2006-01-02")

		// If multiple workouts on same day, concatenate names
		if existing, exists := workoutsByDate[dateStr]; exists {
			workoutsByDate[dateStr] = existing + " + " + workout.Label
		} else {
			workoutsByDate[dateStr] = workout.Label
		}
	}

	// Combine data and create stats
	var stats []WorkoutStats

	// Get all unique dates from both maps
	dateSet := make(map[string]bool)
	for date := range dailyWeights {
		dateSet[date] = true
	}
	for date := range workoutsByDate {
		dateSet[date] = true
	}

	// Create stats for each date
	for date := range dateSet {
		stat := WorkoutStats{
			Date:        date,
			TotalWeight: dailyWeights[date], // defaults to 0 if not found
			WorkoutName: workoutsByDate[date],
		}

		// If no workout name, use default
		if stat.WorkoutName == "" {
			stat.WorkoutName = "Workout"
		}

		stats = append(stats, stat)
	}

	// Sort by date descending
	for i := 0; i < len(stats); i++ {
		for j := i + 1; j < len(stats); j++ {
			if stats[i].Date < stats[j].Date {
				stats[i], stats[j] = stats[j], stats[i]
			}
		}
	}

	return c.JSON(fiber.Map{
		"stats": stats,
		"count": len(stats),
	})
}

func (h *WorkoutHandler) GetWorkoutStatsByDate(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get date from URL params
	dateParam := c.Params("date")
	if dateParam == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Date parameter is required",
		})
	}

	// Validate the date format
	_, err = time.Parse("2006-01-02", dateParam)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid date format. Use YYYY-MM-DD",
		})
	}

	type SetDetail struct {
		Reps   int     `json:"reps"`
		Weight float32 `json:"weight"`
	}

	type ExerciseStats struct {
		ExerciseName string      `json:"exerciseName"`
		TotalWeight  float32     `json:"totalWeight"`
		SetDetails   []SetDetail `json:"setDetails"`
	}

	type DayStats struct {
		Date            string          `json:"date"`
		TotalWeight     float32         `json:"totalWeight"`
		WorkoutName     string          `json:"workoutName"`
		ExerciseDetails []ExerciseStats `json:"exerciseDetails"`
	}

	// Get all records for this specific date with their sets and exercise info
	var records []models.Record
	result := h.db.DB.Preload("Sets").Preload("Exercise").Where("user_id = ?", userID).Find(&records)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Get workout for this date
	var workouts []models.Workout
	result = h.db.DB.Where("user_id = ?", userID).Find(&workouts)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Filter records for the specific date and calculate exercise totals
	exerciseWeights := make(map[string]float32)
	exerciseSets := make(map[string][]SetDetail)
	var totalWeight float32

	for _, record := range records {
		// Use record date if available, otherwise use created_at
		var recordDate time.Time
		if record.Date != nil {
			recordDate = *record.Date
		} else {
			recordDate = record.CreatedAt
		}

		// Check if this record is from the target date
		if recordDate.Format("2006-01-02") == dateParam {
			// Calculate total weight for this record and collect set details
			var recordWeight float32
			for _, set := range record.Sets {
				recordWeight += set.Weight * float32(set.Reps)
				// Add set details for this exercise
				exerciseSets[record.Exercise.Name] = append(exerciseSets[record.Exercise.Name], SetDetail{
					Reps:   set.Reps,
					Weight: set.Weight,
				})
			}

			// Add to exercise total
			exerciseWeights[record.Exercise.Name] += recordWeight
			totalWeight += recordWeight
		}
	}

	// Find workout name for this date
	var workoutName string
	for _, workout := range workouts {
		var workoutDate time.Time
		if workout.Date != nil {
			workoutDate = *workout.Date
		} else {
			workoutDate = workout.CreatedAt
		}

		if workoutDate.Format("2006-01-02") == dateParam {
			if workoutName == "" {
				workoutName = workout.Label
			} else {
				workoutName = workoutName + " + " + workout.Label
			}
		}
	}

	if workoutName == "" {
		workoutName = "Workout"
	}

	// Convert exercise weights map to slice
	var exerciseDetails []ExerciseStats
	for exerciseName, weight := range exerciseWeights {
		exerciseDetails = append(exerciseDetails, ExerciseStats{
			ExerciseName: exerciseName,
			TotalWeight:  weight,
			SetDetails:   exerciseSets[exerciseName],
		})
	}

	// Sort exercise details by weight descending
	for i := 0; i < len(exerciseDetails); i++ {
		for j := i + 1; j < len(exerciseDetails); j++ {
			if exerciseDetails[i].TotalWeight < exerciseDetails[j].TotalWeight {
				exerciseDetails[i], exerciseDetails[j] = exerciseDetails[j], exerciseDetails[i]
			}
		}
	}

	dayStats := DayStats{
		Date:            dateParam,
		TotalWeight:     totalWeight,
		WorkoutName:     workoutName,
		ExerciseDetails: exerciseDetails,
	}

	return c.JSON(dayStats)
}
