package middleware

import (
	"net/http"
	"sync"
	"time"
)

type clientLimit struct {
	tokens     int
	lastRefill time.Time
}

type RateLimiter struct {
	mu      sync.Mutex
	clients map[string]*clientLimit
	rate    int           // tokens per interval
	max     int           // max bucket size
	period  time.Duration
}

func NewRateLimiter(rate, max int, period time.Duration) *RateLimiter {
	return &RateLimiter{
		clients: make(map[string]*clientLimit),
		rate:    rate,
		max:     max,
		period:  period,
	}
}

func (rl *RateLimiter) Limit(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := r.RemoteAddr

		rl.mu.Lock()
		client, exists := rl.clients[ip]
		now := time.Now()

		if !exists {
			rl.clients[ip] = &clientLimit{
				tokens:     rl.max - 1,
				lastRefill: now,
			}
			rl.mu.Unlock()
			next.ServeHTTP(w, r)
			return
		}

		// Refill tokens
		elapsed := now.Sub(client.lastRefill)
		refill := int(elapsed / rl.period) * rl.rate
		if refill > 0 {
			client.tokens = min(rl.max, client.tokens+refill)
			client.lastRefill = now
		}

		if client.tokens <= 0 {
			rl.mu.Unlock()
			http.Error(w, `{"error": "Juda ko‘p so‘rovlar (Rate limit oshirildi). Iltimos, bir oz kuting"}`, http.StatusTooManyRequests)
			return
		}

		client.tokens--
		rl.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
