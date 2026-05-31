package handlers

import (
	"net/http"

	"essensefit/backend/services"

	"github.com/gin-gonic/gin"
)

type AccountCreditHandler struct {
	accountCreditService *services.AccountCreditService
}

func NewAccountCreditHandler(accountCreditService *services.AccountCreditService) *AccountCreditHandler {
	return &AccountCreditHandler{accountCreditService: accountCreditService}
}

func (h *AccountCreditHandler) TopUp(c *gin.Context) {
	var input services.TopUpAccountCreditInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.accountCreditService.TopUp(c.GetUint("userID"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}
