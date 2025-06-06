package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
)

func main() {
	app := fiber.New()

	database.ConnectDb()
	setupRoutes(app)

	app.Get("/health", func(c *fiber.Ctx) error {
		var data any = fiber.Map{
			"status": "ok",
		}
		return c.JSON(data)
	})

	app.Listen(":8080")
}
