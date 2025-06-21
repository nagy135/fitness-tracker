package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

type AsyncJobHandler struct {
	db     *database.DBInstance
	worker *AsyncWorker
}

func NewAsyncJobHandler(db *database.DBInstance) *AsyncJobHandler {
	return &AsyncJobHandler{
		db:     db,
		worker: NewAsyncWorker(db),
	}
}

func (h *AsyncJobHandler) GetAsyncJobs(c *fiber.Ctx) error {
	var asyncJobs []models.AsyncJob
	result := h.db.DB.Find(&asyncJobs)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"asyncJobs": asyncJobs,
		"count":     len(asyncJobs),
	})
}

func (h *AsyncJobHandler) CreateAsyncJob(c *fiber.Ctx) error {
	var asyncJobDto dto.AsyncJobDto
	if err := c.BodyParser(&asyncJobDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(asyncJobDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	asyncJob := models.AsyncJob{
		Type:   asyncJobDto.Type,
		Status: models.Pending,
	}

	result := h.db.DB.Create(&asyncJob)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	switch asyncJobDto.Type {
	case models.FetchExercises:
		go h.worker.FetchExercises(asyncJob.ID)
	}

	return c.Status(fiber.StatusCreated).JSON(asyncJob)
}
