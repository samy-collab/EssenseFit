package routes

import (
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func registerOrderRoutes(router gin.IRouter, orderHandler *handlers.OrderHandler) {
	router.POST("/orders", orderHandler.Create)
	router.GET("/orders/my", orderHandler.ListMyOrders)
	router.GET("/orders/:id", orderHandler.GetByID)
}

func registerProtectedOrderAdminRoutes(protected *gin.RouterGroup, orderHandler *handlers.OrderHandler) {
	admin := protected.Group("/")
	admin.Use(middlewares.AdminMiddleware())
	admin.GET("/orders", orderHandler.ListAll)
	admin.PATCH("/orders/:id/status", orderHandler.UpdateStatus)
}
