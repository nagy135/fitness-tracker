package main

import (
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/handlers"
)

func setupRoutes(app *fiber.App) {
	app.Get("/exercises", handlers.GetExercises)
	app.Post("/exercises", handlers.CreateExercise)
}
