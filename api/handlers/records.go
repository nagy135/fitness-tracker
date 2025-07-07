package handlers

import (
	"fmt"
	"time"

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

func (h *RecordHandler) UpdateRecord(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get record ID from URL params
	recordID := c.Params("id")
	if recordID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Record ID is required",
		})
	}

	var updateRecordDto dto.UpdateRecordDto
	if err := c.BodyParser(&updateRecordDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(updateRecordDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	// Check if record exists and belongs to the user
	var existingRecord models.Record
	result := h.db.DB.Where("id = ? AND user_id = ?", recordID, userID).First(&existingRecord)
	if result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Record not found or doesn't belong to you",
		})
	}

	// Start a transaction
	tx := h.db.DB.Begin()

	// Delete existing sets
	if err := tx.Where("record_id = ?", recordID).Delete(&models.Set{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete existing sets",
		})
	}

	// Update the record
	existingRecord.ExerciseID = updateRecordDto.ExerciseID

	// Set custom date if provided
	if updateRecordDto.Date != nil && *updateRecordDto.Date != "" {
		if parsedDate, err := time.Parse("2006-01-02", *updateRecordDto.Date); err == nil {
			existingRecord.Date = &parsedDate
		}
	} else {
		existingRecord.Date = nil
	}

	if err := tx.Save(&existingRecord).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update record",
		})
	}

	// Create the new sets
	var sets []models.Set
	for _, setDto := range updateRecordDto.Sets {
		set := models.Set{
			Reps:     setDto.Reps,
			Weight:   setDto.Weight,
			RecordID: existingRecord.ID,
		}
		sets = append(sets, set)
	}

	if err := tx.Create(&sets).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create new sets",
		})
	}

	// Commit the transaction
	tx.Commit()

	// Load the complete record with relationships
	var completeRecord models.Record
	h.db.DB.Preload("Exercise").Preload("Sets").First(&completeRecord, existingRecord.ID)

	return c.JSON(completeRecord)
}

func (h *RecordHandler) GetExercisePR(c *fiber.Ctx) error {
	userID, err := auth.GetUserIDFromToken(c)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Get exercise ID from URL params
	exerciseIDParam := c.Params("exerciseId")
	if exerciseIDParam == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Exercise ID is required",
		})
	}

	// Parse exercise ID
	exerciseID := 0
	if _, err := fmt.Sscanf(exerciseIDParam, "%d", &exerciseID); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid exercise ID",
		})
	}

	type PRResponse struct {
		MaxTotalWeight float32 `json:"maxTotalWeight"`
		Date           string  `json:"date"`
		RecordID       uint    `json:"recordId"`
	}

	// Get all records for this exercise and user
	var records []models.Record
	result := h.db.DB.Preload("Sets").Where("user_id = ? AND exercise_id = ?", userID, exerciseID).Find(&records)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	if len(records) == 0 {
		return c.JSON(fiber.Map{
			"pr": nil,
		})
	}

	// Group records by date and calculate total weight per day
	dailyTotals := make(map[string]struct {
		totalWeight float32
		recordID    uint
	})

	for _, record := range records {
		// Use record date if available, otherwise use created_at
		var recordDate time.Time
		if record.Date != nil {
			recordDate = *record.Date
		} else {
			recordDate = record.CreatedAt
		}

		dateKey := recordDate.Format("2006-01-02")

		// Calculate total weight for this record
		var recordTotalWeight float32
		for _, set := range record.Sets {
			recordTotalWeight += set.Weight * float32(set.Reps)
		}

		// Add to daily total
		if existing, exists := dailyTotals[dateKey]; exists {
			dailyTotals[dateKey] = struct {
				totalWeight float32
				recordID    uint
			}{
				totalWeight: existing.totalWeight + recordTotalWeight,
				recordID:    record.ID, // Keep the latest record ID for this date
			}
		} else {
			dailyTotals[dateKey] = struct {
				totalWeight float32
				recordID    uint
			}{
				totalWeight: recordTotalWeight,
				recordID:    record.ID,
			}
		}
	}

	// Find the maximum total weight
	var maxPR *PRResponse
	for date, data := range dailyTotals {
		if maxPR == nil || data.totalWeight > maxPR.MaxTotalWeight {
			maxPR = &PRResponse{
				MaxTotalWeight: data.totalWeight,
				Date:           date,
				RecordID:       data.recordID,
			}
		}
	}

	return c.JSON(fiber.Map{
		"pr": maxPR,
	})
}
