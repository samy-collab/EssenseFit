package routes

import (
	"essensefit/backend/controllers/handlers"

	"github.com/gin-gonic/gin"
)

func registerPointRoutes(router gin.IRouter, pointHandler *handlers.PointHandler) {
	router.GET("/points/my", pointHandler.MyPoints)
}
