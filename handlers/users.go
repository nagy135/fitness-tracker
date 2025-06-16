package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dtos"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
)

func CreateUser(c *fiber.Ctx) error {
	var userDto dtos.UserDto
	if err := c.BodyParser(&userDto); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(userDto); len(errors) > 0 {
		return c.Status(400).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	exercise := models.User{
		Name: userDto.Name,
		Pass: userDto.Pass,
	}

	result := database.DB.Db.Create(&exercise)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{
			"error": result.Error.Error(),
		})
	}

	return c.JSON(exercise)
}
