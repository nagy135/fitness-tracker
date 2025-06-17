package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

type ExerciseHandler struct {
	db *database.DBInstance
}

func NewExerciseHandler(db *database.DBInstance) *ExerciseHandler {
	return &ExerciseHandler{db: db}
}

func (h *ExerciseHandler) GetExercises(c *fiber.Ctx) error {
	var exercises []models.Exercise
	result := h.db.DB.Preload("Records").Find(&exercises)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"exercises": exercises,
		"count":     len(exercises),
	})
}

func (h *ExerciseHandler) CreateExercise(c *fiber.Ctx) error {
	var exerciseDto dto.ExerciseDto
	if err := c.BodyParser(&exerciseDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(exerciseDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	exercise := models.Exercise{
		Name: exerciseDto.Name,
	}

	result := h.db.DB.Create(&exercise)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(exercise)
}
