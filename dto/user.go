package dto

type UserDto struct {
	Name string `json:"name" validate:"required,min=3,max=50"`
	Pass string `json:"pass" validate:"required,min=8,max=100"`
} 