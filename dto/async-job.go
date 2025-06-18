package dto

import "github.com/nagy135/fitness-tracker/models"

type AsyncJobDto struct {
	Type models.AsyncJobType `json:"type" validate:"required,oneof=fetch-exercises"`
}
