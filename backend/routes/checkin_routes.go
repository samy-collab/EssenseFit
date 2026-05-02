package routes

import (
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func registerCheckInRoutes(router gin.IRouter, checkInHandler *handlers.CheckInHandler) {
	router.POST("/checkins", checkInHandler.Create)
	router.GET("/checkins/my", checkInHandler.ListMy)
}

func registerAdminCheckInRoutes(protected *gin.RouterGroup, checkInHandler *handlers.CheckInHandler) {
	admin := protected.Group("/")
	admin.Use(middlewares.AdminMiddleware())
	admin.GET("/checkins", checkInHandler.ListAll)
}
