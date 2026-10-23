package models

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type User struct {
	ID             string    `json:"id"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Phone          string    `json:"phone"`
	Email          string    `json:"email"`
	PasswordHash   string    `json:"-"`
	IsSuperAdmin   bool      `json:"is_super_admin"`
	OrganizationID string    `json:"organization_id,omitempty"`
	BranchID       string    `json:"branch_id,omitempty"`
	RoleCode       string    `json:"role_code,omitempty"`
	Status         string    `json:"status"` // active, blocked
	CreatedAt      time.Time `json:"created_at"`
}

type UserClaims struct {
	UserID       string `json:"user_id"`
	Phone        string `json:"phone"`
	IsSuperAdmin bool   `json:"is_super_admin"`
	OrgID        string `json:"org_id,omitempty"`
	RoleCode     string `json:"role_code,omitempty"`
	jwt.RegisteredClaims
}

type Branch struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	Name           string    `json:"name"`
	City           string    `json:"city"`
	Address        string    `json:"address"`
	Phone          string    `json:"phone"`
	IsMain         bool      `json:"is_main"`
	Status         string    `json:"status"`
	StudentsCount  int       `json:"students_count"`
	CreatedAt      time.Time `json:"created_at"`
}

type Student struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	BranchID       string    `json:"branch_id"`
	UserID         string    `json:"user_id,omitempty"`
	FirstName      string    `json:"first_name"`
	LastName       string    `json:"last_name"`
	Phone          string    `json:"phone"`
	ParentName     string    `json:"parent_name,omitempty"`
	ParentPhone    string    `json:"parent_phone,omitempty"`
	GroupID        string    `json:"group_id,omitempty"`
	GroupName      string    `json:"group_name"`
	Status         string    `json:"status"`
	Balance        float64   `json:"balance"`
	Coins          int       `json:"coins"`
	MonthlyFee     float64   `json:"monthly_fee"`
	PaymentType    string    `json:"payment_type"`
	EnrolledDate   string    `json:"enrolled_date"`
	CreatedAt      time.Time `json:"created_at"`
}

type StudentPayment struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	BranchID       string    `json:"branch_id"`
	StudentID      string    `json:"student_id"`
	StudentName    string    `json:"student_name"`
	Amount         float64   `json:"amount"`
	PaymentMethod  string    `json:"payment_method"`
	PaymentMode    string    `json:"payment_mode"`
	Month          string    `json:"month"`
	Date           string    `json:"date"`
	ReceiptNumber  string    `json:"receipt_number"`
	Notes          string    `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
}

type Organization struct {
	ID                    string     `json:"id"`
	Name                  string     `json:"name"`
	Slug                  string     `json:"slug"`
	Subdomain             string     `json:"subdomain"`
	OwnerName             string     `json:"owner_name"`
	OwnerPhone            string     `json:"owner_phone"`
	OwnerEmail            string     `json:"owner_email"`
	Status                string     `json:"status"` // active, trial, suspended, cancelled
	PlanID                string     `json:"plan_id"`
	PlanName              string     `json:"plan_name"`
	PlanPrice             float64    `json:"plan_price"`
	BranchesCount         int        `json:"branches_count"`
	StudentsCount         int        `json:"students_count"`
	TeachersCount         int        `json:"teachers_count"`
	GroupsCount           int        `json:"groups_count"`
	AITokensUsed          int        `json:"ai_tokens_used"`
	AITokenLimit          int        `json:"ai_token_limit"`
	EnabledFeatures       []string   `json:"enabled_features"` // Har bitta markazga biriktirilgan maxsus modullar ro'yxati
	OutstandingDebt       float64    `json:"outstanding_debt"`
	SubscriptionExpiresAt *time.Time `json:"subscription_expires_at,omitempty"`
	Branches              []Branch   `json:"branches,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
}

type Plan struct {
	ID           string   `json:"id"`
	Name         string   `json:"name"`
	PriceMonthly float64  `json:"price_monthly"`
	PriceYearly  float64  `json:"price_yearly"`
	TrialDays    int      `json:"trial_days"`
	BranchLimit  int      `json:"branch_limit"`
	StudentLimit int      `json:"student_limit"`
	AITokenLimit int      `json:"ai_token_limit"`
	Features     []string `json:"features"`
	IsActive     bool     `json:"is_active"`
}

type FeatureFlag struct {
	Code              string `json:"code"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	IsEnabledGlobally bool   `json:"is_enabled_globally"`
	RequiredPlan      string `json:"required_plan"`
}

type AuditLog struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	AdminName string    `json:"admin_name"`
	Action    string    `json:"action"`
	Target    string    `json:"target"`
	IPAddress string    `json:"ip_address"`
	Status    string    `json:"status"`
}

type AIUsageLog struct {
	ID             string    `json:"id"`
	OrganizationID string    `json:"organization_id"`
	ToolCalled     string    `json:"tool_called"`
	InputTokens    int       `json:"input_tokens"`
	OutputTokens   int       `json:"output_tokens"`
	CostUSD        float64   `json:"cost_usd"`
	LatencyMs      int       `json:"latency_ms"`
	Status         string    `json:"status"`
	CreatedAt      time.Time `json:"created_at"`
}

type PlatformStats struct {
	TotalOrganizations     int     `json:"total_organizations"`
	ActiveOrganizations    int     `json:"active_organizations"`
	TrialOrganizations     int     `json:"trial_organizations"`
	SuspendedOrganizations int     `json:"suspended_organizations"`
	TotalBranches          int     `json:"total_branches"`
	TotalStudents          int     `json:"total_students"`
	TotalTeachers          int     `json:"total_teachers"`
	TotalGroups            int     `json:"total_groups"`
	PlatformMRR            float64 `json:"platform_mrr"`
	AIMonthlyTokens        int     `json:"ai_monthly_tokens"`
	AIEstimatedCostUSD     float64 `json:"ai_estimated_cost_usd"`
	TelegramBotStatus      string  `json:"telegram_bot_status"`
	TelegramMessagesSent   int     `json:"telegram_messages_sent"`
	SystemHealth           float64 `json:"system_health"`
}

type Invoice struct {
	ID             string     `json:"id"`
	OrganizationID string     `json:"organization_id"`
	OrgName        string     `json:"org_name"`
	PlanName       string     `json:"plan_name"`
	Amount         float64    `json:"amount"`
	Status         string     `json:"status"` // paid, pending, failed, overdue
	PaymentMethod  string     `json:"payment_method,omitempty"`
	PaidAt         *time.Time `json:"paid_at,omitempty"`
	DueDate        time.Time  `json:"due_date"`
	CreatedAt      time.Time  `json:"created_at"`
}
