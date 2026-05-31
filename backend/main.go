package main

import (
	"log"

	"essensefit/backend/config"
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/repositories"
	"essensefit/backend/routes"
	"essensefit/backend/services"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	db, err := config.NewDatabase(cfg)
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	if err := config.RunMigrations(db); err != nil {
		log.Fatalf("failed to migrate database: %v", err)
	}

	userRepo := repositories.NewUserRepository(db)
	productRepo := repositories.NewProductRepository(db)
	orderRepo := repositories.NewOrderRepository(db)
	checkInRepo := repositories.NewCheckInRepository(db)
	couponRepo := repositories.NewCouponRepository(db)
	pointTransactionRepo := repositories.NewPointTransactionRepository(db)

	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	authService.ConfigureStrava(cfg.StravaClientID, cfg.StravaClientSecret, cfg.StravaRedirectURL)
	productService := services.NewProductService(productRepo)
	orderService := services.NewOrderService(db, orderRepo, productRepo, userRepo)
	checkInService := services.NewCheckInService(db, checkInRepo, userRepo, pointTransactionRepo)
	couponService := services.NewCouponService(db, couponRepo, userRepo, pointTransactionRepo)
	pointService := services.NewPointService(userRepo, checkInRepo, couponRepo, pointTransactionRepo)
	accountCreditService := services.NewAccountCreditService(db, userRepo)

	authHandler := handlers.NewAuthHandler(authService)
	authHandler.SetFrontendURL(cfg.FrontendURL)
	authHandler.SetUploadDir("uploads")
	productHandler := handlers.NewProductHandler(productService)
	orderHandler := handlers.NewOrderHandler(orderService)
	checkInHandler := handlers.NewCheckInHandler(checkInService)
	couponHandler := handlers.NewCouponHandler(couponService)
	pointHandler := handlers.NewPointHandler(pointService)
	accountCreditHandler := handlers.NewAccountCreditHandler(accountCreditService)
	uploadHandler := handlers.NewUploadHandler("uploads")

	router := routes.SetupRouter(
		cfg,
		authHandler,
		productHandler,
		orderHandler,
		checkInHandler,
		couponHandler,
		pointHandler,
		accountCreditHandler,
		uploadHandler,
	)

	if err := router.Run(":" + cfg.ServerPort); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
