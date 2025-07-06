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
