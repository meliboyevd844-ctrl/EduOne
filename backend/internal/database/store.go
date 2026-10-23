package database

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"eduone-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

type Store interface {
	GetStudents(organizationID string) ([]models.Student, error)
	CreateStudent(student *models.Student) error
	DeleteStudent(organizationID, studentID string) error
	GetStudentPayments(organizationID string) ([]models.StudentPayment, error)
	RecordStudentPayment(payment *models.StudentPayment) error
	AwardStudentCoins(organizationID, studentID string, amount int, reason string) error
	GetPlatformStats() (*models.PlatformStats, error)
	GetOrganizations() ([]models.Organization, error)
	GetOrganizationByID(id string) (*models.Organization, error)
	GetOrganizationBySlug(slug string) (*models.Organization, error)
	CreateOrganization(org *models.Organization) error
	UpdateOrganization(org *models.Organization) error
	UpdateOrganizationStatus(id string, status string) error
	DeleteOrganization(id string) error
	ToggleOrganizationFeature(orgID, featureCode string) (bool, error)
	UpdateOrganizationFeatures(orgID string, features []string) error
	AddBranch(branch *models.Branch) error
	GetUserByPhone(phone string) (*models.User, error)
	CreateOrganizationMember(orgID, branchID, roleCode string, user *models.User) error
	GetPlans() ([]models.Plan, error)
	CreatePlan(plan *models.Plan) error
	UpdatePlan(plan *models.Plan) error
	DeletePlan(id string) error
	GetFeatureFlags() ([]models.FeatureFlag, error)
	UpdateFeatureFlag(code string, enabled bool) error
	GetInvoices() ([]models.Invoice, error)
	CreateInvoice(inv *models.Invoice) error
	RecordInvoicePayment(id, paymentMethod string) error
	GetAuditLogs() ([]models.AuditLog, error)
	CreateAuditLog(log *models.AuditLog) error
	RecordAIUsage(log *models.AIUsageLog) error
}

type MemoryStore struct {
	mu              sync.RWMutex
	students        map[string]*models.Student
	studentPayments map[string][]models.StudentPayment
	organizations   map[string]*models.Organization
	users           map[string]*models.User
	plans           map[string]*models.Plan
	features        map[string]*models.FeatureFlag
	invoices        map[string]*models.Invoice
	auditLogs       []models.AuditLog
	aiLogs          []models.AIUsageLog
}

func NewMemoryStore() *MemoryStore {
	store := &MemoryStore{
		students:        make(map[string]*models.Student),
		studentPayments: make(map[string][]models.StudentPayment),
		organizations:   make(map[string]*models.Organization),
		users:           make(map[string]*models.User),
		plans:           make(map[string]*models.Plan),
		features:        make(map[string]*models.FeatureFlag),
		invoices:        make(map[string]*models.Invoice),
		auditLogs:       make([]models.AuditLog, 0),
		aiLogs:          make([]models.AIUsageLog, 0),
	}
	store.seedInitialData()
	return store
}

