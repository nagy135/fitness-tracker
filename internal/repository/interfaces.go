package repository

import "github.com/nagy135/fitness-tracker/models"

type UserRepository interface {
	Create(user *models.User) error
	GetByName(name string) (*models.User, error)
	GetByID(id uint) (*models.User, error)
}

type ExerciseRepository interface {
	Create(exercise *models.Exercise) error
	GetAll() ([]models.Exercise, error)
	GetByID(id uint) (*models.Exercise, error)
}

type RecordRepository interface {
	Create(record *models.Record) error
	GetByUserID(userID uint) ([]models.Record, error)
	GetByID(id uint) (*models.Record, error)
} 