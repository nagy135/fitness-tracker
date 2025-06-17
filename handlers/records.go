package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/internal/auth"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

type RecordHandler struct {
	db *database.DBInstance
}

func NewRecordHandler(db *database.DBInstance) *RecordHandler {
	return &RecordHandler{db: db}
}

func (h *RecordHandler) GetRecords(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var records []models.Record
	result := h.db.DB.Preload("Exercise").Where("user_id = ?", userID).Find(&records)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"records": records,
		"count":   len(records),
	})
}

func (h *RecordHandler) CreateRecord(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	var recordDto dto.RecordDto
	if err := c.BodyParser(&recordDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(recordDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	record := models.Record{
		Weight:     recordDto.Weight,
		Feeling:    models.Feeling(recordDto.Feeling),
		ExerciseID: recordDto.ExerciseID,
		UserID:     userID,
	}

	result := h.db.DB.Create(&record)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(record)
}
