package routes

import (
	"essensefit/backend/controllers/handlers"

	"github.com/gin-gonic/gin"
)

func registerAccountCreditRoutes(router gin.IRouter, accountCreditHandler *handlers.AccountCreditHandler) {
	router.POST("/account-credit/top-up", accountCreditHandler.TopUp)
}
