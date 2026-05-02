package routes

import (
	"essensefit/backend/config"
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRouter(
	cfg config.Config,
	authHandler *handlers.AuthHandler,
	productHandler *handlers.ProductHandler,
	orderHandler *handlers.OrderHandler,
	checkInHandler *handlers.CheckInHandler,
	couponHandler *handlers.CouponHandler,
	pointHandler *handlers.PointHandler,
) *gin.Engine {
	router := gin.Default()

	registerAuthRoutes(router, authHandler)
	registerProtectedAuthRoutes(router, authHandler, cfg.JWTSecret)
	registerPublicProductRoutes(router, productHandler)
	registerPublicCouponRoutes(router, couponHandler)

	api := router.Group("/api")
	registerAuthRoutes(api, authHandler)
	registerPublicProductRoutes(api, productHandler)
	registerPublicCouponRoutes(api, couponHandler)

	protected := api.Group("/")
	protected.Use(middlewares.AuthMiddleware(cfg.JWTSecret))
	registerProtectedProductRoutes(protected, productHandler)
	registerOrderRoutes(protected, orderHandler)
	registerProtectedOrderAdminRoutes(protected, orderHandler)
	registerCheckInRoutes(protected, checkInHandler)
	registerAdminCheckInRoutes(protected, checkInHandler)
	registerProtectedCouponRoutes(protected, couponHandler)
	registerPointRoutes(protected, pointHandler)

	protectedRoot := router.Group("/")
	protectedRoot.Use(middlewares.AuthMiddleware(cfg.JWTSecret))
	registerOrderRoutes(protectedRoot, orderHandler)
	registerCheckInRoutes(protectedRoot, checkInHandler)
	registerPointRoutes(protectedRoot, pointHandler)
	registerProtectedCouponRoutes(protectedRoot, couponHandler)
	registerProtectedProductRoutes(protectedRoot, productHandler)
	registerProtectedOrderAdminRoutes(protectedRoot, orderHandler)
	registerAdminCheckInRoutes(protectedRoot, checkInHandler)

	return router
}
