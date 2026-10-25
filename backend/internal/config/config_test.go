package config

import "testing"

func TestValidateRequiresProductionSecrets(t *testing.T) {
	cfg := &Config{AppEnv: "production", Port: "8080", JWTExpHours: 72}
	if err := cfg.Validate(); err == nil {
		t.Fatal("expected production configuration without secrets/database URL to fail")
	}

	cfg.DatabaseURL = "user:secret@tcp(localhost:3306)/eduone"
	cfg.JWTSecret = "a-production-secret-that-is-at-least-32-characters"
	cfg.InitialSuperAdminPassword = "strong-admin-password"
	cfg.TelegramWebhookSecret = "a-production-webhook-secret-at-least-32-chars"
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected valid production configuration, got %v", err)
	}
}

func TestValidateAllowsDevelopmentDefaults(t *testing.T) {
	cfg := &Config{AppEnv: "development", Port: "8080", JWTExpHours: 72}
	if err := cfg.Validate(); err != nil {
		t.Fatalf("expected development defaults to validate, got %v", err)
	}
}
