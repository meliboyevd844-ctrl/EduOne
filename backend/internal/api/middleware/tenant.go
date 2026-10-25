package middleware

import (
	"context"
	"net/http"

	"eduone-backend/internal/models"
	"github.com/go-chi/chi/v5"
)

const TenantContextKey contextKey = "tenant_id"

// TenantMiddleware extracts tenant identification and strictly prevents cross-tenant data leaks.
func TenantMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tenantID := chi.URLParam(r, "orgID")
		claims, hasClaims := r.Context().Value(UserContextKey).(*models.UserClaims)
		if !hasClaims {
			http.Error(w, `{"error":"Autentifikatsiya talab qilinadi"}`, http.StatusUnauthorized)
			return
		}

		if claims.IsSuperAdmin {
			ctx := context.WithValue(r.Context(), TenantContextKey, tenantID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		if claims.OrgID == "" || tenantID == "" || tenantID != claims.OrgID {
			http.Error(w, `{"error":"Boshqa tashkilot ma’lumotlariga kirish taqiqlangan"}`, http.StatusForbidden)
			return
		}

		ctx := context.WithValue(r.Context(), TenantContextKey, claims.OrgID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func RequireTenantRole(allowedRoles ...string) func(http.Handler) http.Handler {
	allowed := make(map[string]struct{}, len(allowedRoles))
	for _, role := range allowedRoles {
		allowed[role] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*models.UserClaims)
			if !ok {
				http.Error(w, `{"error":"Autentifikatsiya talab qilinadi"}`, http.StatusUnauthorized)
				return
			}
			if claims.IsSuperAdmin {
				next.ServeHTTP(w, r)
				return
			}
			if _, ok := allowed[claims.RoleCode]; !ok {
				http.Error(w, `{"error":"Tenant roli ushbu amal uchun ruxsatga ega emas"}`, http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
