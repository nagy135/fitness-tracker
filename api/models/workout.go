package models

import (
	"time"

	"gorm.io/gorm"
)

type Workout struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	UserID     uint     `json:"userId"`

	Label      string     `json:"label"`

	Date       *time.Time `json:"date,omitempty"`
}
