package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dtos"
	"github.com/nagy135/fitness-tracker/handlers/utils"
	"github.com/nagy135/fitness-tracker/models"
	utilsValidation "github.com/nagy135/fitness-tracker/utils"
)

func GetRecords(c *fiber.Ctx) error {
	userId, err := utils.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	var records []models.Record
	result := database.DB.Db.Where("user_id = ?", userId).Find(&records)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(records)
}

func CreateRecord(c *fiber.Ctx) error {
	userId, err := utils.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var recordDto dtos.RecordDto
	if err := c.BodyParser(&recordDto); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utilsValidation.ValidateStruct(recordDto); len(errors) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	record := models.Record{
		Weight:     recordDto.Weight,
		Feeling:    models.Feeling(recordDto.Feeling),
		ExerciseID: recordDto.ExerciseID,
		UserID:     userId,
	}

	result := database.DB.Db.Create(&record)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(record)
}
