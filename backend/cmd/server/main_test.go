package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"eduone-backend/internal/api"
	"eduone-backend/internal/api/handlers"
	"eduone-backend/internal/config"
	"eduone-backend/internal/database"
	"eduone-backend/internal/models"
	"eduone-backend/internal/services/ai"
	"eduone-backend/internal/services/telegram"
	"github.com/golang-jwt/jwt/v5"
)

func setupTestRouter() http.Handler {
	cfg := config.Load()
	store := database.NewMemoryStore()
	aiSvc := ai.NewAIService(cfg, store)
	botSvc := telegram.NewBotService(cfg, store)
	h := handlers.NewAPIHandlers(cfg, store, aiSvc, botSvc)
	return api.NewRouter(cfg, h)
}

func authorizeSuperAdmin(t *testing.T, req *http.Request) {
	t.Helper()
	cfg := config.Load()
	claims := &models.UserClaims{
		UserID:       "test-super-admin",
		IsSuperAdmin: true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		t.Fatalf("sign test token: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+signed)
}

func authorizeTenantUser(t *testing.T, req *http.Request, orgID string) {
	authorizeTenantUserWithRole(t, req, orgID, "ORG_ADMIN")
}

func authorizeTenantUserWithRole(t *testing.T, req *http.Request, orgID, roleCode string) {
	t.Helper()
	cfg := config.Load()
	claims := &models.UserClaims{
		UserID:   "test-tenant-user",
		OrgID:    orgID,
		RoleCode: roleCode,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		t.Fatalf("sign test token: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+signed)
}

func TestHealthCheck(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("GET", "/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var res map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to parse json response: %v", err)
	}

	if res["status"] != "ok" {
		t.Errorf("expected status 'ok', got %v", res["status"])
	}
}

func TestProtectedRoutesRequireAuthentication(t *testing.T) {
	router := setupTestRouter()
	paths := []struct {
		method string
		path   string
	}{
		{method: http.MethodGet, path: "/api/v1/super-admin/organizations"},
		{method: http.MethodGet, path: "/api/v1/tenant/org-a/students"},
		{method: http.MethodPost, path: "/api/v1/ai/query"},
	}
	for _, route := range paths {
		req := httptest.NewRequest(route.method, route.path, nil)
		rr := httptest.NewRecorder()
		router.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnauthorized {
			t.Errorf("expected unauthenticated request to %s to return 401, got %d", route.path, rr.Code)
		}
	}
}

func TestTenantRouteRejectsCrossTenantAccess(t *testing.T) {
	router := setupTestRouter()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/tenant/org-b/students", nil)
	authorizeTenantUser(t, req, "org-a")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusForbidden {
		t.Fatalf("expected cross-tenant request to return 403, got %d: %s", rr.Code, rr.Body.String())
	}

	matchingReq := httptest.NewRequest(http.MethodGet, "/api/v1/tenant/org-a/students", nil)
	authorizeTenantUser(t, matchingReq, "org-a")
	matchingRec := httptest.NewRecorder()
	router.ServeHTTP(matchingRec, matchingReq)
	if matchingRec.Code != http.StatusOK {
		t.Fatalf("expected matching tenant request to return 200, got %d: %s", matchingRec.Code, matchingRec.Body.String())
	}

	teacherReq := httptest.NewRequest(http.MethodGet, "/api/v1/tenant/org-a/students", nil)
	authorizeTenantUserWithRole(t, teacherReq, "org-a", "TEACHER")
	teacherRec := httptest.NewRecorder()
	router.ServeHTTP(teacherRec, teacherReq)
	if teacherRec.Code != http.StatusForbidden {
		t.Fatalf("expected unscoped teacher role to return 403, got %d: %s", teacherRec.Code, teacherRec.Body.String())
	}
}

func TestLoginSuccess(t *testing.T) {
	router := setupTestRouter()

	body, _ := json.Marshal(map[string]string{
		"phone":    "+998900000001",
		"password": "admin123",
	})

	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var res handlers.LoginResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to decode login response: %v", err)
	}

	if res.Token == "" {
		t.Errorf("expected token in login response, got empty")
	}

	if !res.User.IsSuperAdmin {
		t.Errorf("expected user to be super admin")
	}
}

func TestTenantMemberProvisioningAndLoginClaims(t *testing.T) {
	router := setupTestRouter()
	cfg := config.Load()
	org := models.Organization{Name: "Tenant Auth Test", Slug: "tenant-auth-test", Subdomain: "tenant-auth-test.eduone.uz"}
	orgBody, _ := json.Marshal(org)
	createOrgReq := httptest.NewRequest(http.MethodPost, "/api/v1/super-admin/organizations", bytes.NewReader(orgBody))
	authorizeSuperAdmin(t, createOrgReq)
	createOrgRec := httptest.NewRecorder()
	router.ServeHTTP(createOrgRec, createOrgReq)
	if createOrgRec.Code != http.StatusCreated {
		t.Fatalf("create organization returned %d: %s", createOrgRec.Code, createOrgRec.Body.String())
	}
	if err := json.Unmarshal(createOrgRec.Body.Bytes(), &org); err != nil {
		t.Fatalf("decode organization response: %v", err)
	}

	memberPayload := map[string]string{
		"first_name": "Tenant", "last_name": "Admin", "phone": "+998901234567",
		"email": "tenant@example.test", "password": "a-strong-test-password",
		"role_code": "ORG_ADMIN",
	}
	memberBody, _ := json.Marshal(memberPayload)
	memberReq := httptest.NewRequest(http.MethodPost, "/api/v1/super-admin/organizations/"+org.ID+"/members", bytes.NewReader(memberBody))
	authorizeSuperAdmin(t, memberReq)
	memberRec := httptest.NewRecorder()
	router.ServeHTTP(memberRec, memberReq)
	if memberRec.Code != http.StatusCreated {
		t.Fatalf("create member returned %d: %s", memberRec.Code, memberRec.Body.String())
	}

	loginBody, _ := json.Marshal(map[string]string{"phone": memberPayload["phone"], "password": memberPayload["password"]})
	loginReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/login", bytes.NewReader(loginBody))
	loginRec := httptest.NewRecorder()
	router.ServeHTTP(loginRec, loginReq)
	if loginRec.Code != http.StatusOK {
		t.Fatalf("tenant login returned %d: %s", loginRec.Code, loginRec.Body.String())
	}
	var login handlers.LoginResponse
	if err := json.Unmarshal(loginRec.Body.Bytes(), &login); err != nil {
		t.Fatalf("decode tenant login: %v", err)
	}
	claims := &models.UserClaims{}
	parsed, err := jwt.ParseWithClaims(login.Token, claims, func(token *jwt.Token) (any, error) {
		return []byte(cfg.JWTSecret), nil
	}, jwt.WithValidMethods([]string{jwt.SigningMethodHS256.Alg()}))
	if err != nil || !parsed.Valid {
		t.Fatalf("parse tenant JWT: token valid=%v, error=%v", parsed != nil && parsed.Valid, err)
	}
	if claims.OrgID != org.ID || claims.RoleCode != "ORG_ADMIN" || claims.IsSuperAdmin {
		t.Fatalf("unexpected tenant claims: org=%q role=%q superadmin=%v", claims.OrgID, claims.RoleCode, claims.IsSuperAdmin)
	}
}

func TestGetPlatformStats(t *testing.T) {
	router := setupTestRouter()

	req, _ := http.NewRequest("GET", "/api/v1/super-admin/stats", nil)
	authorizeSuperAdmin(t, req)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var stats models.PlatformStats
	if err := json.Unmarshal(rr.Body.Bytes(), &stats); err != nil {
		t.Fatalf("failed to unmarshal stats: %v", err)
	}

	// Baza bo'sh holatda: barcha hisoblagichlar qat'iy 0 bo'lishi shart
	if stats.TotalOrganizations != 0 {
		t.Errorf("expected 0 organizations in clean empty database, got %d", stats.TotalOrganizations)
	}
	if stats.TotalStudents != 0 {
		t.Errorf("expected 0 students in clean empty database, got %d", stats.TotalStudents)
	}
	if stats.PlatformMRR != 0 {
		t.Errorf("expected 0 MRR in clean empty database, got %f", stats.PlatformMRR)
	}
}

func TestCreateOrganization(t *testing.T) {
	router := setupTestRouter()

	newOrg := models.Organization{
		Name:            "Registon IT",
		Slug:            "registon-it",
		Subdomain:       "registon-it.eduone.uz",
		OwnerName:       "Dilshod Islomov",
		Status:          "active",
		PlanName:        "Professional",
		PlanPrice:       1800000,
		EnabledFeatures: []string{"claude_ai", "telegram_bot"},
	}

	body, _ := json.Marshal(newOrg)
	req, _ := http.NewRequest("POST", "/api/v1/super-admin/organizations", bytes.NewBuffer(body))
	authorizeSuperAdmin(t, req)
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got %d. Body: %s", rr.Code, rr.Body.String())
	}
}

func TestAIQueryTool(t *testing.T) {
	router := setupTestRouter()

	queryReq := ai.AIQueryRequest{
		Prompt:     "Platforma bo'yicha jami o'quvchilar va tashkilotlar qancha?",
		ToolToCall: "get_platform_statistics",
	}

	body, _ := json.Marshal(queryReq)
	req, _ := http.NewRequest("POST", "/api/v1/ai/query", bytes.NewBuffer(body))
	authorizeSuperAdmin(t, req)
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var res ai.AIQueryResponse
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to unmarshal AI response: %v", err)
	}

	if res.ToolExecuted != "get_platform_statistics" {
		t.Errorf("expected tool_executed 'get_platform_statistics', got %s", res.ToolExecuted)
	}
}

