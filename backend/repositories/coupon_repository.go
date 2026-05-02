package repositories

import (
	"essensefit/backend/models"
	"time"

	"gorm.io/gorm"
)

type CouponRepository struct {
	db *gorm.DB
}

func NewCouponRepository(db *gorm.DB) *CouponRepository {
	return &CouponRepository{db: db}
}

func (r *CouponRepository) Create(coupon *models.Coupon) error {
	return r.db.Create(coupon).Error
}

func (r *CouponRepository) ListActive() ([]models.Coupon, error) {
	var coupons []models.Coupon
	now := time.Now()
	if err := r.db.
		Where("is_active = ? AND (expires_at IS NULL OR expires_at >= ?)", true, now).
		Order("points_required asc").
		Find(&coupons).Error; err != nil {
		return nil, err
	}

	return coupons, nil
}

func (r *CouponRepository) GetByID(id uint) (*models.Coupon, error) {
	var coupon models.Coupon
	if err := r.db.First(&coupon, id).Error; err != nil {
		return nil, err
	}

	return &coupon, nil
}

func (r *CouponRepository) SaveUserCoupon(userCoupon *models.UserCoupon) error {
	return r.db.Create(userCoupon).Error
}

func (r *CouponRepository) ListUserCoupons(userID uint) ([]models.UserCoupon, error) {
	var userCoupons []models.UserCoupon
	if err := r.db.Preload("Coupon").Where("user_id = ?", userID).Order("created_at desc").Find(&userCoupons).Error; err != nil {
		return nil, err
	}

	return userCoupons, nil
}

func (r *CouponRepository) ListRedeemableByPoints(points int) ([]models.Coupon, error) {
	var coupons []models.Coupon
	now := time.Now()
	if err := r.db.
		Where("is_active = ? AND points_required <= ? AND (expires_at IS NULL OR expires_at >= ?)", true, points, now).
		Order("points_required asc").
		Find(&coupons).Error; err != nil {
		return nil, err
	}

	return coupons, nil
}
