package config

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv               string
	ServerPort           string
	JWTSecret            string
	FrontendURL          string
	DatabaseURL          string
	DBHost               string
	DBPort               string
	DBUser               string
	DBPassword           string
	DBName               string
	DBSSLMode            string
	DBTimeZone           string
	DBMaxIdleConns       int
	DBMaxOpenConns       int
	DBConnMaxLifetimeMin int
	StravaClientID       string
	StravaClientSecret   string
	StravaRedirectURL    string
}

func Load() (Config, error) {
	_ = godotenv.Load()

	cfg := Config{
		AppEnv:               getEnv("APP_ENV", "development"),
		ServerPort:           getEnv("SERVER_PORT", "8080"),
		JWTSecret:            getEnv("JWT_SECRET", ""),
		FrontendURL:          getEnv("FRONTEND_URL", "http://localhost:3000"),
		DatabaseURL:          getEnv("DATABASE_URL", ""),
		DBHost:               getEnv("DB_HOST", "localhost"),
		DBPort:               getEnv("DB_PORT", "5432"),
		DBUser:               getEnv("DB_USER", "postgres"),
		DBPassword:           getEnv("DB_PASSWORD", "postgres"),
		DBName:               getEnv("DB_NAME", "essensefit"),
		DBSSLMode:            getEnv("DB_SSLMODE", "disable"),
		DBTimeZone:           getEnv("DB_TIMEZONE", "UTC"),
		DBMaxIdleConns:       getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		DBMaxOpenConns:       getEnvAsInt("DB_MAX_OPEN_CONNS", 20),
		DBConnMaxLifetimeMin: getEnvAsInt("DB_CONN_MAX_LIFETIME_MIN", 30),
		StravaClientID:       getEnv("STRAVA_CLIENT_ID", ""),
		StravaClientSecret:   getEnv("STRAVA_CLIENT_SECRET", ""),
		StravaRedirectURL:    getEnv("STRAVA_REDIRECT_URL", "http://localhost:8080/auth/strava/callback"),
	}

	if cfg.JWTSecret == "" {
		return Config{}, fmt.Errorf("JWT_SECRET is required")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}

	parsed, err := strconv.Atoi(value)
	if err != nil {
		return fallback
	}

	return parsed
}
