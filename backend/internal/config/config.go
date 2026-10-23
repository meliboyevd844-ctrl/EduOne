package config

import (
	"errors"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	Port                      string
	AppEnv                    string
	AppURL                    string
	FrontendURL               string
	JWTSecret                 string
	JWTExpHours               int
	InitialSuperAdminPassword string
	DatabaseURL               string
	AnthropicAPIKey           string
	ClaudeModel               string
	TelegramBotToken          string
	TelegramWebhookURL        string
	TelegramWebhookSecret     string
}

func Load() *Config {
	_ = godotenv.Load()

	port := getEnv("PORT", "8080")
	env := getEnv("APP_ENV", "development")
	appURL := getEnv("APP_URL", "http://localhost:8080")
	frontendURL := getEnv("FRONTEND_URL", "http://localhost:5173")
	jwtSecret := getEnv("JWT_SECRET", "")
	initialAdminPassword := getEnv("SUPERADMIN_INITIAL_PASSWORD", "")
	if strings.EqualFold(env, "development") {
		jwtSecret = getEnv("JWT_SECRET", "eduone-local-development-secret-change-me")
		initialAdminPassword = getEnv("SUPERADMIN_INITIAL_PASSWORD", "admin123")
	}

	jwtExpHours, err := strconv.Atoi(getEnv("JWT_EXPIRATION_HOURS", "72"))
	if err != nil {
		jwtExpHours = 72
	}

	dbURL := getEnv("DATABASE_URL", "")
	if strings.EqualFold(env, "development") {
		dbURL = getEnv("DATABASE_URL", "root:password@tcp(127.0.0.1:3306)/eduone?parseTime=true&charset=utf8mb4&loc=Local")
	}
	anthropicKey := getEnv("ANTHROPIC_API_KEY", "")
	claudeModel := getEnv("CLAUDE_MODEL", "claude-3-5-sonnet-20241022")
	telegramToken := getEnv("TELEGRAM_BOT_TOKEN", "")
	telegramWebhook := getEnv("TELEGRAM_WEBHOOK_URL", "https://api.eduone.uz/api/v1/telegram/webhook")
	telegramWebhookSecret := getEnv("TELEGRAM_WEBHOOK_SECRET", "")
	if strings.EqualFold(env, "development") {
		telegramWebhookSecret = getEnv("TELEGRAM_WEBHOOK_SECRET", "eduone-local-development-webhook-secret")
	}

	return &Config{
		Port:                      port,
		AppEnv:                    env,
		AppURL:                    appURL,
		FrontendURL:               frontendURL,
		JWTSecret:                 jwtSecret,
		JWTExpHours:               jwtExpHours,
		InitialSuperAdminPassword: initialAdminPassword,
		DatabaseURL:               dbURL,
		AnthropicAPIKey:           anthropicKey,
		ClaudeModel:               claudeModel,
		TelegramBotToken:          telegramToken,
		TelegramWebhookURL:        telegramWebhook,
		TelegramWebhookSecret:     telegramWebhookSecret,
	}
}

func (c *Config) Validate() error {
	if c.Port == "" {
		return errors.New("PORT is required")
	}
	if c.JWTExpHours <= 0 {
		return errors.New("JWT_EXPIRATION_HOURS must be positive")
	}
	if !strings.EqualFold(c.AppEnv, "development") {
		if c.DatabaseURL == "" {
			return errors.New("DATABASE_URL is required outside development")
		}
		if len(c.JWTSecret) < 32 {
			return errors.New("JWT_SECRET must be at least 32 characters outside development")
		}
		if len(c.InitialSuperAdminPassword) < 12 {
			return errors.New("SUPERADMIN_INITIAL_PASSWORD must be at least 12 characters outside development")
		}
		if len(c.TelegramWebhookSecret) < 32 {
			return errors.New("TELEGRAM_WEBHOOK_SECRET must be at least 32 characters outside development")
		}
	}
	return nil
}

func getEnv(key, defaultVal string) string {
	if val, ok := os.LookupEnv(key); ok && val != "" {
		return val
	}
	return defaultVal
}
