package routes

import (
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func registerAuthRoutes(router gin.IRouter, authHandler *handlers.AuthHandler) {
	auth := router.Group("/auth")
	auth.POST("/register", authHandler.Register)
	auth.POST("/login", authHandler.Login)
	auth.GET("/strava/login", authHandler.StravaLogin)
	auth.GET("/strava/callback", authHandler.StravaCallback)
}

func registerProtectedAuthRoutes(router gin.IRouter, authHandler *handlers.AuthHandler, jwtSecret string) {
	auth := router.Group("/auth")
	auth.Use(middlewares.AuthMiddleware(jwtSecret))
	auth.GET("/me", authHandler.Profile)
	auth.PATCH("/me/photo", authHandler.UpdateProfilePhoto)
}
