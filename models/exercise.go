package models

import (
	"time"
	"gorm.io/gorm"
)

type Exercise struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Name string `json:"name"`

	Records []Record `json:"records,omitempty"`
}
