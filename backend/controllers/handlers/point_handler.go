package handlers

import (
	"net/http"

	"essensefit/backend/services"

	"github.com/gin-gonic/gin"
)

type PointHandler struct {
	pointService *services.PointService
}

func NewPointHandler(pointService *services.PointService) *PointHandler {
	return &PointHandler{pointService: pointService}
}

func (h *PointHandler) MyPoints(c *gin.Context) {
	response, err := h.pointService.GetMyPoints(c.GetUint("userID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}
