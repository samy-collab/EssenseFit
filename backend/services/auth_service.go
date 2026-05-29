package services

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"essensefit/backend/models"
	"essensefit/backend/repositories"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService struct {
	userRepo           *repositories.UserRepository
	jwtSecret          string
	stravaClientID     string
	stravaClientSecret string
	stravaRedirectURL  string
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func NewAuthService(userRepo *repositories.UserRepository, jwtSecret string) *AuthService {
	return &AuthService{userRepo: userRepo, jwtSecret: jwtSecret}
}

func (s *AuthService) ConfigureStrava(clientID, clientSecret, redirectURL string) {
	s.stravaClientID = clientID
	s.stravaClientSecret = clientSecret
	s.stravaRedirectURL = redirectURL
}

func (s *AuthService) Register(input RegisterInput) (*models.User, string, error) {
	_, err := s.userRepo.GetByEmail(input.Email)
	if err == nil {
		return nil, "", errors.New("email already registered")
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, "", err
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	user := &models.User{
		Name:         input.Name,
		Email:        input.Email,
		PasswordHash: string(hash),
		Role:         "CUSTOMER",
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, "", err
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) BuildStravaAuthorizationURL(state string, approvalPrompt string) (string, error) {
	if s.stravaClientID == "" || s.stravaClientSecret == "" || s.stravaRedirectURL == "" {
		return "", errors.New("strava integration is not configured")
	}
	if approvalPrompt != "force" {
		approvalPrompt = "auto"
	}

	values := url.Values{}
	values.Set("client_id", s.stravaClientID)
	values.Set("redirect_uri", s.stravaRedirectURL)
	values.Set("response_type", "code")
	values.Set("approval_prompt", approvalPrompt)
	values.Set("scope", "read,profile:read_all")
	values.Set("state", state)

	return "https://www.strava.com/oauth/authorize?" + values.Encode(), nil
}

func (s *AuthService) LoginWithStravaCode(code string) (*models.User, string, error) {
	if code == "" {
		return nil, "", errors.New("strava authorization code is required")
	}
	if s.stravaClientID == "" || s.stravaClientSecret == "" || s.stravaRedirectURL == "" {
		return nil, "", errors.New("strava integration is not configured")
	}

	tokenResponse, err := s.exchangeStravaCode(code)
	if err != nil {
		return nil, "", err
	}

	athlete, err := s.fetchStravaAthlete(tokenResponse.AccessToken)
	if err != nil {
		return nil, "", err
	}
	if athlete.ID == 0 {
		return nil, "", errors.New("strava athlete was not returned")
	}

	user, err := s.userRepo.GetByStravaAthleteID(athlete.ID)
	if err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", err
		}

		user = &models.User{
			Name:         athlete.displayName(),
			Email:        fmt.Sprintf("strava-%d@strava.local", athlete.ID),
			PasswordHash: "STRAVA_OAUTH_LOGIN",
			Role:         "CUSTOMER",
		}
		if err := s.userRepo.Create(user); err != nil {
			return nil, "", err
		}
	}

	if strings.EqualFold(user.Role, "ADMIN") {
		return nil, "", errors.New("admin users must use email and password login")
	}

	user.Name = athlete.displayName()
	user.Role = "CUSTOMER"
	user.StravaAthleteID = &athlete.ID
	user.StravaAccessToken = tokenResponse.AccessToken
	user.StravaRefreshToken = tokenResponse.RefreshToken
	user.StravaTokenExpiresAt = tokenResponse.ExpiresAt
	user.StravaScope = tokenResponse.Scope
	user.StravaProfileImageURL = athlete.Profile

	if err := s.userRepo.Update(user); err != nil {
		return nil, "", err
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) Login(input LoginInput) (*models.User, string, error) {
	user, err := s.userRepo.GetByEmail(input.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("invalid credentials")
		}
		return nil, "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *AuthService) GetProfile(userID uint) (*models.User, error) {
	return s.userRepo.GetByID(userID)
}

func (s *AuthService) UpdateProfileImage(userID uint, imageURL string) (*models.User, error) {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return nil, err
	}

	user.ProfileImageURL = imageURL
	if err := s.userRepo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"sub":  user.ID,
		"role": user.Role,
		"exp":  time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}

func (s *AuthService) GenerateOAuthState() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return hex.EncodeToString(bytes), nil
}

func (s *AuthService) exchangeStravaCode(code string) (*stravaTokenResponse, error) {
	payload := url.Values{}
	payload.Set("client_id", s.stravaClientID)
	payload.Set("client_secret", s.stravaClientSecret)
	payload.Set("code", code)
	payload.Set("grant_type", "authorization_code")

	req, err := http.NewRequest(http.MethodPost, "https://www.strava.com/oauth/token", bytes.NewBufferString(payload.Encode()))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("strava token exchange failed with status %d", resp.StatusCode)
	}

	var tokenResponse stravaTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return nil, err
	}

	return &tokenResponse, nil
}

func (s *AuthService) fetchStravaAthlete(accessToken string) (*stravaAthlete, error) {
	if accessToken == "" {
		return nil, errors.New("strava access token was not returned")
	}

	req, err := http.NewRequest(http.MethodGet, "https://www.strava.com/api/v3/athlete", nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return nil, fmt.Errorf("strava athlete profile fetch failed with status %d", resp.StatusCode)
	}

	var athlete stravaAthlete
	if err := json.NewDecoder(resp.Body).Decode(&athlete); err != nil {
		return nil, err
	}

	return &athlete, nil
}

type stravaTokenResponse struct {
	TokenType    string        `json:"token_type"`
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	ExpiresAt    int64         `json:"expires_at"`
	ExpiresIn    int           `json:"expires_in"`
	Scope        string        `json:"scope"`
	Athlete      stravaAthlete `json:"athlete"`
}

type stravaAthlete struct {
	ID        int64  `json:"id"`
	Username  string `json:"username"`
	FirstName string `json:"firstname"`
	LastName  string `json:"lastname"`
	Profile   string `json:"profile"`
}

func (a stravaAthlete) displayName() string {
	name := strings.TrimSpace(strings.TrimSpace(a.FirstName) + " " + strings.TrimSpace(a.LastName))
	if name != "" {
		return name
	}
	if a.Username != "" {
		return a.Username
	}
	return fmt.Sprintf("Atleta Strava %d", a.ID)
}
