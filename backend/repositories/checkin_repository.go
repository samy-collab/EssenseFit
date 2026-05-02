package repositories

import (
	"essensefit/backend/models"
	"time"

	"gorm.io/gorm"
)

type CheckInRepository struct {
	db *gorm.DB
}

func NewCheckInRepository(db *gorm.DB) *CheckInRepository {
	return &CheckInRepository{db: db}
}

func (r *CheckInRepository) Create(checkIn *models.CheckIn) error {
	return r.db.Create(checkIn).Error
}

func (r *CheckInRepository) ListByUser(userID uint) ([]models.CheckIn, error) {
	var checkIns []models.CheckIn
	if err := r.db.Where("user_id = ?", userID).Order("checked_in_at desc").Find(&checkIns).Error; err != nil {
		return nil, err
	}

	return checkIns, nil
}

func (r *CheckInRepository) ListAll() ([]models.CheckIn, error) {
	var checkIns []models.CheckIn
	if err := r.db.Order("checked_in_at desc").Find(&checkIns).Error; err != nil {
		return nil, err
	}

	return checkIns, nil
}

func (r *CheckInRepository) HasCheckInOnDate(userID uint, date time.Time) (bool, error) {
	var count int64
	if err := r.db.Model(&models.CheckIn{}).
		Where("user_id = ? AND checkin_day = ?", userID, date.Format("2006-01-02")).
		Count(&count).Error; err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *CheckInRepository) CountByUser(userID uint) (int64, error) {
	var count int64
	if err := r.db.Model(&models.CheckIn{}).Where("user_id = ?", userID).Count(&count).Error; err != nil {
		return 0, err
	}

	return count, nil
}
