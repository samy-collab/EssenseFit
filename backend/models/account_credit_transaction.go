package models

import "time"

type AccountCreditTransaction struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null;index"`
	Type          string    `json:"type" gorm:"size:20;not null"`
	Amount        float64   `json:"amount" gorm:"type:numeric(10,2);not null"`
	PaymentMethod string    `json:"payment_method" gorm:"size:30;not null"`
	Description   string    `json:"description" gorm:"size:255"`
	CreatedAt     time.Time `json:"created_at"`
}

func (AccountCreditTransaction) TableName() string {
	return "account_credit_transactions"
}
