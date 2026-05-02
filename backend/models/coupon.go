package models

import "time"

type Coupon struct {
	ID             uint       `json:"id" gorm:"primaryKey"`
	Code           string     `json:"code" gorm:"size:40;uniqueIndex;not null"`
	Title          string     `json:"title" gorm:"size:120;not null"`
	Description    string     `json:"description" gorm:"type:text"`
	DiscountType   string     `json:"discount_type" gorm:"size:20;not null"`
	DiscountValue  float64    `json:"discount_value" gorm:"type:numeric(12,2);not null"`
	PointsRequired int        `json:"points_required" gorm:"not null"`
	MinOrderAmount float64    `json:"min_order_amount" gorm:"type:numeric(12,2);default:0"`
	ExpiresAt      *time.Time `json:"expires_at"`
	IsActive       bool       `json:"is_active" gorm:"default:true"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type UserCoupon struct {
	ID         uint       `json:"id" gorm:"primaryKey"`
	UserID     uint       `json:"user_id" gorm:"not null;index"`
	CouponID   uint       `json:"coupon_id" gorm:"not null"`
	OrderID    *uint      `json:"order_id"`
	Status     string     `json:"status" gorm:"size:20;default:unused"`
	RedeemedAt time.Time  `json:"redeemed_at"`
	UsedAt     *time.Time `json:"used_at"`
	CreatedAt  time.Time  `json:"created_at"`
	UpdatedAt  time.Time  `json:"updated_at"`
	Coupon     Coupon     `json:"coupon" gorm:"foreignKey:CouponID"`
}

func (Coupon) TableName() string {
	return "coupons"
}

func (UserCoupon) TableName() string {
	return "user_coupons"
}
