package services

import (
	"errors"
	"time"

	"essensefit/backend/models"
	"essensefit/backend/repositories"
	"gorm.io/gorm"
)

type CheckInService struct {
	db                   *gorm.DB
	checkInRepo          *repositories.CheckInRepository
	userRepo             *repositories.UserRepository
	pointTransactionRepo *repositories.PointTransactionRepository
}

type CreateCheckInInput struct {
	ActivityType string `json:"activity_type" binding:"required,oneof=caminhada corrida academia pilates dança ciclismo funcional outro"`
	Description  string `json:"description" binding:"required"`
	Date         string `json:"date" binding:"required"`
	ImageURL     string `json:"image"`
}

func NewCheckInService(
	db *gorm.DB,
	checkInRepo *repositories.CheckInRepository,
	userRepo *repositories.UserRepository,
	pointTransactionRepo *repositories.PointTransactionRepository,
) *CheckInService {
	return &CheckInService{
		db:                   db,
		checkInRepo:          checkInRepo,
		userRepo:             userRepo,
		pointTransactionRepo: pointTransactionRepo,
	}
}

func (s *CheckInService) Create(userID uint, input CreateCheckInInput) (*models.CheckIn, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	if !user.HasFirstPurchase {
		return nil, errors.New("check-in area is locked until the first confirmed purchase")
	}

	checkInDate, err := time.Parse("2006-01-02", input.Date)
	if err != nil {
		return nil, errors.New("date must be in YYYY-MM-DD format")
	}

	hasCheckIn, err := s.checkInRepo.HasCheckInOnDate(userID, checkInDate)
	if err != nil {
		return nil, err
	}
	if hasCheckIn {
		return nil, errors.New("you can only create one check-in per day")
	}

	checkIn := &models.CheckIn{
		UserID:       userID,
		ActivityType: input.ActivityType,
		Description:  input.Description,
		ImageURL:     input.ImageURL,
		PointsEarned: 10,
		CheckInDay:   checkInDate,
		CheckInDate:  checkInDate,
	}

	err = s.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(checkIn).Error; err != nil {
			return err
		}

		user.Points += 10
		if err := tx.Save(user).Error; err != nil {
			return err
		}

		return tx.Create(&models.PointTransaction{
			UserID:      userID,
			Type:        "credit",
			Source:      "checkin",
			Points:      10,
			Description: "Check-in fitness validado",
		}).Error
	})
	if err != nil {
		return nil, err
	}

	return checkIn, nil
}

func (s *CheckInService) ListByUser(userID uint) ([]models.CheckIn, error) {
	return s.checkInRepo.ListByUser(userID)
}

func (s *CheckInService) ListAll() ([]models.CheckIn, error) {
	return s.checkInRepo.ListAll()
}
