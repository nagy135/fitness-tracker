package models

import (
	"time"

	"gorm.io/gorm"
)

type Record struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	ExerciseID uint     `json:"exerciseId"`
	Exercise   Exercise `json:"exercise" gorm:"foreignKey:ExerciseID"`
	UserID     uint     `json:"userId"`
	Sets       []Set    `json:"sets"`
	Date       *time.Time `json:"date,omitempty"`
}
