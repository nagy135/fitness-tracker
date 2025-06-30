package models

import (
	"time"

	"gorm.io/gorm"
)

type Set struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Reps   int     `json:"reps"`
	Weight float32 `json:"weight"`

	RecordID uint `json:"recordId"`
} 