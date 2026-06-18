package services

import (
	"errors"
	"fmt"
	"strings"
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
	UserCouponID    *uint             `json:"user_coupon_id"`
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
		order.DiscountAmount = 0
		order.TotalAmount = subtotal
		order.Items = items

		var appliedUserCoupon *models.UserCoupon
		if input.UserCouponID != nil {
			userCoupon, discountAmount, err := s.applyCoupon(tx, userID, *input.UserCouponID, subtotal)
			if err != nil {
				return err
			}

			appliedUserCoupon = userCoupon
			order.DiscountAmount = discountAmount
			order.TotalAmount = subtotal - discountAmount
			if order.TotalAmount < 0 {
				order.TotalAmount = 0
			}
		}

		if input.PaymentMethod == "account_credit" && !strings.EqualFold(user.Role, "ADMIN") {
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
				Description:   "Pagamento de pedido com crédito na conta",
			}
			if err := tx.Create(&transaction).Error; err != nil {
				return err
			}
		}

		if err := tx.Create(order).Error; err != nil {
			return err
		}

		if appliedUserCoupon != nil {
			now := time.Now()
			appliedUserCoupon.Status = "used"
			appliedUserCoupon.OrderID = &order.ID
			appliedUserCoupon.UsedAt = &now
			if err := tx.Save(appliedUserCoupon).Error; err != nil {
				return err
			}
		}

		return s.unlockCheckInForFirstPurchase(tx, userID)
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

			user.HasFirstPurchase = true
			user.CheckInUnlocked = true
			user.ConfirmedOrders++
			return tx.Save(user).Error
		}

		return nil
	})
	if err != nil {
		return nil, err
	}

	return order, nil
}

func (s *OrderService) applyCoupon(tx *gorm.DB, userID uint, userCouponID uint, subtotal float64) (*models.UserCoupon, float64, error) {
	var userCoupon models.UserCoupon
	if err := tx.Preload("Coupon").
		Where("id = ? AND user_id = ?", userCouponID, userID).
		First(&userCoupon).Error; err != nil {
		return nil, 0, errors.New("coupon not found")
	}

	if userCoupon.Status != "unused" {
		return nil, 0, errors.New("coupon already used")
	}
	if !userCoupon.Coupon.IsActive {
		return nil, 0, errors.New("coupon is inactive")
	}
	if userCoupon.Coupon.ExpiresAt != nil && userCoupon.Coupon.ExpiresAt.Before(time.Now()) {
		return nil, 0, errors.New("coupon has expired")
	}
	if userCoupon.Coupon.MinOrderAmount > subtotal {
		return nil, 0, errors.New("order total is below coupon minimum")
	}

	discountAmount := userCoupon.Coupon.DiscountValue
	if userCoupon.Coupon.DiscountType == "percentage" {
		discountAmount = subtotal * userCoupon.Coupon.DiscountValue / 100
	}
	if discountAmount > subtotal {
		discountAmount = subtotal
	}
	if discountAmount < 0 {
		discountAmount = 0
	}

	return &userCoupon, discountAmount, nil
}

func (s *OrderService) unlockCheckInForFirstPurchase(tx *gorm.DB, userID uint) error {
	return tx.Model(&models.User{}).
		Where("id = ? AND check_in_unlocked = ?", userID, false).
		Updates(map[string]any{
			"has_first_purchase": true,
			"check_in_unlocked":  true,
		}).Error
}

func generateOrderNumber() string {
	return fmt.Sprintf("EF-%d", time.Now().UnixNano())
}
