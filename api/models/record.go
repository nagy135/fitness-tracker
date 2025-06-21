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
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Weight  float32 `json:"weight"`
	Feeling Feeling `json:"feeling"`

	ExerciseID uint     `json:"exerciseId"`
	Exercise   Exercise `json:"exercise" gorm:"foreignKey:ExerciseID"`
	UserID     uint     `json:"userId"`
}