func (s *MemoryStore) seedInitialData() {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Default Super Admin User (login: +998900000001, parol: admin123)
	hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	s.users["+998900000001"] = &models.User{
		ID:           "u-superadmin-1",
		FirstName:    "Sardor",
		LastName:     "Ikromov",
		Phone:        "+998900000001",
		Email:        "superadmin@eduone.uz",
		PasswordHash: string(hash),
		IsSuperAdmin: true,
		Status:       "active",
		CreatedAt:    time.Now().Add(-180 * 24 * time.Hour),
	}

	// 2. Default SaaS Plans (Super Admin tomonidan tahrirlanishi yoki o'zgartirilishi mumkin)
	s.plans["STARTER"] = &models.Plan{
		ID:           "STARTER",
		Name:         "Boshlang‘ich",
		PriceMonthly: 800000,
		PriceYearly:  8000000,
		TrialDays:    14,
		BranchLimit:  1,
		StudentLimit: 250,
		AITokenLimit: 100000,
		Features:     []string{"1 ta filial", "250 o‘quvchi", "Dars jadvali", "Telegram bot"},
		IsActive:     true,
	}
	s.plans["PRO"] = &models.Plan{
		ID:           "PRO",
		Name:         "Professional",
		PriceMonthly: 1800000,
		PriceYearly:  18000000,
		TrialDays:    14,
		BranchLimit:  5,
		StudentLimit: 1200,
		AITokenLimit: 500000,
		Features:     []string{"5 ta filial", "1200 o‘quvchi", "Online billing", "500k AI token", "KPI hisobi"},
		IsActive:     true,
	}
	s.plans["ENTERPRISE"] = &models.Plan{
		ID:           "ENTERPRISE",
		Name:         "Enterprise",
		PriceMonthly: 3500000,
		PriceYearly:  35000000,
		TrialDays:    30,
		BranchLimit:  20,
		StudentLimit: 5000,
		AITokenLimit: 1500000,
		Features:     []string{"20 ta filial", "5000+ o‘quvchi", "Face ID integratsiya", "1.5M AI token", "VIP SLA"},
		IsActive:     true,
	}

	// 3. Platform Feature Flags Master Catalog (8 ta asosiy modul)
	s.features["claude_ai"] = &models.FeatureFlag{
		Code:              "claude_ai",
		Name:              "Claude AI Asistenti",
		Description:       "Tashkilot admini va o‘quvchilar uchun Claude API orqali aqlli tahlil",
		IsEnabledGlobally: true,
		RequiredPlan:      "STARTER",
	}
	s.features["telegram_bot"] = &models.FeatureFlag{
		Code:              "telegram_bot",
		Name:              "Telegram Bot Xabarnomalari",
		Description:       "Ota-ona va o‘quvchilarga avtomatik dars va to‘lov xabarnomalari",
		IsEnabledGlobally: true,
		RequiredPlan:      "STARTER",
	}
	s.features["online_billing"] = &models.FeatureFlag{
		Code:              "online_billing",
		Name:              "Online Billing (Payme / Click / Uzum)",
		Description:       "O‘quvchilar to‘lovlarini qabul qilish va elektron kvitansiya",
		IsEnabledGlobally: true,
		RequiredPlan:      "PRO",
	}
	s.features["face_id_turnstile"] = &models.FeatureFlag{
		Code:              "face_id_turnstile",
		Name:              "Face ID & Turniket Integratsiyasi",
		Description:       "Kameradan yuzni tanib olish orqali avtomatlashtirilgan davomat tizimi",
		IsEnabledGlobally: true,
		RequiredPlan:      "ENTERPRISE",
	}
	s.features["ai_student_tutor"] = &models.FeatureFlag{
		Code:              "ai_student_tutor",
		Name:              "AI Shaxsiy Repetitor (Student Tutor)",
		Description:       "O‘quvchining test natijalari asosida shaxsiy o‘quv rejalari va savollar",
		IsEnabledGlobally: true,
		RequiredPlan:      "PRO",
	}
	s.features["parent_portal"] = &models.FeatureFlag{
		Code:              "parent_portal",
		Name:              "Ota-onalar Shaxsiy Kabineti",
		Description:       "Ota-onalar uchun veb portalda farzandi davomati va to‘lovlarini ko‘rish",
		IsEnabledGlobally: true,
		RequiredPlan:      "STARTER",
	}
	s.features["sms_gateway"] = &models.FeatureFlag{
		Code:              "sms_gateway",
		Name:              "SMS Shlyuzi (Eskiz / PlayMobile)",
		Description:       "Ota-onalarga to‘g‘ridan-to‘g‘ri SMS xabarnoma yuborish",
		IsEnabledGlobally: true,
		RequiredPlan:      "PRO",
	}
	s.features["timetable_conflict"] = &models.FeatureFlag{
		Code:              "timetable_conflict",
		Name:              "Dars Jadvali va Xonalar Nazorati",
		Description:       "Xonalar to‘qnashuvining oldini oluvchi aqlli taqvim tizimi",
		IsEnabledGlobally: true,
		RequiredPlan:      "STARTER",
	}

	// 4. Boshlang'ich tizim audit jurnali (Haqiqiy holat: 0 ta tashkilot)
	s.auditLogs = append(s.auditLogs, models.AuditLog{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Tizim (System)",
		Action:    "EduOne Multi-tenant Core ishga tushirildi (baza bo‘sh, 0 ta tashkilot)",
		Target:    "Platforma yadrosi",
		IPAddress: "127.0.0.1",
		Status:    "success",
	})
	// ESLATMA: s.organizations butunlay bo'sh boshlanadi! Hech qanday fake markazlar kiritilmaydi.
}

