package services

import (
	"fmt"
	"strings"

	"essensefit/backend/models"
	"essensefit/backend/repositories"
)

type ProductService struct {
	productRepo *repositories.ProductRepository
}

type CreateProductInput struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required,gt=0"`
	SizeLabel   string  `json:"size" binding:"required"`
	Color       string  `json:"color" binding:"required"`
	Stock       int     `json:"stock" binding:"required,min=0"`
	Season      string  `json:"season" binding:"required"`
	ImageURL    string  `json:"image" binding:"required"`
	IsActive    *bool   `json:"active"`
}

func NewProductService(productRepo *repositories.ProductRepository) *ProductService {
	return &ProductService{productRepo: productRepo}
}

func (s *ProductService) Create(input CreateProductInput) (*models.Product, error) {
	season := normalizeSeason(input.Season)
	if !isValidSeason(season) {
		return nil, fmt.Errorf("invalid season")
	}

	isActive := true
	if input.IsActive != nil {
		isActive = *input.IsActive
	}

	product := &models.Product{
		Name:        input.Name,
		Slug:        slugify(input.Name),
		Description: input.Description,
		Category:    "fitness-feminino",
		Season:      season,
		Color:       input.Color,
		SizeLabel:   input.SizeLabel,
		Price:       input.Price,
		Stock:       input.Stock,
		ImageURL:    input.ImageURL,
		IsActive:    isActive,
	}

	if err := s.productRepo.Create(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) List(season string) ([]models.Product, error) {
	return s.productRepo.List(season)
}

func (s *ProductService) GetByID(id uint) (*models.Product, error) {
	return s.productRepo.GetByID(id)
}

func (s *ProductService) Update(id uint, input CreateProductInput) (*models.Product, error) {
	product, err := s.productRepo.GetByID(id)
	if err != nil {
		return nil, err
	}

	season := normalizeSeason(input.Season)
	if !isValidSeason(season) {
		return nil, fmt.Errorf("invalid season")
	}

	product.Name = input.Name
	product.Slug = slugify(input.Name)
	product.Description = input.Description
	product.Season = season
	product.Color = input.Color
	product.SizeLabel = input.SizeLabel
	product.Price = input.Price
	product.Stock = input.Stock
	product.ImageURL = input.ImageURL
	if input.IsActive != nil {
		product.IsActive = *input.IsActive
	}

	if err := s.productRepo.Update(product); err != nil {
		return nil, err
	}

	return product, nil
}

func (s *ProductService) Delete(id uint) error {
	return s.productRepo.Delete(id)
}

func slugify(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	replacer := strings.NewReplacer(
		" ", "-",
		"/", "-",
		"_", "-",
		"--", "-",
	)
	slug = replacer.Replace(slug)
	slug = strings.Trim(slug, "-")
	if slug == "" {
		return "produto"
	}
	return slug
}

func normalizeSeason(season string) string {
	normalized := strings.TrimSpace(strings.ToLower(season))
	if normalized == "verão" {
		return "verao"
	}
	return normalized
}

func isValidSeason(season string) bool {
	switch season {
	case "inverno", "outono", "verao", "primavera":
		return true
	default:
		return false
	}
}
