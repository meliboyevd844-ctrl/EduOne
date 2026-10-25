package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"eduone-backend/internal/api"
	"eduone-backend/internal/api/handlers"
	"eduone-backend/internal/config"
	"eduone-backend/internal/database"
	"eduone-backend/internal/services/ai"
	"eduone-backend/internal/services/telegram"
)

func main() {
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Konfiguratsiya xatosi: %v", err)
	}

	fmt.Println("==================================================")
	fmt.Println("🚀 EduOne — Multi-Tenant SaaS Backend Server")
	fmt.Printf("📦 Environment: %s\n", cfg.AppEnv)
	fmt.Printf("🌐 Port: %s\n", cfg.Port)
	fmt.Printf("🔒 Claude Model: %s\n", cfg.ClaudeModel)
	fmt.Println("==================================================")

	// 1. Initialize Database Store
	db, err := database.OpenMySQL(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("MySQL bazasiga ulanish xatosi: %v", err)
	}
	defer db.Close()
	log.Println("✓ MySQL bazasiga ulanish tasdiqlandi")

	migrationCtx, migrationCancel := context.WithTimeout(context.Background(), 2*time.Minute)
	if err := database.MigrateMySQL(migrationCtx, db, "migrations"); err != nil {
		migrationCancel()
		log.Fatalf("MySQL migratsiyasi bajarilmadi: %v", err)
	}
	migrationCancel()
	log.Println("✓ MySQL migratsiyalari tekshirildi")

	store, err := database.NewMySQLStore(db, cfg.InitialSuperAdminPassword, cfg.AppEnv)
	if err != nil {
		log.Fatalf("MySQL store ishga tushmadi: %v", err)
	}
	log.Println("✓ API ma'lumotlari MySQL'da saqlanadi")

	// 2. Initialize Services
	aiService := ai.NewAIService(cfg, store)
	botService := telegram.NewBotService(cfg, store)
	log.Println("✓ Claude AI va Telegram Bot xizmatlari tayyorlandi")

	// 3. Initialize API Handlers & Router
	apiHandlers := handlers.NewAPIHandlers(cfg, store, aiService, botService)
	router := api.NewRouter(cfg, apiHandlers)

	server := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// 4. Start Server in goroutine
	go func() {
		log.Printf("⚡ EduOne API server tinglamoqda: http://localhost:%s\n", cfg.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server xatosi: %v\n", err)
		}
	}()

	// 5. Graceful Shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Server to'xtatilmoqda...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Serverni to'xtatishda xatolik: %v\n", err)
	}

	log.Println("Server to'liq va xavfsiz to'xtatildi.")
}
