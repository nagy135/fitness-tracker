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

	// Weight multiplier for exercises with pulleys (default 1.0, 0.5 for halved weight)
	TotalWeightMultiplier float32 `json:"totalWeightMultiplier" gorm:"default:1.0"`

	// Optional fields from external API
	ExternalID       *string `json:"externalId,omitempty" gorm:"uniqueIndex"`
	Force            *string `json:"force,omitempty"`
	Level            *string `json:"level,omitempty"`
	Mechanic         *string `json:"mechanic,omitempty"`
	Equipment        *string `json:"equipment,omitempty"`
	Category         *string `json:"category,omitempty"`

	// Database fields (JSON strings)
	PrimaryMusclesDB   *string `json:"-" gorm:"column:primary_muscles;type:text"`
	SecondaryMusclesDB *string `json:"-" gorm:"column:secondary_muscles;type:text"`
	InstructionsDB     *string `json:"-" gorm:"column:instructions;type:text"`
	ImagesDB           *string `json:"-" gorm:"column:images;type:text"`

	// API fields (parsed arrays) - not stored in DB
	PrimaryMuscles   []string `json:"primaryMuscles,omitempty" gorm:"-"`
	SecondaryMuscles []string `json:"secondaryMuscles,omitempty" gorm:"-"`
	Instructions     []string `json:"instructions,omitempty" gorm:"-"`
	Images           []string `json:"images,omitempty" gorm:"-"`

	Records []Record `json:"records,omitempty"`
}

// AfterFind GORM hook - automatically called after loading from database
func (e *Exercise) AfterFind(tx *gorm.DB) error {
	// Parse JSON strings into arrays for API response
	if e.PrimaryMusclesDB != nil && *e.PrimaryMusclesDB != "" {
		json.Unmarshal([]byte(*e.PrimaryMusclesDB), &e.PrimaryMuscles)
	}
	
	if e.SecondaryMusclesDB != nil && *e.SecondaryMusclesDB != "" {
		json.Unmarshal([]byte(*e.SecondaryMusclesDB), &e.SecondaryMuscles)
	}
	
	if e.InstructionsDB != nil && *e.InstructionsDB != "" {
		json.Unmarshal([]byte(*e.InstructionsDB), &e.Instructions)
	}
	
	if e.ImagesDB != nil && *e.ImagesDB != "" {
		json.Unmarshal([]byte(*e.ImagesDB), &e.Images)
	}
	
	return nil
}