func TestTelegramWebhook(t *testing.T) {
	t.Setenv("TELEGRAM_WEBHOOK_SECRET", "test-webhook-secret-with-at-least-32-chars")
	router := setupTestRouter()

	update := telegram.TelegramUpdate{
		UpdateID: 10001,
	}

	body, _ := json.Marshal(update)
	req, _ := http.NewRequest("POST", "/api/v1/telegram/webhook", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "wrong-secret")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected invalid webhook secret to return 401, got %d", rr.Code)
	}

	req, _ = http.NewRequest("POST", "/api/v1/telegram/webhook", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Telegram-Bot-Api-Secret-Token", "test-webhook-secret-with-at-least-32-chars")
	rr = httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}
}

func TestToggleOrganizationFeature(t *testing.T) {
	router := setupTestRouter()

	// 1. Avval tashkilot yaratamiz
	newOrg := models.Organization{
		ID:              "org-test-toggle",
		Name:            "Test Markaz",
		Slug:            "test-markaz",
		Subdomain:       "test-markaz.eduone.uz",
		OwnerName:       "Testbek",
		Status:          "active",
		EnabledFeatures: []string{"claude_ai"},
	}
	createBody, _ := json.Marshal(newOrg)
	createReq, _ := http.NewRequest("POST", "/api/v1/super-admin/organizations", bytes.NewBuffer(createBody))
	authorizeSuperAdmin(t, createReq)
	createReq.Header.Set("Content-Type", "application/json")
	createRec := httptest.NewRecorder()
	router.ServeHTTP(createRec, createReq)
	if createRec.Code != http.StatusCreated {
		t.Fatalf("failed to create test organization: %s", createRec.Body.String())
	}

	// 2. claude_ai ni o'chiramiz (bor edi -> endi yo'qolishi kerak, is_enabled: false)
	req, _ := http.NewRequest("PUT", "/api/v1/super-admin/organizations/org-test-toggle/features/claude_ai", nil)
	authorizeSuperAdmin(t, req)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d. Body: %s", rr.Code, rr.Body.String())
	}

	var res map[string]interface{}
	if err := json.Unmarshal(rr.Body.Bytes(), &res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if res["is_enabled"] != false {
		t.Errorf("expected is_enabled to be false after first toggle, got %v", res["is_enabled"])
	}

	// 3. Qayta yoqamiz (yo'q edi -> endi faol bo'lishi kerak, is_enabled: true)
	req2, _ := http.NewRequest("PUT", "/api/v1/super-admin/organizations/org-test-toggle/features/claude_ai", nil)
	authorizeSuperAdmin(t, req2)
	rr2 := httptest.NewRecorder()
	router.ServeHTTP(rr2, req2)

	var res2 map[string]interface{}
	_ = json.Unmarshal(rr2.Body.Bytes(), &res2)
	if res2["is_enabled"] != true {
		t.Errorf("expected is_enabled to be true after second toggle, got %v", res2["is_enabled"])
	}
}
