package models

import "time"

type Order struct {
	ID              uint        `json:"id" gorm:"primaryKey"`
	UserID          uint        `json:"user_id" gorm:"not null;index"`
	OrderNumber     string      `json:"order_number" gorm:"size:40;uniqueIndex;not null"`
	Status          string      `json:"status" gorm:"size:30;default:pending"`
	Season          string      `json:"season" gorm:"size:20"`
	PaymentMethod   string      `json:"payment_method" gorm:"size:30"`
	ShippingAddress string      `json:"shipping_address" gorm:"type:text"`
	Notes           string      `json:"notes" gorm:"type:text"`
	SubtotalAmount  float64     `json:"subtotal_amount" gorm:"type:numeric(12,2);not null"`
	DiscountAmount  float64     `json:"discount_amount" gorm:"type:numeric(12,2);default:0"`
	TotalAmount     float64     `json:"total_amount" gorm:"type:numeric(12,2);not null"`
	ConfirmedAt     *time.Time  `json:"confirmed_at"`
	Items           []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	OrderID     uint      `json:"order_id" gorm:"not null;index"`
	ProductID   uint      `json:"product_id" gorm:"not null"`
	ProductName string    `json:"product_name" gorm:"size:120;not null"`
	SizeLabel   string    `json:"size_label" gorm:"size:20"`
	Color       string    `json:"color" gorm:"size:40"`
	Quantity    int       `json:"quantity" gorm:"not null"`
	UnitPrice   float64   `json:"unit_price" gorm:"type:numeric(12,2);not null"`
	LineTotal   float64   `json:"line_total" gorm:"type:numeric(12,2);not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}

func (OrderItem) TableName() string {
	return "order_items"
}
