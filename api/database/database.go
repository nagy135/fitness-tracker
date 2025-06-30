package database

import (
	"fmt"
	"log"

	"github.com/nagy135/fitness-tracker/internal/config"
	"github.com/nagy135/fitness-tracker/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DBInstance struct {
	DB *gorm.DB
}

// ConnectDB initializes database connection with proper configuration
func ConnectDB(cfg *config.Config) (*DBInstance, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("Database connected successfully")

	log.Println("Running migrations...")
	if err := runMigrations(db); err != nil {
		return nil, fmt.Errorf("failed to run migrations: %w", err)
	}

	return &DBInstance{
		DB: db,
	}, nil
}

func runMigrations(db *gorm.DB) error {
	models := []any{
		&models.User{},
		&models.Exercise{},
		&models.Record{},
		&models.Set{},
		&models.AsyncJob{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			return err
		}
	}

	return nil
}
