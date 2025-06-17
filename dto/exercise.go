package dto

type ExerciseDto struct {
	Name string `json:"name" validate:"required,min=3,max=50"`
} 