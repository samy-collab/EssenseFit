package handlers

import (
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"

	"essensefit/backend/services"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
	frontendURL string
	uploadDir   string
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) SetFrontendURL(frontendURL string) {
	h.frontendURL = strings.TrimRight(frontendURL, "/")
}

func (h *AuthHandler) SetUploadDir(uploadDir string) {
	h.uploadDir = uploadDir
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input services.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.authService.Register(input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user, "token": token})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input services.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, token, err := h.authService.Login(input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user, "token": token})
}

func (h *AuthHandler) StravaLogin(c *gin.Context) {
	state, err := h.authService.GenerateOAuthState()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not start strava login"})
		return
	}

	approvalPrompt := "auto"
	if c.Query("approval_prompt") == "force" {
		approvalPrompt = "force"
	}

	authURL, err := h.authService.BuildStravaAuthorizationURL(state, approvalPrompt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie("strava_oauth_state", state, 600, "/", "", false, true)
	c.Redirect(http.StatusFound, authURL)
}

func (h *AuthHandler) StravaCallback(c *gin.Context) {
	if denied := c.Query("error"); denied != "" {
		h.redirectToStravaCallback(c, "", denied)
		return
	}

	expectedState, err := c.Cookie("strava_oauth_state")
	if err != nil || expectedState == "" || expectedState != c.Query("state") {
		h.redirectToStravaCallback(c, "", "invalid_state")
		return
	}

	_, token, err := h.authService.LoginWithStravaCode(c.Query("code"))
	if err != nil {
		h.redirectToStravaCallback(c, "", "strava_login_failed")
		return
	}

	c.SetCookie("strava_oauth_state", "", -1, "/", "", false, true)
	h.redirectToStravaCallback(c, token, "")
}

func (h *AuthHandler) Profile(c *gin.Context) {
	userID := c.GetUint("userID")
	user, err := h.authService.GetProfile(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func (h *AuthHandler) UpdateProfilePhoto(c *gin.Context) {
	fileHeader, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image file is required"})
		return
	}

	if fileHeader.Size > maxUploadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "image must be up to 5MB"})
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not open image"})
		return
	}
	defer file.Close()

	buffer := make([]byte, 512)
	readBytes, err := file.Read(buffer)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not read image"})
		return
	}

	extension, ok := extensionForContentType(http.DetectContentType(buffer[:readBytes]))
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported image format"})
		return
	}

	if _, err := file.Seek(0, 0); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not process image"})
		return
	}

	uploadDir := h.uploadDir
	if uploadDir == "" {
		uploadDir = "uploads"
	}
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not prepare upload folder"})
		return
	}

	fileName, err := randomFileName(extension)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create file name"})
		return
	}

	if err := c.SaveUploadedFile(fileHeader, filepath.Join(uploadDir, fileName)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save image"})
		return
	}

	user, err := h.authService.UpdateProfileImage(c.GetUint("userID"), publicUploadURL(c, fileName))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func (h *AuthHandler) redirectToStravaCallback(c *gin.Context, token string, errorCode string) {
	frontendURL := h.frontendURL
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	values := url.Values{}
	if token != "" {
		values.Set("token", token)
	}
	if errorCode != "" {
		values.Set("error", errorCode)
	}

	c.Redirect(http.StatusFound, frontendURL+"/login/strava/callback#"+values.Encode())
}
