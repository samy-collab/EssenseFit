package routes

import (
	"essensefit/backend/controllers/handlers"
	"essensefit/backend/middlewares"

	"github.com/gin-gonic/gin"
)

func registerPublicProductRoutes(router gin.IRouter, productHandler *handlers.ProductHandler) {
	router.GET("/products", productHandler.List)
	router.GET("/products/:id", productHandler.GetByID)
}

func registerProtectedProductRoutes(protected *gin.RouterGroup, productHandler *handlers.ProductHandler) {
	admin := protected.Group("/")
	admin.Use(middlewares.AdminMiddleware())
	admin.GET("/admin/products", productHandler.ListAll)
	admin.POST("/products", productHandler.Create)
	admin.PUT("/products/:id", productHandler.Update)
	admin.DELETE("/products/:id", productHandler.Delete)
}
