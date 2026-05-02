package handlers

import (
	"net/http"

	"essensefit/backend/services"

	"github.com/gin-gonic/gin"
)

type CheckInHandler struct {
	checkInService *services.CheckInService
}

func NewCheckInHandler(checkInService *services.CheckInService) *CheckInHandler {
	return &CheckInHandler{checkInService: checkInService}
}

func (h *CheckInHandler) Create(c *gin.Context) {
	var input services.CreateCheckInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	checkIn, err := h.checkInService.Create(c.GetUint("userID"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, checkIn)
}

func (h *CheckInHandler) List(c *gin.Context) {
	checkIns, err := h.checkInService.ListByUser(c.GetUint("userID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, checkIns)
}

func (h *CheckInHandler) ListMy(c *gin.Context) {
	h.List(c)
}

func (h *CheckInHandler) ListAll(c *gin.Context) {
	checkIns, err := h.checkInService.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, checkIns)
}
