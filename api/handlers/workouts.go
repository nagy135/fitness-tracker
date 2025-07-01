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

	var stats []WorkoutStats

	// Get weight stats from actual exercise records, and include workout names where they exist
	result := h.db.DB.Raw(`
		WITH daily_weights AS (
			SELECT 
				DATE(COALESCE(r.date, r.created_at)) as date,
				SUM(s.weight * s.reps) as total_weight
			FROM records r
			JOIN sets s ON s.record_id = r.id
			WHERE r.user_id = ?
			GROUP BY DATE(COALESCE(r.date, r.created_at))
		),
		daily_workouts AS (
			SELECT 
				DATE(COALESCE(w.date, w.created_at)) as date,
				w.label as workout_name
			FROM workouts w
			WHERE w.user_id = ?
		)
		SELECT 
			COALESCE(dw.date, wo.date) as date,
			COALESCE(dw.total_weight, 0) as total_weight,
			COALESCE(wo.workout_name, 'Workout') as workout_name
		FROM daily_weights dw
		FULL OUTER JOIN daily_workouts wo ON dw.date = wo.date
		ORDER BY date DESC
	`, userID, userID).Scan(&stats)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"stats": stats,
		"count": len(stats),
	})
}
