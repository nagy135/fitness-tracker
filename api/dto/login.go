package dto

type LoginDto struct {
	Name string `json:"name" validate:"required,min=3,max=50"`
	Pass string `json:"pass" validate:"required,min=8,max=100"`
}

type LoginResponseDto struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	User         struct {
		ID   uint   `json:"id"`
		Name string `json:"name"`
	} `json:"user"`
}

type RefreshTokenDto struct {
	RefreshToken string `json:"refreshToken" validate:"required"`
} 