func (s *MemoryStore) GetStudents(organizationID string) ([]models.Student, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	students := make([]models.Student, 0)
	for _, student := range s.students {
		if student.OrganizationID == organizationID {
			students = append(students, *student)
		}
	}
	return students, nil
}

func (s *MemoryStore) CreateStudent(student *models.Student) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if student.ID == "" {
		student.ID = fmt.Sprintf("std-%d", time.Now().UnixNano())
	}
	if student.CreatedAt.IsZero() {
		student.CreatedAt = time.Now()
	}
	if student.EnrolledDate == "" {
		student.EnrolledDate = student.CreatedAt.Format("2006-01-02")
	}
	if student.GroupName == "" {
		student.GroupName = "Biriktirilmagan"
	}
	s.students[student.ID] = student
	if org, exists := s.organizations[student.OrganizationID]; exists {
		org.StudentsCount++
	}
	return nil
}

func (s *MemoryStore) DeleteStudent(organizationID, studentID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	student, exists := s.students[studentID]
	if !exists || student.OrganizationID != organizationID {
		return errors.New("o‘quvchi topilmadi")
	}
	delete(s.students, studentID)
	if org, exists := s.organizations[organizationID]; exists && org.StudentsCount > 0 {
		org.StudentsCount--
	}
	return nil
}

func (s *MemoryStore) GetStudentPayments(organizationID string) ([]models.StudentPayment, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	payments := append([]models.StudentPayment(nil), s.studentPayments[organizationID]...)
	return payments, nil
}

func (s *MemoryStore) RecordStudentPayment(payment *models.StudentPayment) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	student, exists := s.students[payment.StudentID]
	if !exists || student.OrganizationID != payment.OrganizationID {
		return errors.New("o‘quvchi topilmadi")
	}
	if payment.ID == "" {
		payment.ID = fmt.Sprintf("pay-%d", time.Now().UnixNano())
	}
	if payment.ReceiptNumber == "" {
		payment.ReceiptNumber = fmt.Sprintf("RCP-%06d", time.Now().UnixNano()%1000000)
	}
	if payment.CreatedAt.IsZero() {
		payment.CreatedAt = time.Now()
	}
	student.Balance += payment.Amount
	student.Status = "active"
	s.studentPayments[payment.OrganizationID] = append([]models.StudentPayment{*payment}, s.studentPayments[payment.OrganizationID]...)
	return nil
}

func (s *MemoryStore) AwardStudentCoins(organizationID, studentID string, amount int, reason string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	student, exists := s.students[studentID]
	if !exists || student.OrganizationID != organizationID {
		return errors.New("o‘quvchi topilmadi")
	}
	if amount <= 0 {
		return errors.New("coin miqdori noldan katta bo‘lishi kerak")
	}
	student.Coins += amount
	return nil
}

