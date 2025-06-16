package dtos

type ExerciseDto struct {
	Name string `json:"name" validate:"required,min=3,max=20"`
}
