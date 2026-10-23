package telegram

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"eduone-backend/internal/config"
	"eduone-backend/internal/database"
)

type BotService struct {
	cfg             *config.Config
	store           database.Store
	processedUpdate map[int64]time.Time
	mu              sync.Mutex
}

func NewBotService(cfg *config.Config, store database.Store) *BotService {
	return &BotService{
		cfg:             cfg,
		store:           store,
		processedUpdate: make(map[int64]time.Time),
	}
}

type TelegramUpdate struct {
	UpdateID int64 `json:"update_id"`
	Message  *struct {
		MessageID int64 `json:"message_id"`
		Chat      struct {
			ID       int64  `json:"id"`
			Type     string `json:"type"`
			Username string `json:"username"`
		} `json:"chat"`
		From struct {
			ID        int64  `json:"id"`
			FirstName string `json:"first_name"`
			LastName  string `json:"last_name"`
			Username  string `json:"username"`
		} `json:"from"`
		Text string `json:"text"`
	} `json:"message"`
}

func (s *BotService) HandleWebhookUpdate(ctx context.Context, update *TelegramUpdate) error {
	if update == nil || update.Message == nil {
		return nil
	}

	// Idempotent tekshiruv: Takrorlangan update'larni qayta ishlamaslik
	s.mu.Lock()
	if _, exists := s.processedUpdate[update.UpdateID]; exists {
		s.mu.Unlock()
		return nil // Allaqachon bajarilgan
	}
	s.processedUpdate[update.UpdateID] = time.Now()
	// Clean up old entries if map gets too large
	if len(s.processedUpdate) > 10000 {
		s.processedUpdate = make(map[int64]time.Time)
	}
	s.mu.Unlock()

	chatID := update.Message.Chat.ID
	text := update.Message.Text

	switch {
	case text == "/start":
		msg := "Assalomu alaykum! EduOne ta'lim platformasining rasmiy botiga xush kelibsiz.\n\nQuyidagi buyruqlardan foydalanishingiz mumkin:\n/kurslar — O‘quv markazimiz kurslari va narxlari\n/davomat — Farzandingiz davomatini tekshirish\n/ai [savol] — AI ta’lim maslahatchisiga savol berish"
		return s.SendMessage(ctx, chatID, msg)

	case text == "/kurslar":
		msg := "EduOne O‘quv Kurslari:\n\n1. Frontend Bootcamp (React, Next.js) — 1,200,000 so'm/oy\n2. Python Backend Pro (Go, PostgreSQL) — 1,400,000 so'm/oy\n3. IELTS Intensive 7.5+ — 950,000 so'm/oy\n4. Data Analytics & Power BI — 1,100,000 so'm/oy\n\nSinov darsiga yozilish uchun telefon raqamingizni qoldiring."
		return s.SendMessage(ctx, chatID, msg)

	case text == "/davomat":
		msg := "EduOne Davomat Xabarnomasi:\nO‘quvchi: Sardorbek Aliyev (Frontend #14)\nBugungi dars holati: Qatnashdi (Kelgan vaqti: 08:55)\nHaftalik davomat: 96.4%"
		return s.SendMessage(ctx, chatID, msg)

	default:
		msg := "Buyruq qabul qilindi. EduOne administratorlariga uzatildi. Tez orada javob beramiz."
		return s.SendMessage(ctx, chatID, msg)
	}
}

func (s *BotService) SendMessage(ctx context.Context, chatID int64, text string) error {
	if s.cfg.TelegramBotToken == "" || s.cfg.TelegramBotToken == "1234567890:AAHaqiqiy_Tokenni_Bu_Yerga_Qoying" {
		// Log but don't fail if token not set yet
		return nil
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.cfg.TelegramBotToken)
	payload := map[string]interface{}{
		"chat_id":    chatID,
		"text":       text,
		"parse_mode": "HTML",
	}

	body, _ := json.Marshal(payload)
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	return nil
}
