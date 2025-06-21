package models

import (
	"time"

	"gorm.io/gorm"
)

type AsyncJobType string

const (
	FetchExercises AsyncJobType = "fetch-exercises"
)

type Status string

const (
	Pending Status = "pending"
	Running Status = "running"
	Error   Status = "error"
	Done    Status = "done"
)

type AsyncJob struct {
	ID        uint `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	Type   AsyncJobType `json:"type"`
	Status Status       `json:"status"`
	Error  string       `json:"error,omitempty"`
}