func (s *MemoryStore) GetPlatformStats() (*models.PlatformStats, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	activeOrgs := 0
	trialOrgs := 0
	suspendedOrgs := 0
	totalBranches := 0
	totalStudents := 0
	totalTeachers := 0
	totalGroups := 0
	totalTokens := 0
	var platformMRR float64 = 0

	for _, org := range s.organizations {
		switch org.Status {
		case "active":
			activeOrgs++
			platformMRR += org.PlanPrice
		case "trial":
			trialOrgs++
		case "suspended":
			suspendedOrgs++
		}
		totalBranches += org.BranchesCount
		totalStudents += org.StudentsCount
		totalTeachers += org.TeachersCount
		totalGroups += org.GroupsCount
		totalTokens += org.AITokensUsed
	}

	return &models.PlatformStats{
		TotalOrganizations:     len(s.organizations),
		ActiveOrganizations:    activeOrgs,
		TrialOrganizations:     trialOrgs,
		SuspendedOrganizations: suspendedOrgs,
		TotalBranches:          totalBranches,
		TotalStudents:          totalStudents,
		TotalTeachers:          totalTeachers,
		TotalGroups:            totalGroups,
		PlatformMRR:            platformMRR,
		AIMonthlyTokens:        totalTokens,
		AIEstimatedCostUSD:     float64(totalTokens) * 0.000007,
		TelegramBotStatus:      "online",
		TelegramMessagesSent:   0,
		SystemHealth:           100.0,
	}, nil
}

func (s *MemoryStore) GetOrganizations() ([]models.Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]models.Organization, 0, len(s.organizations))
	for _, org := range s.organizations {
		list = append(list, *org)
	}
	return list, nil
}

func (s *MemoryStore) GetOrganizationByID(id string) (*models.Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	org, exists := s.organizations[id]
	if !exists {
		return nil, errors.New("tashkilot topilmadi")
	}
	return org, nil
}

func (s *MemoryStore) GetOrganizationBySlug(slug string) (*models.Organization, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, org := range s.organizations {
		if org.Slug == slug {
			return org, nil
		}
	}
	return nil, errors.New("tashkilot topilmadi")
}

func (s *MemoryStore) CreateOrganization(org *models.Organization) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for _, existing := range s.organizations {
		if existing.Slug == org.Slug {
			return fmt.Errorf("bu subdomen (%s) allaqachon band", org.Slug)
		}
	}

	if org.ID == "" {
		org.ID = fmt.Sprintf("org-%d", time.Now().UnixNano())
	}
	if org.Subdomain == "" {
		org.Subdomain = fmt.Sprintf("%s.eduone.uz", org.Slug)
	}
	if org.CreatedAt.IsZero() {
		org.CreatedAt = time.Now()
	}
	if org.Status == "" {
		org.Status = "active"
	}
	if org.SubscriptionExpiresAt == nil {
		exp := time.Now().Add(30 * 24 * time.Hour)
		org.SubscriptionExpiresAt = &exp
	}

	// Agar boshlang'ich filiallar bo'lsa, sonini aniqlash
	if len(org.Branches) > 0 {
		org.BranchesCount = len(org.Branches)
	}

	s.organizations[org.ID] = org

	// Audit log yozish
	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    "Yangi tashkilot yaratildi",
		Target:    fmt.Sprintf("%s (%s, %d ta modul faol)", org.Name, org.Subdomain, len(org.EnabledFeatures)),
		IPAddress: "127.0.0.1",
		Status:    "success",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) UpdateOrganization(org *models.Organization) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	existing, exists := s.organizations[org.ID]
	if !exists {
		return errors.New("tashkilot topilmadi")
	}

	existing.Name = org.Name
	existing.OwnerName = org.OwnerName
	existing.OwnerPhone = org.OwnerPhone
	existing.OwnerEmail = org.OwnerEmail
	existing.PlanID = org.PlanID
	existing.PlanName = org.PlanName
	existing.PlanPrice = org.PlanPrice
	existing.Status = org.Status
	existing.OutstandingDebt = org.OutstandingDebt
	if org.SubscriptionExpiresAt != nil {
		existing.SubscriptionExpiresAt = org.SubscriptionExpiresAt
	}
	if len(org.EnabledFeatures) > 0 {
		existing.EnabledFeatures = org.EnabledFeatures
	}

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    "Tashkilot ma’lumotlari tahrirlandi",
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    "info",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) UpdateOrganizationStatus(id string, status string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	org, exists := s.organizations[id]
	if !exists {
		return errors.New("tashkilot topilmadi")
	}
	org.Status = status

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("Tashkilot holati o‘zgartirildi: %s", status),
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    "warning",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) DeleteOrganization(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	org, exists := s.organizations[id]
	if !exists {
		return errors.New("tashkilot topilmadi")
	}

	delete(s.organizations, id)

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    "Tashkilot arxivlandi/o‘chirildi",
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    "danger",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) ToggleOrganizationFeature(orgID, featureCode string) (bool, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	org, exists := s.organizations[orgID]
	if !exists {
		return false, errors.New("tashkilot topilmadi")
	}

	foundIdx := -1
	for idx, code := range org.EnabledFeatures {
		if code == featureCode {
			foundIdx = idx
			break
		}
	}

	var nowEnabled bool
	if foundIdx >= 0 {
		// Remove feature (disable)
		org.EnabledFeatures = append(org.EnabledFeatures[:foundIdx], org.EnabledFeatures[foundIdx+1:]...)
		nowEnabled = false
	} else {
		// Add feature (enable)
		org.EnabledFeatures = append(org.EnabledFeatures, featureCode)
		nowEnabled = true
	}

	action := "Modul yoqildi"
	status := "success"
	if !nowEnabled {
		action = "Modul o‘chirildi (qarzdorlik/cheklov)"
		status = "warning"
	}

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("%s: %s", action, featureCode),
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    status,
	}}, s.auditLogs...)

	return nowEnabled, nil
}

