package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	db *database.DBInstance
}

func NewUserHandler(db *database.DBInstance) *UserHandler {
	return &UserHandler{db: db}
}

func (h *UserHandler) CreateUser(c *fiber.Ctx) error {
	var userDto dto.UserDto
	if err := c.BodyParser(&userDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(userDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(userDto.Pass), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	user := models.User{
		Name:     userDto.Name,
		Password: string(hashedPassword),
	}

	result := h.db.DB.Create(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(user)
}
