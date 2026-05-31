package services

import (
	"errors"
	"fmt"
	"time"

	"essensefit/backend/models"
	"essensefit/backend/repositories"
	"gorm.io/gorm"
)

type OrderService struct {
	db          *gorm.DB
	orderRepo   *repositories.OrderRepository
	productRepo *repositories.ProductRepository
	userRepo    *repositories.UserRepository
}

type CreateOrderInput struct {
	Season          string            `json:"season"`
	PaymentMethod   string            `json:"payment_method"`
	ShippingAddress string            `json:"shipping_address"`
	Notes           string            `json:"notes"`
	Items           []CreateOrderItem `json:"items" binding:"required,min=1,dive"`
}

type CreateOrderItem struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type UpdateOrderStatusInput struct {
	Status string `json:"status" binding:"required,oneof=pending paid confirmed cancelled"`
}

func NewOrderService(
	db *gorm.DB,
	orderRepo *repositories.OrderRepository,
	productRepo *repositories.ProductRepository,
	userRepo *repositories.UserRepository,
) *OrderService {
	return &OrderService{
		db:          db,
		orderRepo:   orderRepo,
		productRepo: productRepo,
		userRepo:    userRepo,
	}
}

func (s *OrderService) Create(userID uint, input CreateOrderInput) (*models.Order, error) {
	var order *models.Order
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var user models.User
		if input.PaymentMethod == "account_credit" {
			if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&user, userID).Error; err != nil {
				return err
			}
		}

		order = &models.Order{
			UserID:          userID,
			OrderNumber:     generateOrderNumber(),
			Status:          "pending",
			Season:          input.Season,
			PaymentMethod:   input.PaymentMethod,
			ShippingAddress: input.ShippingAddress,
			Notes:           input.Notes,
		}

		subtotal := 0.0
		items := make([]models.OrderItem, 0, len(input.Items))

		for _, item := range input.Items {
			product, err := s.productRepo.GetByID(item.ProductID)
			if err != nil {
				return err
			}

			if item.Quantity > product.Stock {
				return errors.New("insufficient stock")
			}

			product.Stock -= item.Quantity
			if err := tx.Save(product).Error; err != nil {
				return err
			}

			orderItem := models.OrderItem{
				ProductID:   item.ProductID,
				ProductName: product.Name,
				SizeLabel:   product.SizeLabel,
				Color:       product.Color,
				Quantity:    item.Quantity,
				UnitPrice:   product.Price,
				LineTotal:   product.Price * float64(item.Quantity),
			}
			items = append(items, orderItem)
			subtotal += orderItem.LineTotal
		}

		order.SubtotalAmount = subtotal
		order.TotalAmount = subtotal
		order.Items = items

		if input.PaymentMethod == "account_credit" {
			if user.AccountCredit < order.TotalAmount {
				return errors.New("insufficient account credit")
			}
			user.AccountCredit -= order.TotalAmount
			if err := tx.Save(&user).Error; err != nil {
				return err
			}
			transaction := models.AccountCreditTransaction{
				UserID:        userID,
				Type:          "debit",
				Amount:        order.TotalAmount,
				PaymentMethod: "account_credit",
				Description:   "Pagamento de pedido com credito na conta",
			}
			if err := tx.Create(&transaction).Error; err != nil {
				return err
			}
		}

		return tx.Create(order).Error
	})
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *OrderService) ListByUser(userID uint) ([]models.Order, error) {
	return s.orderRepo.ListByUser(userID)
}

func (s *OrderService) ListAll() ([]models.Order, error) {
	return s.orderRepo.ListAll()
}

func (s *OrderService) GetByID(userID uint, orderID uint) (*models.Order, error) {
	return s.orderRepo.GetByIDAndUser(orderID, userID)
}

func (s *OrderService) UpdateStatus(orderID uint, input UpdateOrderStatusInput) (*models.Order, error) {
	order, err := s.orderRepo.GetByID(orderID)
	if err != nil {
		return nil, err
	}

	previousStatus := order.Status
	order.Status = input.Status

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Session(&gorm.Session{FullSaveAssociations: true}).Updates(order).Error; err != nil {
			return err
		}

		if previousStatus != "paid" && input.Status == "paid" {
			now := time.Now()
			order.ConfirmedAt = &now
			if err := tx.Session(&gorm.Session{FullSaveAssociations: true}).Updates(order).Error; err != nil {
				return err
			}

			user, err := s.userRepo.GetByID(order.UserID)
			if err != nil {
				return err
			}

			if !user.HasFirstPurchase {
				user.HasFirstPurchase = true
				user.CheckInUnlocked = true
				user.ConfirmedOrders++
			}
			return tx.Save(user).Error
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return order, nil
}

func generateOrderNumber() string {
	return fmt.Sprintf("EF-%d", time.Now().UnixNano())
}
