package models

import "time"

type User struct {
	ID                    uint      `json:"id" gorm:"primaryKey"`
	Name                  string    `json:"name" gorm:"size:120;not null"`
	Email                 string    `json:"email" gorm:"size:120;uniqueIndex;not null"`
	PasswordHash          string    `json:"-" gorm:"column:password_hash;size:255;not null"`
	Phone                 string    `json:"phone" gorm:"size:30"`
	Role                  string    `json:"role" gorm:"size:30;default:CUSTOMER"`
	Points                int       `json:"points" gorm:"default:0"`
	HasFirstPurchase      bool      `json:"has_first_purchase" gorm:"default:false"`
	CheckInUnlocked       bool      `json:"check_in_unlocked" gorm:"default:false"`
	ConfirmedOrders       int       `json:"confirmed_orders" gorm:"default:0"`
	PreferredActivity     string    `json:"preferred_activity" gorm:"size:60"`
	PreferredSeason       string    `json:"preferred_season" gorm:"size:20"`
	ProfileImageURL       string    `json:"profile_image_url" gorm:"column:profile_image_url;size:500"`
	StravaProfileImageURL string    `json:"strava_profile_image_url" gorm:"column:strava_profile_image_url;size:500"`
	StravaAthleteID       *int64    `json:"strava_athlete_id,omitempty" gorm:"column:strava_athlete_id;uniqueIndex"`
	StravaAccessToken     string    `json:"-" gorm:"column:strava_access_token;size:255"`
	StravaRefreshToken    string    `json:"-" gorm:"column:strava_refresh_token;size:255"`
	StravaTokenExpiresAt  int64     `json:"-" gorm:"column:strava_token_expires_at"`
	StravaScope           string    `json:"-" gorm:"column:strava_scope;size:255"`
	CreatedAt             time.Time `json:"created_at"`
	UpdatedAt             time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}
