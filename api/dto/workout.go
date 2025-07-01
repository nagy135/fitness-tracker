package dto

type WorkoutDto struct {
	Label string  `json:"label" validate:"required,min=1,max=100"`
	Date  *string `json:"date,omitempty"`
}
