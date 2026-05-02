package models

import "time"

type CheckIn struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id" gorm:"not null;index"`
	ActivityType string    `json:"activity_type" gorm:"size:60;not null"`
	Description  string    `json:"description" gorm:"column:notes;type:text"`
	ImageURL     string    `json:"image" gorm:"column:image_url;size:255"`
	PointsEarned int       `json:"points_earned" gorm:"not null"`
	CheckInDay   time.Time `json:"-" gorm:"column:checkin_day;type:date;not null"`
	CheckInDate  time.Time `json:"date" gorm:"column:checked_in_at;not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (CheckIn) TableName() string {
	return "checkins"
}
