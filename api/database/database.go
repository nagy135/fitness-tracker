package database

import (
	"fmt"
	"log"
	"strings"

	"github.com/glebarez/sqlite"
	"github.com/nagy135/fitness-tracker/internal/config"
	"github.com/nagy135/fitness-tracker/models"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DBInstance struct {
	DB *gorm.DB
}

// ConnectDB initializes database connection with proper configuration
func ConnectDB(cfg *config.Config) (*DBInstance, error) {
	querySeparator := "?"
	if strings.Contains(cfg.Database.Path, "?") {
		querySeparator = "&"
	}
	dsn := cfg.Database.Path + querySeparator +
		"_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)"

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Printf("SQLite database connected at %s", cfg.Database.Path)

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
		&models.Workout{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			return err
		}
	}

	return nil
}
