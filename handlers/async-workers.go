package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/nagy135/fitness-tracker/database"
	"github.com/nagy135/fitness-tracker/models"
)

// AsyncWorker handles the execution of async jobs
type AsyncWorker struct {
	db *database.DBInstance
}

func NewAsyncWorker(db *database.DBInstance) *AsyncWorker {
	return &AsyncWorker{db: db}
}

// ExternalAPIExercise represents the structure of an exercise from the external JSON API
type ExternalAPIExercise struct {
	Name             string   `json:"name"`
	Force            *string  `json:"force"`
	Level            string   `json:"level"`
	Mechanic         *string  `json:"mechanic"`
	Equipment        *string  `json:"equipment"`
	PrimaryMuscles   []string `json:"primaryMuscles"`
	SecondaryMuscles []string `json:"secondaryMuscles"`
	Instructions     []string `json:"instructions"`
	Category         string   `json:"category"`
	Images           []string `json:"images"`
	ID               string   `json:"id"`
}

func (w *AsyncWorker) convertToExercise(external ExternalAPIExercise) (models.Exercise, error) {
	// Convert slices to JSON strings
	primaryMusclesJSON, err := json.Marshal(external.PrimaryMuscles)
	if err != nil {
		return models.Exercise{}, err
	}
	primaryMusclesStr := string(primaryMusclesJSON)
	
	secondaryMusclesJSON, err := json.Marshal(external.SecondaryMuscles)
	if err != nil {
		return models.Exercise{}, err
	}
	secondaryMusclesStr := string(secondaryMusclesJSON)
	
	instructionsJSON, err := json.Marshal(external.Instructions)
	if err != nil {
		return models.Exercise{}, err
	}
	instructionsStr := string(instructionsJSON)
	
	imagesJSON, err := json.Marshal(external.Images)
	if err != nil {
		return models.Exercise{}, err
	}
	imagesStr := string(imagesJSON)

	// Convert strings to pointers where appropriate
	var level, category *string
	if external.Level != "" {
		level = &external.Level
	}
	if external.Category != "" {
		category = &external.Category
	}

	exercise := models.Exercise{
		Name:               external.Name,
		ExternalID:         &external.ID,
		Force:              external.Force,
		Level:              level,
		Mechanic:           external.Mechanic,
		Equipment:          external.Equipment,
		Category:           category,
		PrimaryMusclesDB:   &primaryMusclesStr,
		SecondaryMusclesDB: &secondaryMusclesStr,
		InstructionsDB:     &instructionsStr,
		ImagesDB:           &imagesStr,
	}

	return exercise, nil
}

func (w *AsyncWorker) FetchExercises(asyncJobID uint) {
	w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Update("status", models.Running)

	url := "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json"

	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	resp, err := client.Get(url)
	if err != nil {
		log.Printf("Error fetching exercises: %v", err)
		w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Updates(models.AsyncJob{
			Status: models.Error,
			Error:  err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Printf("HTTP error fetching exercises: status %d", resp.StatusCode)
		w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Updates(models.AsyncJob{
			Status: models.Error,
			Error:  "HTTP error: status " + resp.Status,
		})
		return
	}

	var externalExercises []ExternalAPIExercise
	decoder := json.NewDecoder(resp.Body)
	if err := decoder.Decode(&externalExercises); err != nil {
		log.Printf("Error unmarshaling exercises JSON: %v", err)
		w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Updates(models.AsyncJob{
			Status: models.Error,
			Error:  err.Error(),
		})
		return
	}

	log.Printf("Successfully fetched %d exercises from external API", len(externalExercises))

	// Convert and create exercises in batches
	var exercises []models.Exercise
	var skipped int
	var errors int

	for _, externalExercise := range externalExercises {
		var existing models.Exercise
		result := w.db.DB.Where("external_id = ?", externalExercise.ID).First(&existing)
		if result.Error == nil {
			skipped++
			continue // Skip if already exists
		}

		exercise, err := w.convertToExercise(externalExercise)
		if err != nil {
			log.Printf("Error converting exercise %s: %v", externalExercise.Name, err)
			errors++
			continue
		}

		exercises = append(exercises, exercise)
	}

	// Create exercises in database
	if len(exercises) > 0 {
		if err := w.db.DB.Create(&exercises).Error; err != nil {
			log.Printf("Error creating exercises in database: %v", err)
			w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Updates(models.AsyncJob{
				Status: models.Error,
				Error:  "Database error: " + err.Error(),
			})
			return
		}
	}

	log.Printf("Exercise import completed: %d created, %d skipped, %d errors",
		len(exercises), skipped, errors)

	w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Update("status", models.Done)
	log.Printf("Async job %d completed successfully", asyncJobID)
}