func (s *MemoryStore) UpdateOrganizationFeatures(orgID string, features []string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	org, exists := s.organizations[orgID]
	if !exists {
		return errors.New("tashkilot topilmadi")
	}
	org.EnabledFeatures = features

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("Modullar to‘plami yangilandi (%d ta faol)", len(features)),
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    "info",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) AddBranch(branch *models.Branch) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	org, exists := s.organizations[branch.OrganizationID]
	if !exists {
		return errors.New("tashkilot topilmadi")
	}

	if branch.ID == "" {
		branch.ID = fmt.Sprintf("b-%d", time.Now().UnixNano())
	}
	branch.CreatedAt = time.Now()
	org.Branches = append(org.Branches, *branch)
	org.BranchesCount = len(org.Branches)

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("Yangi filial qo‘shildi: %s (%s)", branch.Name, branch.City),
		Target:    org.Name,
		IPAddress: "127.0.0.1",
		Status:    "success",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) GetUserByPhone(phone string) (*models.User, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	user, exists := s.users[phone]
	if !exists {
		return nil, errors.New("foydalanuvchi topilmadi")
	}
	return user, nil
}

func (s *MemoryStore) CreateOrganizationMember(orgID, branchID, roleCode string, user *models.User) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.organizations[orgID]; !exists {
		return errors.New("tashkilot topilmadi")
	}
	if roleCode != "ORG_ADMIN" && roleCode != "BRANCH_ADMIN" && roleCode != "TEACHER" && roleCode != "ASSISTANT" && roleCode != "STUDENT" && roleCode != "PARENT" {
		return errors.New("tenant uchun yaroqsiz role_code")
	}
	if branchID != "" {
		branchFound := false
		for _, branch := range s.organizations[orgID].Branches {
			if branch.ID == branchID {
				branchFound = true
				break
			}
		}
		if !branchFound {
			return errors.New("filial ushbu tashkilotga tegishli emas")
		}
	}
	if _, exists := s.users[user.Phone]; exists {
		return errors.New("telefon raqam bilan foydalanuvchi mavjud")
	}
	user.ID = fmt.Sprintf("user-%d", time.Now().UnixNano())
	user.OrganizationID = orgID
	user.BranchID = branchID
	user.RoleCode = roleCode
	user.Status = "active"
	user.CreatedAt = time.Now()
	s.users[user.Phone] = user
	return nil
}

func (s *MemoryStore) GetPlans() ([]models.Plan, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]models.Plan, 0, len(s.plans))
	for _, p := range s.plans {
		list = append(list, *p)
	}
	return list, nil
}

