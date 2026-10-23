package handlers

import (
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"eduone-backend/internal/config"
	"eduone-backend/internal/database"
	"eduone-backend/internal/models"
	"eduone-backend/internal/services/ai"
	"eduone-backend/internal/services/telegram"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type APIHandlers struct {
	cfg    *config.Config
	store  database.Store
	aiSvc  *ai.AIService
	botSvc *telegram.BotService
}

func NewAPIHandlers(cfg *config.Config, store database.Store, aiSvc *ai.AIService, botSvc *telegram.BotService) *APIHandlers {
	return &APIHandlers{
		cfg:    cfg,
		store:  store,
		aiSvc:  aiSvc,
		botSvc: botSvc,
	}
}

func (h *APIHandlers) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":      "ok",
		"service":     "EduOne SaaS Core API",
		"version":     "1.0.0",
		"environment": h.cfg.AppEnv,
		"timestamp":   time.Now().Format(time.RFC3339),
	})
}

func (h *APIHandlers) GetStudents(w http.ResponseWriter, r *http.Request) {
	students, err := h.store.GetStudents(chi.URLParam(r, "orgID"))
	if err != nil {
		http.Error(w, `{"error":"O‘quvchilarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(students)
}

func (h *APIHandlers) CreateStudent(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FirstName   string  `json:"firstName"`
		LastName    string  `json:"lastName"`
		Phone       string  `json:"phone"`
		ParentName  string  `json:"parentName"`
		ParentPhone string  `json:"parentPhone"`
		GroupID     string  `json:"groupId"`
		GroupName   string  `json:"groupName"`
		BranchID    string  `json:"branchId"`
		Balance     float64 `json:"balance"`
		Coins       int     `json:"coins"`
		Status      string  `json:"status"`
		PaymentType string  `json:"paymentType"`
		MonthlyFee  float64 `json:"monthlyFee"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Yaroqsiz so‘rov formati"}`, http.StatusBadRequest)
		return
	}
	if req.FirstName == "" || req.Phone == "" {
		http.Error(w, `{"error":"Ism va telefon majburiy"}`, http.StatusBadRequest)
		return
	}
	student := models.Student{
		OrganizationID: chi.URLParam(r, "orgID"), BranchID: req.BranchID,
		FirstName: req.FirstName, LastName: req.LastName, Phone: req.Phone,
		ParentName: req.ParentName, ParentPhone: req.ParentPhone, GroupID: req.GroupID,
		GroupName: req.GroupName, Balance: req.Balance, Coins: req.Coins, Status: req.Status,
		PaymentType: req.PaymentType, MonthlyFee: req.MonthlyFee,
	}
	if err := h.store.CreateStudent(&student); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(student)
}

func (h *APIHandlers) DeleteStudent(w http.ResponseWriter, r *http.Request) {
	if err := h.store.DeleteStudent(chi.URLParam(r, "orgID"), chi.URLParam(r, "studentID")); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func (h *APIHandlers) GetStudentPayments(w http.ResponseWriter, r *http.Request) {
	payments, err := h.store.GetStudentPayments(chi.URLParam(r, "orgID"))
	if err != nil {
		http.Error(w, `{"error":"To‘lovlarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payments)
}

func (h *APIHandlers) RecordStudentPayment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		StudentID     string  `json:"studentId"`
		Amount        float64 `json:"amount"`
		PaymentMethod string  `json:"paymentMethod"`
		PaymentMode   string  `json:"paymentMode"`
		Month         string  `json:"month"`
		Notes         string  `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Yaroqsiz so‘rov formati"}`, http.StatusBadRequest)
		return
	}
	if req.StudentID == "" || req.Amount <= 0 {
		http.Error(w, `{"error":"O‘quvchi va musbat to‘lov summasi majburiy"}`, http.StatusBadRequest)
		return
	}
	payment := models.StudentPayment{
		OrganizationID: chi.URLParam(r, "orgID"), StudentID: req.StudentID,
		Amount: req.Amount, PaymentMethod: req.PaymentMethod, PaymentMode: req.PaymentMode,
		Month: req.Month, Notes: req.Notes,
	}
	if err := h.store.RecordStudentPayment(&payment); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(payment)
}

func (h *APIHandlers) AwardStudentCoins(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Amount int    `json:"amount"`
		Reason string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Yaroqsiz so‘rov formati"}`, http.StatusBadRequest)
		return
	}
	if req.Amount <= 0 {
		http.Error(w, `{"error":"Coin miqdori noldan katta bo‘lishi kerak"}`, http.StatusBadRequest)
		return
	}
	orgID := chi.URLParam(r, "orgID")
	studentID := chi.URLParam(r, "studentID")
	if err := h.store.AwardStudentCoins(orgID, studentID, req.Amount, req.Reason); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{"status": "awarded", "amount": req.Amount})
}

type LoginRequest struct {
	Phone    string `json:"phone"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func (h *APIHandlers) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Yaroqsiz so‘rov formati"}`, http.StatusBadRequest)
		return
	}

	user, err := h.store.GetUserByPhone(req.Phone)
	if err != nil {
		http.Error(w, `{"error": "Telefon raqam yoki parol noto‘g‘ri"}`, http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		http.Error(w, `{"error": "Telefon raqam yoki parol noto‘g‘ri"}`, http.StatusUnauthorized)
		return
	}
	if user.Status != "active" {
		http.Error(w, `{"error": "Hisob bloklangan yoki faol emas"}`, http.StatusForbidden)
		return
	}

	claims := &models.UserClaims{
		UserID:       user.ID,
		Phone:        user.Phone,
		IsSuperAdmin: user.IsSuperAdmin,
		OrgID:        user.OrganizationID,
		RoleCode:     user.RoleCode,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(h.cfg.JWTExpHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(h.cfg.JWTSecret))
	if err != nil {
		http.Error(w, `{"error": "Token yaratishda xatolik"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(LoginResponse{
		Token: tokenString,
		User:  user,
	})
}

func (h *APIHandlers) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.store.GetPlatformStats()
	if err != nil {
		http.Error(w, `{"error": "Statistikani olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(stats)
}

func (h *APIHandlers) GetOrganizations(w http.ResponseWriter, r *http.Request) {
	orgs, err := h.store.GetOrganizations()
	if err != nil {
		http.Error(w, `{"error": "Tashkilotlarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(orgs)
}

func (h *APIHandlers) CreateOrganization(w http.ResponseWriter, r *http.Request) {
	var org models.Organization
	if err := json.NewDecoder(r.Body).Decode(&org); err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Yaroqsiz so‘rov formati: %s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	if org.Name == "" || org.Slug == "" {
		http.Error(w, `{"error": "Tashkilot nomi va slug majburiy"}`, http.StatusBadRequest)
		return
	}

	if err := h.store.CreateOrganization(&org); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(org)
}

func (h *APIHandlers) CreateOrganizationMember(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FirstName string `json:"first_name"`
		LastName  string `json:"last_name"`
		Phone     string `json:"phone"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		BranchID  string `json:"branch_id"`
		RoleCode  string `json:"role_code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Yaroqsiz so‘rov formati"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.FirstName) == "" || strings.TrimSpace(req.Phone) == "" || len(req.Password) < 12 {
		http.Error(w, `{"error":"first_name, phone va kamida 12 belgili password majburiy"}`, http.StatusBadRequest)
		return
	}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"Parolni xavfsiz saqlashda xatolik"}`, http.StatusInternalServerError)
		return
	}
	user := models.User{
		FirstName: strings.TrimSpace(req.FirstName), LastName: strings.TrimSpace(req.LastName),
		Phone: strings.TrimSpace(req.Phone), Email: strings.TrimSpace(req.Email), PasswordHash: string(passwordHash),
	}
	if err := h.store.CreateOrganizationMember(chi.URLParam(r, "id"), req.BranchID, req.RoleCode, &user); err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(user)
}

func (h *APIHandlers) UpdateOrgStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateOrganizationStatus(id, req.Status); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *APIHandlers) ToggleOrgFeature(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	feature := chi.URLParam(r, "feature")

	nowEnabled, err := h.store.ToggleOrganizationFeature(id, feature)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"organization_id": id,
		"feature":         feature,
		"is_enabled":      nowEnabled,
	})
}

func (h *APIHandlers) UpdateOrgFeatures(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		Features []string `json:"features"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateOrganizationFeatures(id, req.Features); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"organization_id": id,
		"features":        req.Features,
		"status":          "updated",
	})
}

func (h *APIHandlers) AddBranch(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "id")
	var branch models.Branch
	if err := json.NewDecoder(r.Body).Decode(&branch); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}
	branch.OrganizationID = orgID

	if err := h.store.AddBranch(&branch); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(branch)
}

func (h *APIHandlers) GetPlans(w http.ResponseWriter, r *http.Request) {
	plans, err := h.store.GetPlans()
	if err != nil {
		http.Error(w, `{"error":"Tariflarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(plans)
}

func (h *APIHandlers) GetFeatureFlags(w http.ResponseWriter, r *http.Request) {
	flags, err := h.store.GetFeatureFlags()
	if err != nil {
		http.Error(w, `{"error":"Feature flaglarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(flags)
}

func (h *APIHandlers) UpdateFeatureFlag(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	var req struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}

	if err := h.store.UpdateFeatureFlag(code, req.Enabled); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *APIHandlers) GetAuditLogs(w http.ResponseWriter, r *http.Request) {
	logs, err := h.store.GetAuditLogs()
	if err != nil {
		http.Error(w, `{"error":"Audit loglarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(logs)
}

func (h *APIHandlers) GetOrganizationByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	org, err := h.store.GetOrganizationByID(id)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(org)
}

func (h *APIHandlers) UpdateOrganization(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var org models.Organization
	if err := json.NewDecoder(r.Body).Decode(&org); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}
	org.ID = id
	if err := h.store.UpdateOrganization(&org); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func (h *APIHandlers) DeleteOrganization(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.store.DeleteOrganization(id); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func (h *APIHandlers) CreatePlan(w http.ResponseWriter, r *http.Request) {
	var plan models.Plan
	if err := json.NewDecoder(r.Body).Decode(&plan); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}
	if plan.Name == "" {
		http.Error(w, `{"error": "Tarif nomi kiritilishi shart"}`, http.StatusBadRequest)
		return
	}
	if err := h.store.CreatePlan(&plan); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(plan)
}

func (h *APIHandlers) UpdatePlan(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var plan models.Plan
	if err := json.NewDecoder(r.Body).Decode(&plan); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}
	plan.ID = id
	if err := h.store.UpdatePlan(&plan); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(plan)
}

func (h *APIHandlers) DeletePlan(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.store.DeletePlan(id); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func (h *APIHandlers) GetInvoices(w http.ResponseWriter, r *http.Request) {
	invoices, err := h.store.GetInvoices()
	if err != nil {
		http.Error(w, `{"error":"Invoyslarni olishda xatolik"}`, http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(invoices)
}

func (h *APIHandlers) CreateInvoice(w http.ResponseWriter, r *http.Request) {
	var inv models.Invoice
	if err := json.NewDecoder(r.Body).Decode(&inv); err != nil {
		http.Error(w, `{"error": "Yaroqsiz format"}`, http.StatusBadRequest)
		return
	}
	if err := h.store.CreateInvoice(&inv); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	_ = json.NewEncoder(w).Encode(inv)
}

func (h *APIHandlers) RecordInvoicePayment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		PaymentMethod string `json:"payment_method"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		req.PaymentMethod = "manual"
	}
	if err := h.store.RecordInvoicePayment(id, req.PaymentMethod); err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "paid"})
}

func (h *APIHandlers) HandleAIQuery(w http.ResponseWriter, r *http.Request) {
	var req ai.AIQueryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Yaroqsiz so‘rov"}`, http.StatusBadRequest)
		return
	}

	resp, err := h.aiSvc.ProcessQuery(r.Context(), &req)
	if err != nil {
		http.Error(w, `{"error": "`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *APIHandlers) HandleTelegramWebhook(w http.ResponseWriter, r *http.Request) {
	providedSecret := r.Header.Get("X-Telegram-Bot-Api-Secret-Token")
	if h.cfg.TelegramWebhookSecret == "" || subtle.ConstantTimeCompare([]byte(providedSecret), []byte(h.cfg.TelegramWebhookSecret)) != 1 {
		http.Error(w, `{"error":"Webhook token noto‘g‘ri"}`, http.StatusUnauthorized)
		return
	}
	var update telegram.TelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		w.WriteHeader(http.StatusOK) // Telegram always requires 200 OK
		return
	}

	_ = h.botSvc.HandleWebhookUpdate(r.Context(), &update)
	w.WriteHeader(http.StatusOK)
}
