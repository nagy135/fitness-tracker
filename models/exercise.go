package models

import (
	"encoding/json"
	"time"
	"gorm.io/gorm"
)

type Exercise struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `json:"deletedAt,omitempty" gorm:"index"`

	// Required field
	Name string `json:"name" gorm:"not null"`

	// Optional fields from external API
	ExternalID       *string `json:"externalId,omitempty" gorm:"uniqueIndex"`
	Force            *string `json:"force,omitempty"`
	Level            *string `json:"level,omitempty"`
	Mechanic         *string `json:"mechanic,omitempty"`
	Equipment        *string `json:"equipment,omitempty"`
	Category         *string `json:"category,omitempty"`
	PrimaryMuscles   *string `json:"-" gorm:"type:text"` // Hide from JSON, handled by custom marshaling
	SecondaryMuscles *string `json:"-" gorm:"type:text"` // Hide from JSON, handled by custom marshaling
	Instructions     *string `json:"-" gorm:"type:text"` // Hide from JSON, handled by custom marshaling
	Images           *string `json:"-" gorm:"type:text"` // Hide from JSON, handled by custom marshaling

	Records []Record `json:"records,omitempty"`
}

// ExerciseJSON represents the JSON structure for API responses
type ExerciseJSON struct {
	ID        uint           `json:"id"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt *time.Time     `json:"deletedAt,omitempty"`

	Name string `json:"name"`

	ExternalID       *string    `json:"externalId,omitempty"`
	Force            *string    `json:"force,omitempty"`
	Level            *string    `json:"level,omitempty"`
	Mechanic         *string    `json:"mechanic,omitempty"`
	Equipment        *string    `json:"equipment,omitempty"`
	Category         *string    `json:"category,omitempty"`
	PrimaryMuscles   []string   `json:"primaryMuscles,omitempty"`
	SecondaryMuscles []string   `json:"secondaryMuscles,omitempty"`
	Instructions     []string   `json:"instructions,omitempty"`
	Images           []string   `json:"images,omitempty"`

	Records []Record `json:"records,omitempty"`
}

// MarshalJSON implements custom JSON marshaling for Exercise
func (e Exercise) MarshalJSON() ([]byte, error) {
	exerciseJSON := ExerciseJSON{
		ID:        e.ID,
		CreatedAt: e.CreatedAt,
		UpdatedAt: e.UpdatedAt,
		Name:      e.Name,
		ExternalID: e.ExternalID,
		Force:     e.Force,
		Level:     e.Level,
		Mechanic:  e.Mechanic,
		Equipment: e.Equipment,
		Category:  e.Category,
		Records:   e.Records,
	}

	// Handle DeletedAt
	if e.DeletedAt.Valid {
		exerciseJSON.DeletedAt = &e.DeletedAt.Time
	}

	// Unmarshal JSON strings back to arrays
	if e.PrimaryMuscles != nil && *e.PrimaryMuscles != "" {
		if err := json.Unmarshal([]byte(*e.PrimaryMuscles), &exerciseJSON.PrimaryMuscles); err != nil {
			// If unmarshal fails, return empty array
			exerciseJSON.PrimaryMuscles = []string{}
		}
	}

	if e.SecondaryMuscles != nil && *e.SecondaryMuscles != "" {
		if err := json.Unmarshal([]byte(*e.SecondaryMuscles), &exerciseJSON.SecondaryMuscles); err != nil {
			exerciseJSON.SecondaryMuscles = []string{}
		}
	}

	if e.Instructions != nil && *e.Instructions != "" {
		if err := json.Unmarshal([]byte(*e.Instructions), &exerciseJSON.Instructions); err != nil {
			exerciseJSON.Instructions = []string{}
		}
	}

	if e.Images != nil && *e.Images != "" {
		if err := json.Unmarshal([]byte(*e.Images), &exerciseJSON.Images); err != nil {
			exerciseJSON.Images = []string{}
		}
	}

	return json.Marshal(exerciseJSON)
}
