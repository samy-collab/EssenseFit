package repositories

import (
	"essensefit/backend/models"

	"gorm.io/gorm"
)

type PointTransactionRepository struct {
	db *gorm.DB
}

func NewPointTransactionRepository(db *gorm.DB) *PointTransactionRepository {
	return &PointTransactionRepository{db: db}
}

func (r *PointTransactionRepository) Create(transaction *models.PointTransaction) error {
	return r.db.Create(transaction).Error
}

func (r *PointTransactionRepository) ListByUser(userID uint) ([]models.PointTransaction, error) {
	var transactions []models.PointTransaction
	if err := r.db.Where("user_id = ?", userID).Order("created_at desc").Find(&transactions).Error; err != nil {
		return nil, err
	}

	return transactions, nil
}
