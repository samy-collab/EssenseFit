package repositories

import (
	"essensefit/backend/models"
	"strings"

	"gorm.io/gorm"
)

type ProductRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

func (r *ProductRepository) Create(product *models.Product) error {
	return r.db.Create(product).Error
}

func (r *ProductRepository) List(season string) ([]models.Product, error) {
	var products []models.Product
	query := r.db.Where("is_active = ?", true)
	if season != "" {
		normalized := strings.ToLower(season)
		if normalized == "verao" {
			query = query.Where("LOWER(season) IN ?", []string{"verao", "verão"})
		} else {
			query = query.Where("LOWER(season) = ?", normalized)
		}
	}

	if err := query.Order("created_at desc").Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductRepository) ListAll() ([]models.Product, error) {
	var products []models.Product
	if err := r.db.Order("created_at desc").Find(&products).Error; err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductRepository) GetByID(id uint) (*models.Product, error) {
	var product models.Product
	if err := r.db.First(&product, id).Error; err != nil {
		return nil, err
	}

	return &product, nil
}

func (r *ProductRepository) Update(product *models.Product) error {
	return r.db.Save(product).Error
}

func (r *ProductRepository) Delete(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}
