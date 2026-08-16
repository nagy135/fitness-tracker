package database

import (
	"path/filepath"
	"testing"

	"github.com/nagy135/fitness-tracker/internal/config"
	"github.com/nagy135/fitness-tracker/models"
)

func TestConnectDBCreatesSQLiteSchema(t *testing.T) {
	databasePath := filepath.Join(t.TempDir(), "fitness-tracker.db")
	dbInstance, err := ConnectDB(&config.Config{
		Database: config.DatabaseConfig{Path: databasePath},
	})
	if err != nil {
		t.Fatalf("ConnectDB() error = %v", err)
	}

	sqlDB, err := dbInstance.DB.DB()
	if err != nil {
		t.Fatalf("DB() error = %v", err)
	}
	t.Cleanup(func() {
		if err := sqlDB.Close(); err != nil {
			t.Errorf("Close() error = %v", err)
		}
	})
	// Force subsequent checks onto fresh pooled connections so the test verifies
	// that connection-local PRAGMAs are part of the SQLite DSN.
	sqlDB.SetMaxIdleConns(0)

	var foreignKeysEnabled int
	if err := dbInstance.DB.Raw("PRAGMA foreign_keys").Scan(&foreignKeysEnabled).Error; err != nil {
		t.Fatalf("reading foreign_keys PRAGMA: %v", err)
	}
	if foreignKeysEnabled != 1 {
		t.Fatalf("foreign_keys = %d, want 1", foreignKeysEnabled)
	}

	expectedTables := []any{
		&models.User{},
		&models.Exercise{},
		&models.Record{},
		&models.Set{},
		&models.AsyncJob{},
		&models.Workout{},
	}
	for _, model := range expectedTables {
		if !dbInstance.DB.Migrator().HasTable(model) {
			t.Errorf("migration did not create table for %T", model)
		}
	}
}
