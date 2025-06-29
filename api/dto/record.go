package dto

type RepDto struct {
	Weight  float32 `json:"weight" validate:"required,min=0"`
	Feeling string  `json:"feeling" validate:"required,oneof=easy normal hard"`
}

type RecordDto struct {
	ExerciseID uint     `json:"exerciseId" validate:"required,min=1"`
	Reps       []RepDto `json:"reps" validate:"required,min=1,dive"`
} 