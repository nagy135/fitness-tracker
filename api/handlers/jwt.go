package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/dto"
	"github.com/nagy135/fitness-tracker/internal/config"
	"github.com/nagy135/fitness-tracker/models"
	"github.com/nagy135/fitness-tracker/utils"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db  *database.DBInstance
	cfg *config.Config
}

func NewAuthHandler(db *database.DBInstance, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		db:  db,
		cfg: cfg,
	}
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var loginDto dto.LoginDto
	if err := c.BodyParser(&loginDto); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cannot parse JSON",
		})
	}

	if errors := utils.ValidateStruct(loginDto); len(errors) > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   "Validation failed",
			"details": errors,
		})
	}

	var user models.User
	result := h.db.DB.Where("name = ?", loginDto.Name).First(&user)
	if result.Error != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginDto.Pass))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	claims := jwt.MapClaims{
		"sub":  user.ID,
		"name": user.Name,
		"exp":  time.Now().Add(h.cfg.JWT.Duration).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(h.cfg.JWT.Secret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.JSON(fiber.Map{
		"accessToken": tokenString,
		"user": fiber.Map{
			"id":   user.ID,
			"name": user.Name,
		},
	})
}
