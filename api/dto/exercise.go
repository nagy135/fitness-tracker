package dto

type ExerciseDto struct {
	// Required field
	Name string `json:"name" validate:"required,min=3,max=50"`

	// Optional fields
	Force            *string  `json:"force,omitempty"`
	Level            *string  `json:"level,omitempty"`
	Mechanic         *string  `json:"mechanic,omitempty"`
	Equipment        *string  `json:"equipment,omitempty"`
	Category         *string  `json:"category,omitempty"`
	PrimaryMuscles   []string `json:"primaryMuscles,omitempty"`
	SecondaryMuscles []string `json:"secondaryMuscles,omitempty"`
	Instructions     []string `json:"instructions,omitempty"`
	Images           []string `json:"images,omitempty"`
}

type CreateExerciseDto struct {
	Name           string   `json:"name" validate:"required,min=3,max=100"`
	PrimaryMuscles []string `json:"primaryMuscles" validate:"required,min=1"`
	Instructions   string   `json:"instructions" validate:"required,min=10"`
}