func (s *MemoryStore) CreatePlan(plan *models.Plan) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if plan.ID == "" {
		plan.ID = fmt.Sprintf("PLAN-%d", time.Now().UnixNano())
	}
	s.plans[plan.ID] = plan

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("Yangi tarif yaratildi: %s", plan.Name),
		Target:    "EduOne Tariflar Tizimi",
		IPAddress: "127.0.0.1",
		Status:    "success",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) UpdatePlan(plan *models.Plan) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.plans[plan.ID]; !exists {
		return errors.New("tarif topilmadi")
	}
	s.plans[plan.ID] = plan
	return nil
}

func (s *MemoryStore) DeletePlan(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if _, exists := s.plans[id]; !exists {
		return errors.New("tarif topilmadi")
	}
	delete(s.plans, id)
	return nil
}

func (s *MemoryStore) GetFeatureFlags() ([]models.FeatureFlag, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]models.FeatureFlag, 0, len(s.features))
	for _, f := range s.features {
		list = append(list, *f)
	}
	return list, nil
}

func (s *MemoryStore) UpdateFeatureFlag(code string, enabled bool) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	flag, exists := s.features[code]
	if !exists {
		return errors.New("feature flag topilmadi")
	}
	flag.IsEnabledGlobally = enabled
	return nil
}

func (s *MemoryStore) GetInvoices() ([]models.Invoice, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	list := make([]models.Invoice, 0, len(s.invoices))
	for _, inv := range s.invoices {
		list = append(list, *inv)
	}
	return list, nil
}

func (s *MemoryStore) CreateInvoice(inv *models.Invoice) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if inv.ID == "" {
		inv.ID = fmt.Sprintf("INV-%d", time.Now().UnixNano())
	}
	inv.CreatedAt = time.Now()
	s.invoices[inv.ID] = inv
	return nil
}

func (s *MemoryStore) RecordInvoicePayment(id, paymentMethod string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	inv, exists := s.invoices[id]
	if !exists {
		return errors.New("invoys topilmadi")
	}
	inv.Status = "paid"
	inv.PaymentMethod = paymentMethod
	now := time.Now()
	inv.PaidAt = &now

	// Markazning qarzini yangilash
	if org, existsOrg := s.organizations[inv.OrganizationID]; existsOrg {
		if org.OutstandingDebt >= inv.Amount {
			org.OutstandingDebt -= inv.Amount
		} else {
			org.OutstandingDebt = 0
		}
	}

	s.auditLogs = append([]models.AuditLog{{
		ID:        fmt.Sprintf("log-%d", time.Now().UnixNano()),
		Timestamp: time.Now(),
		AdminName: "Super Admin",
		Action:    fmt.Sprintf("Invoys to‘lovi qabul qilindi: %s (%.0f so‘m)", inv.ID, inv.Amount),
		Target:    inv.OrgName,
		IPAddress: "127.0.0.1",
		Status:    "success",
	}}, s.auditLogs...)

	return nil
}

func (s *MemoryStore) GetAuditLogs() ([]models.AuditLog, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.auditLogs, nil
}

func (s *MemoryStore) CreateAuditLog(log *models.AuditLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if log.ID == "" {
		log.ID = fmt.Sprintf("log-%d", time.Now().UnixNano())
	}
	log.Timestamp = time.Now()
	s.auditLogs = append([]models.AuditLog{*log}, s.auditLogs...)
	return nil
}

func (s *MemoryStore) RecordAIUsage(log *models.AIUsageLog) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if log.ID == "" {
		log.ID = fmt.Sprintf("ai-log-%d", time.Now().UnixNano())
	}
	log.CreatedAt = time.Now()
	s.aiLogs = append(s.aiLogs, *log)

	// Update org token usage
	if org, exists := s.organizations[log.OrganizationID]; exists {
		org.AITokensUsed += (log.InputTokens + log.OutputTokens)
	}
	return nil
}
