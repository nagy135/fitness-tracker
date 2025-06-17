package dto

type RecordDto struct {
	ExerciseID uint    `json:"exerciseId" validate:"required,min=1"`
	Weight     float32 `json:"weight" validate:"required,min=0"`
	Feeling    string  `json:"feeling" validate:"required,oneof=easy normal hard"`
} 