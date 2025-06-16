package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
)

func main() {
	app := fiber.New()

	database.ConnectDb()
	setupRoutes(app)

	app.Listen(":8080")
}
