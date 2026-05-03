package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

const maxUploadSize = 5 << 20

type UploadHandler struct {
	uploadDir string
}

func NewUploadHandler(uploadDir string) *UploadHandler {
	return &UploadHandler{uploadDir: uploadDir}
}

func (h *UploadHandler) UploadImage(c *gin.Context) {
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

	contentType := http.DetectContentType(buffer[:readBytes])
	extension, ok := extensionForContentType(contentType)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unsupported image format"})
		return
	}

	if _, err := file.Seek(0, 0); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "could not process image"})
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not prepare upload folder"})
		return
	}

	fileName, err := randomFileName(extension)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create file name"})
		return
	}

	destination := filepath.Join(h.uploadDir, fileName)
	if err := c.SaveUploadedFile(fileHeader, destination); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not save image"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"url": publicUploadURL(c, fileName)})
}

func extensionForContentType(contentType string) (string, bool) {
	switch strings.ToLower(contentType) {
	case "image/jpeg":
		return ".jpg", true
	case "image/png":
		return ".png", true
	case "image/webp":
		return ".webp", true
	case "image/gif":
		return ".gif", true
	default:
		return "", false
	}
}

func randomFileName(extension string) (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return fmt.Sprintf("%s%s", hex.EncodeToString(bytes), extension), nil
}

func publicUploadURL(c *gin.Context, fileName string) string {
	scheme := "http"
	if c.Request.TLS != nil {
		scheme = "https"
	}

	return fmt.Sprintf("%s://%s/uploads/%s", scheme, c.Request.Host, fileName)
}
