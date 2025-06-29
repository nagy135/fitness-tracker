package main

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/handlers"
	"github.com/nagy135/fitness-tracker/internal/config"
)

func SetupRoutes(app *fiber.App, db *database.DBInstance, cfg *config.Config) {

	app.Static("/images", "./public/images")

	app.Post("/login", handlers.NewAuthHandler(db, cfg).Login)
	app.Post("/users", handlers.NewUserHandler(db).CreateUser)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// JWT middleware for protected routes (everything below requires JWT)
	app.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(cfg.JWT.Secret)},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired JWT",
				"details": err.Error(),
			})
		},
	}))

	exerciseHandler := handlers.NewExerciseHandler(db, cfg)
	app.Get("/exercises", exerciseHandler.GetExercises)
	app.Get("/exercises/options", exerciseHandler.GetExerciseOptions)
	app.Get("/exercises/:id", exerciseHandler.GetExercise)
	app.Post("/exercises", exerciseHandler.CreateExercise)

	recordHandler := handlers.NewRecordHandler(db)
	app.Get("/records", recordHandler.GetRecords)
	app.Post("/records", recordHandler.CreateRecord)

	asyncJobHandler := handlers.NewAsyncJobHandler(db)
	app.Get("/async-jobs", asyncJobHandler.GetAsyncJobs)
	app.Post("/async-jobs", asyncJobHandler.CreateAsyncJob)
}
