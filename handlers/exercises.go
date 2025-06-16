package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dtos"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

func GetExercises(c *fiber.Ctx) error {
	var exercises []models.Exercise
	result := database.DB.Db.Find(&exercises).Preload("records")

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(exercises)
}

func CreateExercise(c *fiber.Ctx) error {
	var exerciseDto dtos.ExerciseDto
	
	// Parse request body into DTO
	if err := c.BodyParser(&exerciseDto); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	// Validate the DTO using shared validation utility
	if errors := utils.ValidateStruct(exerciseDto); len(errors) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	// Create model from validated DTO
	exercise := models.Exercise{
		Name: exerciseDto.Name,
	}

	// Save to database
	result := database.DB.Db.Create(&exercise)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(exercise)
}
