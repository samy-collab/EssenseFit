package routes

import (
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func registerPublicCouponRoutes(router gin.IRouter, couponHandler *handlers.CouponHandler) {
	router.GET("/coupons", couponHandler.List)
}

func registerProtectedCouponRoutes(protected *gin.RouterGroup, couponHandler *handlers.CouponHandler) {
	admin := protected.Group("/")
	admin.Use(middlewares.AdminMiddleware())
	admin.POST("/coupons", couponHandler.Create)

	protected.POST("/coupons/redeem", couponHandler.Redeem)
	protected.GET("/coupons/my", couponHandler.MyCoupons)
}
