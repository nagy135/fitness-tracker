package utils

import (
	"github.com/go-playground/validator/v10"
)

type ErrorResponse struct {
	Error       bool   `json:"error"`
	FailedField string `json:"failedField"`
	Tag         string `json:"tag"`
	Value       any    `json:"value"`
}

// ValidateStruct validates any struct with validation tags
func ValidateStruct(data any) []ErrorResponse {
	validate := validator.New()
	validationErrors := []ErrorResponse{}

	errs := validate.Struct(data)
	if errs != nil {
		for _, err := range errs.(validator.ValidationErrors) {
			var elem ErrorResponse

			elem.FailedField = err.Field()
			elem.Tag = err.Tag()
			elem.Value = err.Value()
			elem.Error = true

			validationErrors = append(validationErrors, elem)
		}
	}

	return validationErrors
} 