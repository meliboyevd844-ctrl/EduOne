package api

import (
	"time"

	"eduone-backend/internal/api/handlers"
	"eduone-backend/internal/api/middleware"
	"eduone-backend/internal/config"
	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(cfg *config.Config, h *handlers.APIHandlers) *chi.Mux {
	r := chi.NewRouter()

	// 1. Standard Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.Timeout(60 * time.Second))

	// 2. CORS configuration for Frontend
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:4173", "http://127.0.0.1:5173", "http://127.0.0.1:4173", "https://*.eduone.uz"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Tenant-ID", "X-Tenant-Slug"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// 3. Rate Limiter (60 requests per minute per IP)
	limiter := middleware.NewRateLimiter(60, 100, time.Minute)
	r.Use(limiter.Limit)

	// 4. Public Endpoints
	r.Get("/health", h.HealthCheck)
	r.Post("/api/v1/auth/login", h.Login)
	r.Post("/api/v1/telegram/webhook", h.HandleTelegramWebhook)

	// 5. Protected Super Admin & Platform Endpoints
	r.Route("/api/v1", func(r chi.Router) {
		r.With(middleware.AuthMiddleware(cfg), middleware.RequireSuperAdmin).Post("/ai/query", h.HandleAIQuery)
		r.Route("/tenant/{orgID}", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg))
			r.Use(middleware.TenantMiddleware)
			r.Use(middleware.RequireTenantRole("ORG_ADMIN"))
			r.Get("/students", h.GetStudents)
			r.Post("/students", h.CreateStudent)
			r.Delete("/students/{studentID}", h.DeleteStudent)
			r.Post("/students/{studentID}/coins", h.AwardStudentCoins)
			r.Get("/student-payments", h.GetStudentPayments)
			r.Post("/student-payments", h.RecordStudentPayment)
		})

		// Super Admin Group
		r.Route("/super-admin", func(r chi.Router) {
			r.Use(middleware.AuthMiddleware(cfg))
			r.Use(middleware.RequireSuperAdmin)
			r.Get("/stats", h.GetStats)
			r.Get("/organizations", h.GetOrganizations)
			r.Post("/organizations", h.CreateOrganization)
			r.Post("/organizations/{id}/members", h.CreateOrganizationMember)
			r.Get("/organizations/{id}", h.GetOrganizationByID)
			r.Put("/organizations/{id}", h.UpdateOrganization)
			r.Delete("/organizations/{id}", h.DeleteOrganization)
			r.Put("/organizations/{id}/status", h.UpdateOrgStatus)
			r.Put("/organizations/{id}/features", h.UpdateOrgFeatures)
			r.Put("/organizations/{id}/features/{feature}", h.ToggleOrgFeature)
			r.Post("/organizations/{id}/branches", h.AddBranch)
			r.Get("/plans", h.GetPlans)
			r.Post("/plans", h.CreatePlan)
			r.Put("/plans/{id}", h.UpdatePlan)
			r.Delete("/plans/{id}", h.DeletePlan)
			r.Get("/features", h.GetFeatureFlags)
			r.Put("/features/{code}", h.UpdateFeatureFlag)
			r.Get("/invoices", h.GetInvoices)
			r.Post("/invoices", h.CreateInvoice)
			r.Post("/invoices/{id}/pay", h.RecordInvoicePayment)
			r.Get("/audit-logs", h.GetAuditLogs)
		})
	})

	return r
}
