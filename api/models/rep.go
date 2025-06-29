package models

import (
	"time"

	"gorm.io/gorm"
)

type Rep struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Weight  float32 `json:"weight"`
	Feeling Feeling `json:"feeling"`

	RecordID uint `json:"recordId"`
} 