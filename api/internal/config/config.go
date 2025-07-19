package config

import (
	"os"
	"time"
)

type Config struct {
	Database DatabaseConfig
	JWT      JWTConfig
	Server   ServerConfig
}

type DatabaseConfig struct {
	Host     string
	User     string
	Password string
	Name     string
	Port     string
}

type JWTConfig struct {
	Secret           string
	Duration         time.Duration
	RefreshSecret    string
	RefreshDuration  time.Duration
}

type ServerConfig struct {
	Port         string
	BaseURL      string
	AllowOrigins string
}

// LoadConfig loads configuration from environment variables
func LoadConfig() *Config {
	return &Config{
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "db"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "password"),
			Name:     getEnv("DB_NAME", "fitness_tracker"),
			Port:     getEnv("DB_PORT", "5432"),
		},
		JWT: JWTConfig{
			Secret:          getEnv("JWT_SECRET", "your-super-secret-key-change-in-production"),
			Duration:        time.Hour * 72,
			RefreshSecret:   getEnv("JWT_REFRESH_SECRET", "your-super-secret-refresh-key-change-in-production"),
			RefreshDuration: time.Hour * 24 * 7, // 7 days
		},
		Server: ServerConfig{
			Port:         getEnv("SERVER_PORT", "8080"),
			BaseURL:      getEnv("SERVER_BASE_URL", "http://localhost:8080"),
			AllowOrigins: getEnv("SERVER_ALLOW_ORIGINS", "http://localhost:3004"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
