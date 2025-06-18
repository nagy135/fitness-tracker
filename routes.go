package main

import (
	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/handlers"
	"github.com/nagy135/fitness-tracker/internal/config"
)

// SetupRoutes configures all application routes
func SetupRoutes(app *fiber.App, db *database.DBInstance, cfg *config.Config) {
	// Public routes
	app.Post("/login", handlers.NewAuthHandler(db, cfg).Login)
	app.Post("/users", handlers.NewUserHandler(db).CreateUser)

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// JWT middleware for protected routes
	app.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(cfg.JWT.Secret)},
	}))

	// Protected routes
	exerciseHandler := handlers.NewExerciseHandler(db)
	app.Get("/exercises", exerciseHandler.GetExercises)
	app.Post("/exercises", exerciseHandler.CreateExercise)

	recordHandler := handlers.NewRecordHandler(db)
	app.Get("/records", recordHandler.GetRecords)
	app.Post("/records", recordHandler.CreateRecord)

	asyncJobHandler := handlers.NewAsyncJobHandler(db)
	app.Get("/async-jobs", asyncJobHandler.GetAsyncJobs)
	app.Post("/async-jobs", asyncJobHandler.CreateAsyncJob)
}
