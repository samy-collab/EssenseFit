package services

import (
	"errors"
	"fmt"
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
	ActivityType   string `json:"activity_type" binding:"required,oneof=caminhada corrida academia pilates dança ciclismo funcional outro"`
	DurationMin    int    `json:"duration_min" binding:"required,min=1"`
	CaloriesBurned int    `json:"calories_burned" binding:"omitempty,min=0"`
	Description    string `json:"description" binding:"required"`
	Date           string `json:"date" binding:"required"`
	ImageURL       string `json:"image"`
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

	if !user.CheckInUnlocked {
		return nil, errors.New("check-in area is locked until the first purchase")
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
		UserID:         userID,
		ActivityType:   input.ActivityType,
		DurationMin:    input.DurationMin,
		CaloriesBurned: input.CaloriesBurned,
		Description:    input.Description,
		ImageURL:       input.ImageURL,
		PointsEarned:   10,
		CheckInDay:     checkInDate,
		CheckInDate:    checkInDate,
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

func (s *CheckInService) currentStreak(tx *gorm.DB, userID uint, checkInDate time.Time) (int, error) {
	var checkIns []models.CheckIn
	if err := tx.Where("user_id = ? AND checkin_day <= ?", userID, checkInDate.Format("2006-01-02")).
		Order("checkin_day desc").
		Find(&checkIns).Error; err != nil {
		return 0, err
	}

	streak := 0
	expectedDay := dateOnly(checkInDate)
	for _, checkIn := range checkIns {
		day := dateOnly(checkIn.CheckInDay)
		if day.Equal(expectedDay) {
			streak++
			expectedDay = expectedDay.AddDate(0, 0, -1)
			continue
		}
		if day.Before(expectedDay) {
			break
		}
	}

	return streak, nil
}

func (s *CheckInService) awardStreakCoupon(tx *gorm.DB, userID uint, streak int, checkInDate time.Time) error {
	reward, ok := checkInRewardForStreak(streak)
	if !ok {
		return nil
	}

	code := fmt.Sprintf("CHECKIN%d-U%d-%s", streak, userID, checkInDate.Format("20060102"))
	expiresAt := time.Now().AddDate(0, 2, 0)
	coupon := models.Coupon{
		Code:           code,
		Title:          reward.title,
		Description:    reward.description,
		DiscountType:   "percentage",
		DiscountValue:  reward.discountValue,
		PointsRequired: 0,
		ExpiresAt:      &expiresAt,
		IsActive:       true,
	}

	if err := tx.Where("code = ?", code).FirstOrCreate(&coupon).Error; err != nil {
		return err
	}

	userCoupon := models.UserCoupon{
		UserID:     userID,
		CouponID:   coupon.ID,
		Status:     "unused",
		RedeemedAt: time.Now(),
	}

	return tx.Where("user_id = ? AND coupon_id = ?", userID, coupon.ID).FirstOrCreate(&userCoupon).Error
}

type checkInReward struct {
	title         string
	description   string
	discountValue float64
}

func checkInRewardForStreak(streak int) (checkInReward, bool) {
	switch streak {
	case 7:
		return checkInReward{
			title:         "Sequência fitness de 7 dias",
			description:   "Cupom conquistado por uma semana de check-ins diários.",
			discountValue: 5,
		}, true
	case 30:
		return checkInReward{
			title:         "Sequência fitness de 30 dias",
			description:   "Cupom conquistado por um mês de check-ins diários.",
			discountValue: 15,
		}, true
	default:
		return checkInReward{}, false
	}
}

func dateOnly(value time.Time) time.Time {
	year, month, day := value.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, time.UTC)
}

func (s *CheckInService) ListByUser(userID uint) ([]models.CheckIn, error) {
	return s.checkInRepo.ListByUser(userID)
}

func (s *CheckInService) ListAll() ([]models.CheckIn, error) {
	return s.checkInRepo.ListAll()
}
