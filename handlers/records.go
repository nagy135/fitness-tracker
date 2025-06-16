package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/models"
)

func GetRecords(c *fiber.Ctx) error {
	var records []models.Record
	result := database.DB.Db.Find(&records)

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(records)
}

func CreateRecord(c *fiber.Ctx) error {
	var record models.Record
	if err := c.BodyParser(&record); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	database.DB.Db.Create(&record)

	return c.JSON(record)
}
