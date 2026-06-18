package services

import (
	"errors"
	"fmt"

	"essensefit/backend/models"
	"essensefit/backend/repositories"
	"gorm.io/gorm"
)

type AccountCreditService struct {
	db       *gorm.DB
	userRepo *repositories.UserRepository
}

type TopUpAccountCreditInput struct {
	Amount        float64 `json:"amount" binding:"required,gt=0"`
	PaymentMethod string  `json:"payment_method" binding:"required,oneof=pix cartao boleto"`
}

func NewAccountCreditService(db *gorm.DB, userRepo *repositories.UserRepository) *AccountCreditService {
	return &AccountCreditService{db: db, userRepo: userRepo}
}

func (s *AccountCreditService) TopUp(userID uint, input TopUpAccountCreditInput) (*models.User, error) {
	if input.Amount <= 0 {
		return nil, errors.New("amount must be greater than zero")
	}

	var user *models.User
	err := s.db.Transaction(func(tx *gorm.DB) error {
		var lockedUser models.User
		if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&lockedUser, userID).Error; err != nil {
			return err
		}

		lockedUser.AccountCredit += input.Amount
		if err := tx.Save(&lockedUser).Error; err != nil {
			return err
		}

		transaction := models.AccountCreditTransaction{
			UserID:        userID,
			Type:          "credit",
			Amount:        input.Amount,
			PaymentMethod: input.PaymentMethod,
			Description:   fmt.Sprintf("Crédito adicionado via %s", input.PaymentMethod),
		}
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		user = &lockedUser
		return nil
	})
	if err != nil {
		return nil, err
	}

	return user, nil
}
