package models

import (
	"time"

	"gorm.io/gorm"
)

type Feeling string

const (
	Easy   Feeling = "easy"
	Normal Feeling = "normal"
	Hard   Feeling = "hard"
)

type Record struct {
	gorm.Model

	Weight    float32
	Feeling   Feeling
	CreatedAt time.Time

	ExerciseID uint
}
