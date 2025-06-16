package main

import (
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/nagy135/fitness-tracker/database"
)

type (
	ErrorResponse struct {
		Error       bool   `json:"error"`
		FailedField string `json:"failedField"`
		Tag         string `json:"tag"`
		Value       any    `json:"value"`
	}

	XValidator struct {
		validator *validator.Validate
	}

	GlobalErrorHandlerResp struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}
)

var validate = validator.New()
var globalValidator *XValidator

func (v XValidator) Validate(data any) []ErrorResponse {
	validationErrors := []ErrorResponse{}

	errs := validate.Struct(data)
	if errs != nil {
		for _, err := range errs.(validator.ValidationErrors) {
			// In this case data object is actually holding the User struct
			var elem ErrorResponse

			elem.FailedField = err.Field() // Export struct field name
			elem.Tag = err.Tag()           // Export struct tag
			elem.Value = err.Value()       // Export field value
			elem.Error = true

			validationErrors = append(validationErrors, elem)
		}
	}

	return validationErrors
}

func GetValidator() *XValidator {
	return globalValidator
}

func main() {
	globalValidator = &XValidator{
		validator: validate,
	}
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusBadRequest).JSON(GlobalErrorHandlerResp{
				Success: false,
				Message: err.Error(),
			})
		},
	})

	database.ConnectDb()
	setupRoutes(app)

	app.Listen(":8080")
}
