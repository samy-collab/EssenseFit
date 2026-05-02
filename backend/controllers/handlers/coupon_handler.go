package handlers

import (
	"net/http"

	"essensefit/backend/services"

	"github.com/gin-gonic/gin"
)

type CouponHandler struct {
	couponService *services.CouponService
}

func NewCouponHandler(couponService *services.CouponService) *CouponHandler {
	return &CouponHandler{couponService: couponService}
}

func (h *CouponHandler) Create(c *gin.Context) {
	var input services.CreateCouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	coupon, err := h.couponService.Create(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, coupon)
}

func (h *CouponHandler) List(c *gin.Context) {
	coupons, err := h.couponService.ListActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coupons)
}

func (h *CouponHandler) Redeem(c *gin.Context) {
	var input services.RedeemCouponInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userCoupon, err := h.couponService.Redeem(c.GetUint("userID"), input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, userCoupon)
}

func (h *CouponHandler) MyCoupons(c *gin.Context) {
	coupons, err := h.couponService.ListUserCoupons(c.GetUint("userID"))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, coupons)
}
