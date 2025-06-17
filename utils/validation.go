package utils

import (
	"sync"

	"github.com/go-playground/validator/v10"
)

type ValidationError struct {
	Field   string `json:"field"`
	Tag     string `json:"tag"`
	Value   any    `json:"value"`
	Message string `json:"message"`
}

var (
	validate *validator.Validate
	once     sync.Once
)

// GetValidator returns a singleton validator instance
func GetValidator() *validator.Validate {
	once.Do(func() {
		validate = validator.New()
	})
	return validate
}

// ValidateStruct validates any struct with validation tags
func ValidateStruct(data any) []ValidationError {
	validationErrors := []ValidationError{}
	v := GetValidator()

	errs := v.Struct(data)
	if errs != nil {
		for _, err := range errs.(validator.ValidationErrors) {
			elem := ValidationError{
				Field:   err.Field(),
				Tag:     err.Tag(),
				Value:   err.Value(),
				Message: getErrorMessage(err),
			}
			validationErrors = append(validationErrors, elem)
		}
	}

	return validationErrors
}

func getErrorMessage(err validator.FieldError) string {
	switch err.Tag() {
	case "required":
		return "This field is required"
	case "min":
		return "Value is too short"
	case "max":
		return "Value is too long"
	case "email":
		return "Invalid email format"
	case "oneof":
		return "Invalid value, must be one of the allowed values"
	default:
		return "Invalid value"
	}
} 