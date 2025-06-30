package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
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

// downloadImage downloads an image from the external API and saves it locally
func (w *AsyncWorker) downloadImage(imageURL, localPath string) error {
	// Create directory if it doesn't exist
	dir := filepath.Dir(localPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", dir, err)
	}

	// Check if file already exists
	if _, err := os.Stat(localPath); err == nil {
		return nil // File already exists, skip download
	}

	// Create HTTP client with timeout
	client := &http.Client{Timeout: 10 * time.Second}

	resp, err := client.Get(imageURL)
	if err != nil {
		return fmt.Errorf("failed to download image: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP error downloading image: status %d", resp.StatusCode)
	}

	// Create the file
	file, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("failed to create file %s: %w", localPath, err)
	}
	defer file.Close()

	// Copy the image data
	_, err = io.Copy(file, resp.Body)
	if err != nil {
		return fmt.Errorf("failed to save image: %w", err)
	}

	return nil
}

// downloadExerciseImages downloads all images for an exercise
func (w *AsyncWorker) downloadExerciseImages(external ExternalAPIExercise) ([]string, error) {
	const baseImageURL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/"
	const publicDir = "public/images"

	var localImagePaths []string
	var downloadErrors int

	for _, imagePath := range external.Images {
		if imagePath == "" {
			continue
		}

		// External image URL
		imageURL := baseImageURL + imagePath

		// Local file path
		localPath := filepath.Join(publicDir, imagePath)

		// Download the image
		if err := w.downloadImage(imageURL, localPath); err != nil {
			log.Printf("Failed to download image %s for exercise %s: %v", imagePath, external.Name, err)
			downloadErrors++
			continue
		}

		// Store the local path (relative to public directory for serving)
		localImagePaths = append(localImagePaths, "/images/"+imagePath)
	}

	if downloadErrors > 0 {
		log.Printf("Exercise %s: downloaded %d images, %d errors", external.Name, len(localImagePaths), downloadErrors)
	}

	return localImagePaths, nil
}

// convertToExercise converts an ExternalAPIExercise to a models.Exercise
func (w *AsyncWorker) convertToExercise(external ExternalAPIExercise) (models.Exercise, error) {
	localImagePaths, err := w.downloadExerciseImages(external)
	if err != nil {
		return models.Exercise{}, fmt.Errorf("failed to download images: %w", err)
	}

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

	imagesJSON, err := json.Marshal(localImagePaths)
	if err != nil {
		return models.Exercise{}, err
	}
	imagesStr := string(imagesJSON)

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

	if err := os.MkdirAll("public/images", 0755); err != nil {
		log.Printf("Error creating public/images directory: %v", err)
		w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Updates(models.AsyncJob{
			Status: models.Error,
			Error:  "Failed to create images directory: " + err.Error(),
		})
		return
	}

	var exercises []models.Exercise
	var skipped int
	var errors int
	var totalImagesDownloaded int

	// Limit to first 10 exercises for testing
	const LIMIT_FOR_TESTING = false
	maxExercises := len(externalExercises)
	if LIMIT_FOR_TESTING {
		maxExercises = min(len(externalExercises), 10)
	}

	log.Printf("Processing first %d exercises (limited for testing)", maxExercises)

	for i := range maxExercises {
		externalExercise := externalExercises[i]

		log.Printf("Processing exercise %d/%d: %s", i+1, maxExercises, externalExercise.Name)

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
		totalImagesDownloaded += len(externalExercise.Images)
	}

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

	log.Printf("Exercise import completed: %d created, %d skipped, %d errors, %d images downloaded",
		len(exercises), skipped, errors, totalImagesDownloaded)

	w.db.DB.Model(&models.AsyncJob{}).Where("id = ?", asyncJobID).Update("status", models.Done)
	log.Printf("Async job %d completed successfully", asyncJobID)
}
