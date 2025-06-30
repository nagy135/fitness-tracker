package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/internal/auth"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
	"time"
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
	result := h.db.DB.Preload("Exercise").Preload("Sets").Where("user_id = ?", userID).Find(&records)

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

	// Start a transaction
	tx := h.db.DB.Begin()

	// Create the record
	record := models.Record{
		ExerciseID: recordDto.ExerciseID,
		UserID:     userID,
	}

	// Set custom date if provided
	if recordDto.Date != nil && *recordDto.Date != "" {
		if parsedDate, err := time.Parse("2006-01-02", *recordDto.Date); err == nil {
			record.Date = &parsedDate
		}
	}

	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Create the sets
	var sets []models.Set
	for _, setDto := range recordDto.Sets {
		set := models.Set{
			Reps:     setDto.Reps,
			Weight:   setDto.Weight,
			RecordID: record.ID,
		}
		sets = append(sets, set)
	}

	if err := tx.Create(&sets).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Commit the transaction
	tx.Commit()

	// Load the complete record with relationships
	var completeRecord models.Record
	h.db.DB.Preload("Exercise").Preload("Sets").First(&completeRecord, record.ID)

	return c.Status(fiber.StatusCreated).JSON(completeRecord)
}
