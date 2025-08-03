package handlers

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/internal/config"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

type ExerciseHandler struct {
	db  *database.DBInstance
	cfg *config.Config
}

func NewExerciseHandler(db *database.DBInstance, cfg *config.Config) *ExerciseHandler {
	return &ExerciseHandler{db: db, cfg: cfg}
}

// transformImageURLs converts relative image paths to full URLs
func (h *ExerciseHandler) transformImageURLs(exercise *models.Exercise) {
	if len(exercise.Images) > 0 {
		fullImageURLs := make([]string, len(exercise.Images))
		for i, imagePath := range exercise.Images {
			fullImageURLs[i] = h.cfg.Server.BaseURL + imagePath
		}
		exercise.Images = fullImageURLs
	}
}

func (h *ExerciseHandler) GetExercises(c *fiber.Ctx) error {
	var exercises []models.Exercise
	result := h.db.DB.Find(&exercises)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Transform relative image URLs to full URLs
	for i := range exercises {
		h.transformImageURLs(&exercises[i])
	}

	return c.JSON(fiber.Map{
		"exercises": exercises,
		"count":     len(exercises),
	})
}

func (h *ExerciseHandler) GetExercise(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Exercise ID is required",
		})
	}

	var exercise models.Exercise
	result := h.db.DB.First(&exercise, id)

	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Exercise not found",
		})
	}

	// Transform relative image URLs to full URLs
	h.transformImageURLs(&exercise)

	return c.JSON(exercise)
}

func (h *ExerciseHandler) GetExerciseOptions(c *fiber.Ctx) error {
	var exercises []models.Exercise
	result := h.db.DB.Select("id, name").Find(&exercises)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Create lightweight response with just ID and name
	options := make([]fiber.Map, len(exercises))
	for i, exercise := range exercises {
		options[i] = fiber.Map{
			"id":   exercise.ID,
			"name": exercise.Name,
		}
	}

	return c.JSON(fiber.Map{
		"exercises": options,
		"count":     len(options),
	})
}

func (h *ExerciseHandler) CreateExercise(c *fiber.Ctx) error {
	var createExerciseDto dto.CreateExerciseDto
	if err := c.BodyParser(&createExerciseDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(createExerciseDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	// Convert arrays to JSON strings for database storage
	primaryMusclesJSON, err := json.Marshal(createExerciseDto.PrimaryMuscles)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process primary muscles",
		})
	}
	primaryMusclesStr := string(primaryMusclesJSON)

	// Convert single instruction string to array for consistency
	instructionsArray := []string{createExerciseDto.Instructions}
	instructionsJSON, err := json.Marshal(instructionsArray)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to process instructions",
		})
	}
	instructionsStr := string(instructionsJSON)

	// Set default totalWeightMultiplier if not provided
	totalWeightMultiplier := float32(1.0)
	if createExerciseDto.TotalWeightMultiplier != nil {
		totalWeightMultiplier = *createExerciseDto.TotalWeightMultiplier
	}

	// Create exercise with the new fields
	exercise := models.Exercise{
		Name:                 createExerciseDto.Name,
		TotalWeightMultiplier: totalWeightMultiplier,
		PrimaryMusclesDB:     &primaryMusclesStr,
		InstructionsDB:       &instructionsStr,
	}

	result := h.db.DB.Create(&exercise)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Load the complete exercise with the arrays populated
	var completeExercise models.Exercise
	h.db.DB.First(&completeExercise, exercise.ID)
	h.transformImageURLs(&completeExercise)

	return c.Status(fiber.StatusCreated).JSON(completeExercise)
}

func (h *ExerciseHandler) UpdateExercise(c *fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Exercise ID is required",
		})
	}

	var updateExerciseDto dto.UpdateExerciseDto
	if err := c.BodyParser(&updateExerciseDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(updateExerciseDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	// Check if exercise exists
	var exercise models.Exercise
	result := h.db.DB.First(&exercise, id)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Exercise not found",
		})
	}

	// Update fields if provided
	updates := make(map[string]interface{})

	if updateExerciseDto.Name != nil {
		updates["name"] = *updateExerciseDto.Name
	}

	if updateExerciseDto.TotalWeightMultiplier != nil {
		updates["total_weight_multiplier"] = *updateExerciseDto.TotalWeightMultiplier
	}

	if updateExerciseDto.Force != nil {
		updates["force"] = *updateExerciseDto.Force
	}

	if updateExerciseDto.Level != nil {
		updates["level"] = *updateExerciseDto.Level
	}

	if updateExerciseDto.Mechanic != nil {
		updates["mechanic"] = *updateExerciseDto.Mechanic
	}

	if updateExerciseDto.Equipment != nil {
		updates["equipment"] = *updateExerciseDto.Equipment
	}

	if updateExerciseDto.Category != nil {
		updates["category"] = *updateExerciseDto.Category
	}

	// Handle array fields
	if updateExerciseDto.PrimaryMuscles != nil {
		primaryMusclesJSON, err := json.Marshal(updateExerciseDto.PrimaryMuscles)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process primary muscles",
			})
		}
		updates["primary_muscles"] = string(primaryMusclesJSON)
	}

	if updateExerciseDto.SecondaryMuscles != nil {
		secondaryMusclesJSON, err := json.Marshal(updateExerciseDto.SecondaryMuscles)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process secondary muscles",
			})
		}
		updates["secondary_muscles"] = string(secondaryMusclesJSON)
	}

	if updateExerciseDto.Instructions != nil {
		instructionsJSON, err := json.Marshal(updateExerciseDto.Instructions)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process instructions",
			})
		}
		updates["instructions"] = string(instructionsJSON)
	}

	if updateExerciseDto.Images != nil {
		imagesJSON, err := json.Marshal(updateExerciseDto.Images)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to process images",
			})
		}
		updates["images"] = string(imagesJSON)
	}

	// Update the exercise
	result = h.db.DB.Model(&exercise).Updates(updates)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	// Load the updated exercise with arrays populated
	var updatedExercise models.Exercise
	h.db.DB.First(&updatedExercise, id)
	h.transformImageURLs(&updatedExercise)

	return c.JSON(updatedExercise)
}
