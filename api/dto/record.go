package dto

type SetDto struct {
	Reps   int     `json:"reps" validate:"required,min=1"`
	Weight float32 `json:"weight" validate:"required,min=0"`
}

type RecordDto struct {
	ExerciseID uint     `json:"exerciseId" validate:"required,min=1"`
	Sets       []SetDto `json:"sets" validate:"required,min=1,dive"`
	Date       *string  `json:"date,omitempty"`
}

type UpdateRecordDto struct {
	ExerciseID uint     `json:"exerciseId" validate:"required,min=1"`
	Sets       []SetDto `json:"sets" validate:"required,min=1,dive"`
	Date       *string  `json:"date,omitempty"`
}
