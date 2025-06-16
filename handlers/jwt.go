package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dtos"
	"github.com/nagy135/fitness-tracker/models"
	"golang.org/x/crypto/bcrypt"
)

const TOKEN_VALIDITY = time.Hour * 72

func Login(c *fiber.Ctx) error {
	var body dtos.LoginDto
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	var user models.User

	result := database.DB.Db.Where("name = ?", body.Name).First(&user)
	if result.Error != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Pass), []byte(body.Pass))
	if err != nil {
		return c.SendStatus(fiber.StatusUnauthorized)
	}

	claims := jwt.MapClaims{
		"name":  user.Name,
		"admin": true,
		"exp":   time.Now().Add(TOKEN_VALIDITY).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte("secret"))
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{"token": t})
}
