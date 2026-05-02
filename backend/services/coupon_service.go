package services

import (
	"errors"
	"time"

	"essensefit/backend/models"
	"essensefit/backend/repositories"
	"gorm.io/gorm"
)

type CouponService struct {
	db                   *gorm.DB
	couponRepo           *repositories.CouponRepository
	userRepo             *repositories.UserRepository
	pointTransactionRepo *repositories.PointTransactionRepository
}

type CreateCouponInput struct {
	Code           string  `json:"code" binding:"required"`
	Title          string  `json:"title" binding:"required"`
	Description    string  `json:"description"`
	DiscountType   string  `json:"discount_type" binding:"required,oneof=percentage fixed"`
	DiscountValue  float64 `json:"discount_value" binding:"required,gt=0"`
	PointsRequired int     `json:"points_required" binding:"required,min=1"`
	MinOrderAmount float64 `json:"min_order_amount"`
	ExpiresAt      string  `json:"expires_at" binding:"required"`
	IsActive       *bool   `json:"is_active"`
}

type RedeemCouponInput struct {
	CouponID uint `json:"coupon_id" binding:"required"`
}

func NewCouponService(
	db *gorm.DB,
	couponRepo *repositories.CouponRepository,
	userRepo *repositories.UserRepository,
	pointTransactionRepo *repositories.PointTransactionRepository,
) *CouponService {
	return &CouponService{
		db:                   db,
		couponRepo:           couponRepo,
		userRepo:             userRepo,
		pointTransactionRepo: pointTransactionRepo,
	}
}

func (s *CouponService) Create(input CreateCouponInput) (*models.Coupon, error) {
	expiresAt, err := time.Parse(time.RFC3339, input.ExpiresAt)
	if err != nil {
		return nil, errors.New("expires_at must be in RFC3339 format")
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	coupon := &models.Coupon{
		Code:           input.Code,
		Title:          input.Title,
		Description:    input.Description,
		DiscountType:   input.DiscountType,
		DiscountValue:  input.DiscountValue,
		PointsRequired: input.PointsRequired,
		MinOrderAmount: input.MinOrderAmount,
		ExpiresAt:      &expiresAt,
		IsActive:       isActive,
	}

	if err := s.couponRepo.Create(coupon); err != nil {
		return nil, err
	}

	return coupon, nil
}

func (s *CouponService) ListActive() ([]models.Coupon, error) {
	return s.couponRepo.ListActive()
}

func (s *CouponService) ListUserCoupons(userID uint) ([]models.UserCoupon, error) {
	return s.couponRepo.ListUserCoupons(userID)
}

func (s *CouponService) Redeem(userID uint, input RedeemCouponInput) (*models.UserCoupon, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	coupon, err := s.couponRepo.GetByID(input.CouponID)
	if err != nil {
		return nil, err
	}

	if !coupon.IsActive {
		return nil, errors.New("coupon is inactive")
	}
	if coupon.ExpiresAt != nil && coupon.ExpiresAt.Before(time.Now()) {
		return nil, errors.New("coupon has expired")
	}

	if user.Points < coupon.PointsRequired {
		return nil, errors.New("insufficient points")
	}

	userCoupon := &models.UserCoupon{
		UserID:     userID,
		CouponID:   coupon.ID,
		Status:     "unused",
		RedeemedAt: time.Now(),
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		user.Points -= coupon.PointsRequired
		if err := tx.Save(user).Error; err != nil {
			return err
		}

		if err := tx.Create(&models.PointTransaction{
			UserID:      userID,
			Type:        "debit",
			Source:      "coupon_redeem",
			Points:      coupon.PointsRequired,
			Description: "Resgate do cupom " + coupon.Code,
		}).Error; err != nil {
			return err
		}

		return tx.Create(userCoupon).Error
	})
	if err != nil {
		return nil, err
	}

	userCoupon.Coupon = *coupon
	return userCoupon, nil
}
