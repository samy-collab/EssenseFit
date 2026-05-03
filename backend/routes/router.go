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
	uploadHandler *handlers.UploadHandler,
) *gin.Engine {
	router := gin.Default()
	router.MaxMultipartMemory = 8 << 20
	router.Use(corsMiddleware(cfg))
	router.Static("/uploads", "uploads")

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
	registerProtectedUploadRoutes(protected, uploadHandler)
	registerProtectedProductRoutes(protected, productHandler)
	registerOrderRoutes(protected, orderHandler)
	registerProtectedOrderAdminRoutes(protected, orderHandler)
	registerCheckInRoutes(protected, checkInHandler)
	registerAdminCheckInRoutes(protected, checkInHandler)
	registerProtectedCouponRoutes(protected, couponHandler)
	registerPointRoutes(protected, pointHandler)

	protectedRoot := router.Group("/")
	protectedRoot.Use(middlewares.AuthMiddleware(cfg.JWTSecret))
	registerProtectedUploadRoutes(protectedRoot, uploadHandler)
	registerOrderRoutes(protectedRoot, orderHandler)
	registerCheckInRoutes(protectedRoot, checkInHandler)
	registerPointRoutes(protectedRoot, pointHandler)
	registerProtectedCouponRoutes(protectedRoot, couponHandler)
	registerProtectedProductRoutes(protectedRoot, productHandler)
	registerProtectedOrderAdminRoutes(protectedRoot, orderHandler)
	registerAdminCheckInRoutes(protectedRoot, checkInHandler)

	return router
}

func registerProtectedUploadRoutes(protected *gin.RouterGroup, uploadHandler *handlers.UploadHandler) {
	admin := protected.Group("/")
	admin.Use(middlewares.AdminMiddleware())
	admin.POST("/uploads", uploadHandler.UploadImage)
}

func corsMiddleware(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		allowedOrigin := origin
		if allowedOrigin == "" {
			allowedOrigin = "http://localhost:3000"
		}

		c.Header("Access-Control-Allow-Origin", allowedOrigin)
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Vary", "Origin")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
