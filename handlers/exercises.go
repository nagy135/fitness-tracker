package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/models"
)

func GetExercises(c *fiber.Ctx) error {
	var exercises []models.Exercise
	result := database.DB.Db.Find(&exercises)
	
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}
	
	return c.JSON(fiber.Map{
		"exercises": exercises,
	})
}

func CreateExercise(c *fiber.Ctx) error {
	var exercise models.Exercise
	if err := c.BodyParser(&exercise); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	database.DB.Db.Create(&exercise)

	return c.JSON(exercise)
}
