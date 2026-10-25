package middleware

import (
	"context"
	"net/http"
	"strings"

	"eduone-backend/internal/config"
	"eduone-backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserContextKey contextKey = "user_claims"

func AuthMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, `{"error": "Autentifikatsiya talab qilinadi (Token yo‘q)"}`, http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, `{"error": "Token formati noto‘g‘ri (Bearer <token> bo‘lishi lozim)"}`, http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]
			claims := &models.UserClaims{}

			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				return []byte(cfg.JWTSecret), nil
			}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))

			if err != nil || !token.Valid {
				http.Error(w, `{"error": "Yaroqsiz yoki muddati o‘tgan token"}`, http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), UserContextKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireSuperAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(UserContextKey).(*models.UserClaims)
		if !ok || !claims.IsSuperAdmin {
			http.Error(w, `{"error": "Faqat Super Admin uchun ruxsat etilgan"}`, http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
