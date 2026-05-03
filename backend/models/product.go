package models

import "time"

type Product struct {
	ID             uint      `json:"id" gorm:"primaryKey"`
	Name           string    `json:"name" gorm:"size:120;not null"`
	Slug           string    `json:"slug" gorm:"size:140;uniqueIndex;not null"`
	Description    string    `json:"description" gorm:"type:text"`
	Category       string    `json:"category" gorm:"size:60;not null"`
	Season         string    `json:"season" gorm:"size:20;not null"`
	Fabric         string    `json:"fabric" gorm:"size:80"`
	Color          string    `json:"color" gorm:"size:40"`
	SizeLabel      string    `json:"size_label" gorm:"size:20"`
	Price          float64   `json:"price" gorm:"type:numeric(12,2);not null"`
	CompareAtPrice float64   `json:"compare_at_price" gorm:"type:numeric(12,2)"`
	Stock          int       `json:"stock" gorm:"default:0"`
	ImageURL       string    `json:"image_url" gorm:"type:text"`
	IsActive       bool      `json:"is_active" gorm:"default:true"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (Product) TableName() string {
	return "products"
}
