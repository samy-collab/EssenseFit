package services

import (
	"essensefit/backend/models"
	"essensefit/backend/repositories"
)

type PointService struct {
	userRepo             *repositories.UserRepository
	checkInRepo          *repositories.CheckInRepository
	couponRepo           *repositories.CouponRepository
	pointTransactionRepo *repositories.PointTransactionRepository
}

type MyPointsResponse struct {
	TotalPoints      int                       `json:"total_points"`
	CheckInCount     int64                     `json:"check_in_count"`
	AvailableCoupons []models.Coupon           `json:"available_coupons"`
	PointsHistory    []models.PointTransaction `json:"points_history"`
}

func NewPointService(
	userRepo *repositories.UserRepository,
	checkInRepo *repositories.CheckInRepository,
	couponRepo *repositories.CouponRepository,
	pointTransactionRepo *repositories.PointTransactionRepository,
) *PointService {
	return &PointService{
		userRepo:             userRepo,
		checkInRepo:          checkInRepo,
		couponRepo:           couponRepo,
		pointTransactionRepo: pointTransactionRepo,
	}
}

func (s *PointService) GetMyPoints(userID uint) (*MyPointsResponse, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	checkInCount, err := s.checkInRepo.CountByUser(userID)
	if err != nil {
		return nil, err
	}

	coupons, err := s.couponRepo.ListRedeemableByPoints(user.Points)
	if err != nil {
		return nil, err
	}

	history, err := s.pointTransactionRepo.ListByUser(userID)
	if err != nil {
		return nil, err
	}

	return &MyPointsResponse{
		TotalPoints:      user.Points,
		CheckInCount:     checkInCount,
		AvailableCoupons: coupons,
		PointsHistory:    history,
	}, nil
}

func (s *PointService) RegisterTransaction(transaction *models.PointTransaction) error {
	return s.pointTransactionRepo.Create(transaction)
}
