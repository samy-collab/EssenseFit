package repositories

import (
	"essensefit/backend/models"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) Create(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *OrderRepository) ListByUser(userID uint) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items").Where("user_id = ?", userID).Order("created_at desc").Find(&orders).Error; err != nil {
		return nil, err
	}

	return orders, nil
}

func (r *OrderRepository) ListAll() ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Preload("Items").Order("created_at desc").Find(&orders).Error; err != nil {
		return nil, err
	}

	return orders, nil
}

func (r *OrderRepository) GetByID(id uint) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("Items").First(&order, id).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) GetByIDAndUser(id uint, userID uint) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("Items").Where("id = ? AND user_id = ?", id, userID).First(&order).Error; err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) Update(order *models.Order) error {
	return r.db.Session(&gorm.Session{FullSaveAssociations: true}).Updates(order).Error
}
