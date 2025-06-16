package main

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/handlers"
)

func setupRoutes(app *fiber.App) {

	app.Post("/login", handlers.Login)
	app.Post("/users", handlers.CreateUser)

	app.Get("/health", func(c *fiber.Ctx) error {
		var data any = fiber.Map{
			"status": "ok",
		}
		return c.JSON(data)
	})

	app.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte("secret")},
	}))

	app.Get("/exercises", handlers.GetExercises)
	app.Post("/exercises", handlers.CreateExercise)

	app.Get("/records", handlers.GetRecords)
	app.Post("/records", handlers.CreateRecord)
}
