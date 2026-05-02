package models

import "time"

type PointTransaction struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	UserID      uint      `json:"user_id" gorm:"not null;index"`
	Type        string    `json:"type" gorm:"size:20;not null"`
	Source      string    `json:"source" gorm:"size:30;not null"`
	Points      int       `json:"points" gorm:"not null"`
	Description string    `json:"description" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (PointTransaction) TableName() string {
	return "point_transactions"
}
