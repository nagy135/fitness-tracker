package auth

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// GetUserIDFromToken extracts and validates the user ID from JWT token in the context
func GetUserIDFromToken(c *fiber.Ctx) (uint, error) {
	user := c.Locals("user").(*jwt.Token)
	claims := user.Claims.(jwt.MapClaims)

	subClaim, exists := claims["sub"]
	if !exists {
		return 0, errors.New("token missing user ID (sub claim)")
	}

	userID, ok := subClaim.(float64)
	if !ok {
		return 0, errors.New("invalid user ID format in token")
	}

	return uint(userID), nil
} 