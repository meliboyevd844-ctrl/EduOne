package database

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"eduone-backend/internal/models"
	"golang.org/x/crypto/bcrypt"
)

var _ Store = (*MySQLStore)(nil)

type MySQLStore struct {
	db *sql.DB
}

func (s *MySQLStore) GetStudents(organizationID string) ([]models.Student, error) {
	rows, err := s.db.Query(`SELECT st.id, st.organization_id, st.branch_id, st.first_name, st.last_name,
		st.phone, COALESCE(st.parent_name, ''), COALESCE(st.parent_phone, ''), COALESCE(st.group_id, ''),
		COALESCE(g.name, 'Biriktirilmagan'), st.status, st.balance, st.coins, st.monthly_fee,
		st.payment_type, COALESCE(DATE_FORMAT(st.enrolled_date, '%Y-%m-%d'), DATE_FORMAT(st.created_at, '%Y-%m-%d')),
		st.created_at
		FROM students st LEFT JOIN `+"`groups`"+` g ON g.id=st.group_id AND g.organization_id=st.organization_id
		WHERE st.organization_id=? ORDER BY st.created_at DESC`, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	students := make([]models.Student, 0)
	for rows.Next() {
		var student models.Student
		if err := rows.Scan(&student.ID, &student.OrganizationID, &student.BranchID, &student.FirstName,
			&student.LastName, &student.Phone, &student.ParentName, &student.ParentPhone, &student.GroupID,
			&student.GroupName, &student.Status, &student.Balance, &student.Coins, &student.MonthlyFee,
			&student.PaymentType, &student.EnrolledDate, &student.CreatedAt); err != nil {
			return nil, err
		}
		students = append(students, student)
	}
	return students, rows.Err()
}

func (s *MySQLStore) CreateStudent(student *models.Student) error {
	if student.OrganizationID == "" {
		return errors.New("organization_id majburiy")
	}
	if student.ID == "" {
		student.ID = newUUID()
	}
	if student.Status == "" {
		student.Status = "active"
	}
	if student.PaymentType == "" {
		student.PaymentType = "monthly"
	}
	if student.MonthlyFee == 0 {
		student.MonthlyFee = 600000
	}
	if student.GroupName == "" {
		student.GroupName = "Biriktirilmagan"
	}
	if student.CreatedAt.IsZero() {
		student.CreatedAt = time.Now()
	}
	if student.EnrolledDate == "" {
		student.EnrolledDate = student.CreatedAt.Format("2006-01-02")
	}
	if student.BranchID == "" || student.BranchID == "main" {
		err := s.db.QueryRow(`SELECT id FROM branches WHERE organization_id=? ORDER BY is_main DESC, created_at LIMIT 1`, student.OrganizationID).Scan(&student.BranchID)
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("tashkilot uchun filial topilmadi; avval tashkilotga filial qo‘shing")
		}
		if err != nil {
			return err
		}
	}
	var branchExists int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM branches WHERE id=? AND organization_id=?", student.BranchID, student.OrganizationID).Scan(&branchExists); err != nil {
		return err
	}
	if branchExists == 0 {
		return errors.New("filial ushbu tashkilotga tegishli emas")
	}
	if student.GroupID != "" {
		var groupName string
		err := s.db.QueryRow("SELECT name FROM `groups` WHERE id=? AND organization_id=?", student.GroupID, student.OrganizationID).Scan(&groupName)
		if errors.Is(err, sql.ErrNoRows) {
			return errors.New("guruh topilmadi")
		}
		if err != nil {
			return err
		}
		student.GroupName = groupName
	}
	if _, err := time.Parse("2006-01-02", student.EnrolledDate); err != nil {
		return errors.New("enrolled_date YYYY-MM-DD formatida bo‘lishi kerak")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.Exec(`INSERT INTO students (id, organization_id, branch_id, first_name, last_name, phone,
		parent_name, parent_phone, status, group_id, monthly_fee, payment_type, enrolled_date, balance, coins, created_at)
		VALUES (?, ?, ?, ?, ?, ?, NULLIF(?, ''), NULLIF(?, ''), ?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?)`,
		student.ID, student.OrganizationID, student.BranchID, student.FirstName, student.LastName, student.Phone,
		student.ParentName, student.ParentPhone, student.Status, student.GroupID, student.MonthlyFee,
		student.PaymentType, student.EnrolledDate, student.Balance, student.Coins, student.CreatedAt)
	if err != nil {
		return fmt.Errorf("create student: %w", err)
	}
	if _, err := tx.Exec("UPDATE organizations SET students_count=students_count+1 WHERE id=?", student.OrganizationID); err != nil {
		return err
	}
	if student.Coins > 0 {
		if _, err := tx.Exec(`INSERT INTO coin_wallets (id, organization_id, student_id, balance, total_earned)
			VALUES (?, ?, ?, ?, ?)`, newUUID(), student.OrganizationID, student.ID, student.Coins, student.Coins); err != nil {
			return fmt.Errorf("initialize student coin wallet: %w", err)
		}
	}
	return tx.Commit()
}

func (s *MySQLStore) DeleteStudent(organizationID, studentID string) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	result, err := tx.Exec("DELETE FROM students WHERE organization_id=? AND id=?", organizationID, studentID)
	if err != nil {
		return err
	}
	if err := requireAffected(result, "o‘quvchi topilmadi"); err != nil {
		return err
	}
	if _, err := tx.Exec("UPDATE organizations SET students_count=GREATEST(students_count-1, 0) WHERE id=?", organizationID); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *MySQLStore) GetStudentPayments(organizationID string) ([]models.StudentPayment, error) {
	rows, err := s.db.Query(`SELECT p.id, p.organization_id, p.branch_id, p.student_id,
		CONCAT(st.first_name, ' ', st.last_name), p.amount, p.payment_method, p.payment_mode,
		p.payment_month, DATE_FORMAT(p.paid_at, '%Y-%m-%d'), p.receipt_number, COALESCE(p.notes, ''), p.paid_at
		FROM student_payments p JOIN students st ON st.id=p.student_id AND st.organization_id=p.organization_id
		WHERE p.organization_id=? ORDER BY p.paid_at DESC`, organizationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	payments := make([]models.StudentPayment, 0)
	for rows.Next() {
		var payment models.StudentPayment
		if err := rows.Scan(&payment.ID, &payment.OrganizationID, &payment.BranchID, &payment.StudentID,
			&payment.StudentName, &payment.Amount, &payment.PaymentMethod, &payment.PaymentMode,
			&payment.Month, &payment.Date, &payment.ReceiptNumber, &payment.Notes, &payment.CreatedAt); err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}
	return payments, rows.Err()
}

func (s *MySQLStore) RecordStudentPayment(payment *models.StudentPayment) error {
	if payment.OrganizationID == "" || payment.StudentID == "" {
		return errors.New("organization_id va student_id majburiy")
	}
	if payment.Amount <= 0 {
		return errors.New("to‘lov summasi noldan katta bo‘lishi kerak")
	}
	if payment.ID == "" {
		payment.ID = newUUID()
	}
	if payment.PaymentMethod == "" {
		payment.PaymentMethod = "cash"
	}
	if payment.PaymentMode == "" {
		payment.PaymentMode = "monthly"
	}
	if payment.Month == "" {
		payment.Month = time.Now().Format("2006-01")
	}
	if _, err := time.Parse("2006-01", payment.Month); err != nil {
		return errors.New("month YYYY-MM formatida bo‘lishi kerak")
	}
	if payment.ReceiptNumber == "" {
		payment.ReceiptNumber = "RCP-" + strings.ToUpper(newUUID()[:8])
	}
	if payment.CreatedAt.IsZero() {
		payment.CreatedAt = time.Now()
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var firstName, lastName, groupID string
	err = tx.QueryRow(`SELECT st.branch_id, st.first_name, st.last_name, COALESCE(st.group_id, '')
		FROM students st WHERE st.id=? AND st.organization_id=? FOR UPDATE`, payment.StudentID, payment.OrganizationID).
		Scan(&payment.BranchID, &firstName, &lastName, &groupID)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("o‘quvchi ushbu tashkilotda topilmadi")
	}
	if err != nil {
		return err
	}
	payment.StudentName = strings.TrimSpace(firstName + " " + lastName)
	_, err = tx.Exec(`INSERT INTO student_payments
		(id, organization_id, branch_id, student_id, group_id, amount, payment_method, payment_mode,
		payment_month, receipt_number, paid_at, notes)
		VALUES (?, ?, ?, ?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?, NULLIF(?, ''))`, payment.ID,
		payment.OrganizationID, payment.BranchID, payment.StudentID, groupID, payment.Amount,
		payment.PaymentMethod, payment.PaymentMode, payment.Month, payment.ReceiptNumber,
		payment.CreatedAt, payment.Notes)
	if err != nil {
		return fmt.Errorf("record student payment: %w", err)
	}
	if _, err := tx.Exec(`UPDATE students SET balance=balance+?, status='active'
		WHERE id=? AND organization_id=?`, payment.Amount, payment.StudentID, payment.OrganizationID); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *MySQLStore) AwardStudentCoins(organizationID, studentID string, amount int, reason string) error {
	if organizationID == "" || studentID == "" {
		return errors.New("organization_id va student_id majburiy")
	}
	if amount <= 0 {
		return errors.New("coin miqdori noldan katta bo‘lishi kerak")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var branchID string
	err = tx.QueryRow(`SELECT branch_id FROM students WHERE id=? AND organization_id=? FOR UPDATE`, studentID, organizationID).Scan(&branchID)
	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("o‘quvchi ushbu tashkilotda topilmadi")
	}
	if err != nil {
		return err
	}
	var walletID string
	err = tx.QueryRow(`SELECT id FROM coin_wallets WHERE organization_id=? AND student_id=? FOR UPDATE`, organizationID, studentID).Scan(&walletID)
	if errors.Is(err, sql.ErrNoRows) {
		walletID = newUUID()
		if _, err := tx.Exec(`INSERT INTO coin_wallets (id, organization_id, student_id, balance, total_earned)
			VALUES (?, ?, ?, 0, 0)`, walletID, organizationID, studentID); err != nil {
			return err
		}
	} else if err != nil {
		return err
	}
	if _, err := tx.Exec(`UPDATE coin_wallets SET balance=balance+?, total_earned=total_earned+?, updated_at=CURRENT_TIMESTAMP
		WHERE id=?`, amount, amount, walletID); err != nil {
		return err
	}
	if _, err := tx.Exec(`UPDATE students SET coins=coins+? WHERE id=? AND organization_id=?`, amount, studentID, organizationID); err != nil {
		return err
	}
	if _, err := tx.Exec(`INSERT INTO coin_transactions
		(id, organization_id, wallet_id, student_id, amount, transaction_type, source_activity, notes)
		VALUES (?, ?, ?, ?, ?, 'earned', 'manual_award', NULLIF(?, ''))`, newUUID(), organizationID,
		walletID, studentID, amount, reason); err != nil {
		return err
	}
	return tx.Commit()
}

func NewMySQLStore(db *sql.DB, initialAdminPassword, appEnv string) (*MySQLStore, error) {
	if initialAdminPassword == "" {
		return nil, errors.New("SUPERADMIN_INITIAL_PASSWORD is required")
	}
	store := &MySQLStore{db: db}
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(initialAdminPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash initial super admin password: %w", err)
	}
	_, err = db.Exec(`INSERT IGNORE INTO users
		(id, first_name, last_name, phone, email, password_hash, is_super_admin, status)
		VALUES (?, ?, ?, ?, ?, ?, TRUE, 'active')`, newUUID(), "Sardor", "Ikromov", "+998900000001", "superadmin@eduone.uz", string(passwordHash))
	if err != nil {
		return nil, fmt.Errorf("ensure initial super admin: %w", err)
	}
	if !strings.EqualFold(appEnv, "development") {
		var existingHash string
		if err := db.QueryRow("SELECT password_hash FROM users WHERE phone=?", "+998900000001").Scan(&existingHash); err != nil {
			return nil, fmt.Errorf("verify initial super admin: %w", err)
		}
		if bcrypt.CompareHashAndPassword([]byte(existingHash), []byte("admin123")) == nil {
			if _, err := db.Exec("UPDATE users SET password_hash=? WHERE phone=?", string(passwordHash), "+998900000001"); err != nil {
				return nil, fmt.Errorf("rotate default super admin password: %w", err)
			}
		}
	}
	return store, nil
}

func newUUID() string {
	var value [16]byte
	if _, err := rand.Read(value[:]); err != nil {
		panic("crypto/rand unavailable: " + err.Error())
	}
	value[6] = (value[6] & 0x0f) | 0x40
	value[8] = (value[8] & 0x3f) | 0x80
	encoded := hex.EncodeToString(value[:])
	return encoded[:8] + "-" + encoded[8:12] + "-" + encoded[12:16] + "-" + encoded[16:20] + "-" + encoded[20:]
}

func (s *MySQLStore) GetPlatformStats() (*models.PlatformStats, error) {
	stats := &models.PlatformStats{TelegramBotStatus: "online", SystemHealth: 100}
	err := s.db.QueryRow(`SELECT
		COUNT(*),
		COALESCE(SUM(status = 'active'), 0),
		COALESCE(SUM(status = 'trial'), 0),
		COALESCE(SUM(status = 'suspended'), 0),
		COALESCE(SUM(branches_count), 0),
		COALESCE(SUM(students_count), 0),
		COALESCE(SUM(teachers_count), 0),
		COALESCE(SUM(groups_count), 0),
		COALESCE(SUM(CASE WHEN status = 'active' THEN plan_price ELSE 0 END), 0),
		COALESCE(SUM(ai_tokens_used), 0)
		FROM organizations`).Scan(&stats.TotalOrganizations, &stats.ActiveOrganizations, &stats.TrialOrganizations,
		&stats.SuspendedOrganizations, &stats.TotalBranches, &stats.TotalStudents, &stats.TotalTeachers,
		&stats.TotalGroups, &stats.PlatformMRR, &stats.AIMonthlyTokens)
	if err != nil {
		return nil, err
	}
	stats.AIEstimatedCostUSD = float64(stats.AIMonthlyTokens) * 0.000007
	return stats, nil
}

const organizationSelect = `SELECT id, name, slug, subdomain, COALESCE(owner_name, ''), COALESCE(owner_phone, ''),
	COALESCE(owner_email, ''), status, COALESCE(plan_id, ''), COALESCE(plan_name, ''), plan_price,
	branches_count, students_count, teachers_count, groups_count, ai_tokens_used, ai_token_limit,
	CAST(enabled_features AS CHAR), outstanding_debt, subscription_expires_at, created_at FROM organizations`

func scanOrganization(scanner interface{ Scan(...any) error }) (*models.Organization, error) {
	var org models.Organization
	var features string
	var expiresAt sql.NullTime
	if err := scanner.Scan(&org.ID, &org.Name, &org.Slug, &org.Subdomain, &org.OwnerName, &org.OwnerPhone,
		&org.OwnerEmail, &org.Status, &org.PlanID, &org.PlanName, &org.PlanPrice, &org.BranchesCount,
		&org.StudentsCount, &org.TeachersCount, &org.GroupsCount, &org.AITokensUsed, &org.AITokenLimit,
		&features, &org.OutstandingDebt, &expiresAt, &org.CreatedAt); err != nil {
		return nil, err
	}
	if err := json.Unmarshal([]byte(features), &org.EnabledFeatures); err != nil {
		return nil, fmt.Errorf("decode organization features: %w", err)
	}
	if org.EnabledFeatures == nil {
		org.EnabledFeatures = []string{}
	}
	if expiresAt.Valid {
		org.SubscriptionExpiresAt = &expiresAt.Time
	}
	return &org, nil
}

func (s *MySQLStore) GetOrganizations() ([]models.Organization, error) {
	rows, err := s.db.Query(organizationSelect + " ORDER BY created_at DESC")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	organizations := make([]models.Organization, 0)
	for rows.Next() {
		org, err := scanOrganization(rows)
		if err != nil {
			return nil, err
		}
		org.Branches, err = s.getBranches(org.ID)
		if err != nil {
			return nil, err
		}
		organizations = append(organizations, *org)
	}
	return organizations, rows.Err()
}

func (s *MySQLStore) GetOrganizationByID(id string) (*models.Organization, error) {
	org, err := scanOrganization(s.db.QueryRow(organizationSelect+" WHERE id = ?", id))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("tashkilot topilmadi")
	}
	if err != nil {
		return nil, err
	}
	org.Branches, err = s.getBranches(id)
	if err != nil {
		return nil, err
	}
	return org, nil
}

func (s *MySQLStore) GetOrganizationBySlug(slug string) (*models.Organization, error) {
	org, err := scanOrganization(s.db.QueryRow(organizationSelect+" WHERE slug = ?", slug))
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("tashkilot topilmadi")
	}
	if err != nil {
		return nil, err
	}
	org.Branches, err = s.getBranches(org.ID)
	if err != nil {
		return nil, err
	}
	return org, nil
}

func (s *MySQLStore) CreateOrganization(org *models.Organization) error {
	if org.ID == "" {
		org.ID = newUUID()
	}
	if org.Subdomain == "" {
		org.Subdomain = org.Slug + ".eduone.uz"
	}
	if org.Status == "" {
		org.Status = "active"
	}
	if org.CreatedAt.IsZero() {
		org.CreatedAt = time.Now()
	}
	if org.SubscriptionExpiresAt == nil {
		expiresAt := time.Now().Add(30 * 24 * time.Hour)
		org.SubscriptionExpiresAt = &expiresAt
	}
	if len(org.Branches) > 0 {
		org.BranchesCount = len(org.Branches)
	}
	features, err := json.Marshal(org.EnabledFeatures)
	if err != nil {
		return err
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	_, err = tx.Exec(`INSERT INTO organizations
		(id, name, slug, subdomain, status, owner_name, owner_phone, owner_email, plan_id, plan_name,
		plan_price, branches_count, students_count, teachers_count, groups_count, ai_tokens_used,
		ai_token_limit, enabled_features, outstanding_debt, subscription_expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		org.ID, org.Name, org.Slug, org.Subdomain, org.Status, org.OwnerName, org.OwnerPhone, org.OwnerEmail,
		org.PlanID, org.PlanName, org.PlanPrice, org.BranchesCount, org.StudentsCount, org.TeachersCount,
		org.GroupsCount, org.AITokensUsed, org.AITokenLimit, string(features), org.OutstandingDebt,
		org.SubscriptionExpiresAt, org.CreatedAt)
	if err != nil {
		return fmt.Errorf("create organization: %w", err)
	}
	for i := range org.Branches {
		branch := &org.Branches[i]
		branch.OrganizationID = org.ID
		if branch.ID == "" {
			branch.ID = newUUID()
		}
		if _, err := tx.Exec(`INSERT INTO branches (id, organization_id, name, city, address, phone, is_main, status)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, branch.ID, org.ID, branch.Name, branch.City, branch.Address,
			branch.Phone, branch.IsMain, defaultString(branch.Status, "active")); err != nil {
			return fmt.Errorf("create organization branch: %w", err)
		}
	}
	if _, err := tx.Exec(`INSERT INTO audit_logs (id, user_name, action, target, ip_address, status, details, created_at)
		VALUES (?, ?, ?, ?, ?, ?, JSON_OBJECT(), ?)`, newUUID(), "Super Admin", "Yangi tashkilot yaratildi",
		org.Name, "127.0.0.1", "success", time.Now()); err != nil {
		return fmt.Errorf("write organization creation audit log: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return err
	}
	org.BranchesCount = len(org.Branches)
	return nil
}

func (s *MySQLStore) UpdateOrganization(org *models.Organization) error {
	features, err := json.Marshal(org.EnabledFeatures)
	if err != nil {
		return err
	}
	result, err := s.db.Exec(`UPDATE organizations SET name=?, owner_name=?, owner_phone=?, owner_email=?, plan_id=?,
		plan_name=?, plan_price=?, status=?, outstanding_debt=?,
		subscription_expires_at=COALESCE(?, subscription_expires_at),
		enabled_features=IF(?, ?, enabled_features), updated_at=CURRENT_TIMESTAMP
		WHERE id=?`, org.Name, org.OwnerName, org.OwnerPhone, org.OwnerEmail, org.PlanID, org.PlanName,
		org.PlanPrice, org.Status, org.OutstandingDebt, org.SubscriptionExpiresAt, len(org.EnabledFeatures) > 0,
		string(features), org.ID)
	if err != nil {
		return err
	}
	return requireAffected(result, "tashkilot topilmadi")
}

func (s *MySQLStore) UpdateOrganizationStatus(id, status string) error {
	result, err := s.db.Exec("UPDATE organizations SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", status, id)
	if err != nil {
		return err
	}
	return requireAffected(result, "tashkilot topilmadi")
}

func (s *MySQLStore) DeleteOrganization(id string) error {
	result, err := s.db.Exec("DELETE FROM organizations WHERE id=?", id)
	if err != nil {
		return err
	}
	return requireAffected(result, "tashkilot topilmadi")
}

func (s *MySQLStore) ToggleOrganizationFeature(orgID, featureCode string) (bool, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return false, err
	}
	defer tx.Rollback()
	var raw string
	if err := tx.QueryRow("SELECT CAST(enabled_features AS CHAR) FROM organizations WHERE id=? FOR UPDATE", orgID).Scan(&raw); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, errors.New("tashkilot topilmadi")
		}
		return false, err
	}
	features := []string{}
	if err := json.Unmarshal([]byte(raw), &features); err != nil {
		return false, err
	}
	enabled := true
	filtered := make([]string, 0, len(features)+1)
	for _, feature := range features {
		if feature == featureCode {
			enabled = false
			continue
		}
		filtered = append(filtered, feature)
	}
	if enabled {
		filtered = append(filtered, featureCode)
	}
	encoded, err := json.Marshal(filtered)
	if err != nil {
		return false, err
	}
	if _, err := tx.Exec("UPDATE organizations SET enabled_features=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", string(encoded), orgID); err != nil {
		return false, err
	}
	if err := tx.Commit(); err != nil {
		return false, err
	}
	return enabled, nil
}

func (s *MySQLStore) UpdateOrganizationFeatures(orgID string, features []string) error {
	encoded, err := json.Marshal(features)
	if err != nil {
		return err
	}
	result, err := s.db.Exec("UPDATE organizations SET enabled_features=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", string(encoded), orgID)
	if err != nil {
		return err
	}
	return requireAffected(result, "tashkilot topilmadi")
}

func (s *MySQLStore) AddBranch(branch *models.Branch) error {
	if branch.ID == "" {
		branch.ID = newUUID()
	}
	branch.Status = defaultString(branch.Status, "active")
	if branch.CreatedAt.IsZero() {
		branch.CreatedAt = time.Now()
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	if _, err := tx.Exec(`INSERT INTO branches (id, organization_id, name, city, address, phone, is_main, status)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, branch.ID, branch.OrganizationID, branch.Name, branch.City,
		branch.Address, branch.Phone, branch.IsMain, branch.Status); err != nil {
		return fmt.Errorf("create branch: %w", err)
	}
	if _, err := tx.Exec("UPDATE organizations SET branches_count=branches_count+1, updated_at=CURRENT_TIMESTAMP WHERE id=?", branch.OrganizationID); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *MySQLStore) getBranches(orgID string) ([]models.Branch, error) {
	rows, err := s.db.Query(`SELECT id, organization_id, name, city, address, COALESCE(phone, ''), is_main, status, created_at
		FROM branches WHERE organization_id=? ORDER BY created_at`, orgID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	branches := make([]models.Branch, 0)
	for rows.Next() {
		var branch models.Branch
		if err := rows.Scan(&branch.ID, &branch.OrganizationID, &branch.Name, &branch.City, &branch.Address,
			&branch.Phone, &branch.IsMain, &branch.Status, &branch.CreatedAt); err != nil {
			return nil, err
		}
		branches = append(branches, branch)
	}
	return branches, rows.Err()
}

func (s *MySQLStore) GetUserByPhone(phone string) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(`SELECT u.id, u.first_name, u.last_name, u.phone, COALESCE(u.email, ''), u.password_hash,
		u.is_super_admin, u.status, u.created_at, COALESCE(m.organization_id, ''), COALESCE(m.branch_id, ''), COALESCE(m.role_code, '')
		FROM users u LEFT JOIN organization_memberships m ON m.user_id=u.id
		WHERE u.phone=? ORDER BY m.is_primary_owner DESC, m.created_at ASC LIMIT 1`, phone).Scan(&user.ID, &user.FirstName,
		&user.LastName, &user.Phone, &user.Email, &user.PasswordHash, &user.IsSuperAdmin, &user.Status,
		&user.CreatedAt, &user.OrganizationID, &user.BranchID, &user.RoleCode)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, errors.New("foydalanuvchi topilmadi")
	}
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *MySQLStore) CreateOrganizationMember(orgID, branchID, roleCode string, user *models.User) error {
	if orgID == "" || user.FirstName == "" || user.Phone == "" || user.PasswordHash == "" {
		return errors.New("organization, first name, phone va password majburiy")
	}
	if roleCode == "" || roleCode == "SUPER_ADMIN" {
		return errors.New("tenant member uchun yaroqli role_code talab qilinadi")
	}
	var roleExists int
	if err := s.db.QueryRow("SELECT COUNT(*) FROM roles WHERE code=? AND code <> 'SUPER_ADMIN'", roleCode).Scan(&roleExists); err != nil {
		return err
	}
	if roleExists == 0 {
		return errors.New("role topilmadi yoki tenant uchun ruxsat etilmagan")
	}
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	var orgExists int
	if err := tx.QueryRow("SELECT COUNT(*) FROM organizations WHERE id=?", orgID).Scan(&orgExists); err != nil {
		return err
	}
	if orgExists == 0 {
		return errors.New("tashkilot topilmadi")
	}
	if branchID != "" {
		var branchExists int
		if err := tx.QueryRow("SELECT COUNT(*) FROM branches WHERE id=? AND organization_id=?", branchID, orgID).Scan(&branchExists); err != nil {
			return err
		}
		if branchExists == 0 {
			return errors.New("filial ushbu tashkilotga tegishli emas")
		}
	}
	var userID string
	err = tx.QueryRow("SELECT id FROM users WHERE phone=?", user.Phone).Scan(&userID)
	if err == nil {
		return errors.New("telefon raqam bilan foydalanuvchi mavjud; password reset o‘rniga alohida membership amali kerak")
	}
	if !errors.Is(err, sql.ErrNoRows) {
		return err
	}
	userID = newUUID()
	user.ID = userID
	user.OrganizationID = orgID
	user.BranchID = branchID
	user.RoleCode = roleCode
	user.Status = "active"
	if _, err := tx.Exec(`INSERT INTO users (id, first_name, last_name, phone, email, password_hash, is_super_admin, status)
		VALUES (?, ?, ?, ?, NULLIF(?, ''), ?, FALSE, 'active')`, userID, user.FirstName, user.LastName,
		user.Phone, user.Email, user.PasswordHash); err != nil {
		return fmt.Errorf("create tenant user: %w", err)
	}
	if _, err := tx.Exec(`INSERT INTO organization_memberships (id, user_id, organization_id, branch_id, role_code, is_primary_owner)
		VALUES (?, ?, ?, NULLIF(?, ''), ?, ?)`, newUUID(), userID, orgID, branchID, roleCode, roleCode == "ORG_ADMIN"); err != nil {
		return fmt.Errorf("create organization membership: %w", err)
	}
	return tx.Commit()
}

func (s *MySQLStore) GetPlans() ([]models.Plan, error) {
	rows, err := s.db.Query(`SELECT id, name, price_monthly, price_yearly, trial_days, branch_limit,
		student_limit, ai_token_limit, CAST(features AS CHAR), is_active FROM plans ORDER BY price_monthly`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	plans := make([]models.Plan, 0)
	for rows.Next() {
		var plan models.Plan
		var features string
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.PriceMonthly, &plan.PriceYearly, &plan.TrialDays,
			&plan.BranchLimit, &plan.StudentLimit, &plan.AITokenLimit, &features, &plan.IsActive); err != nil {
			return nil, err
		}
		if err := json.Unmarshal([]byte(features), &plan.Features); err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}
	return plans, rows.Err()
}

func (s *MySQLStore) CreatePlan(plan *models.Plan) error {
	if plan.ID == "" {
		plan.ID = "PLAN-" + newUUID()[:8]
	}
	features, err := json.Marshal(plan.Features)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`INSERT INTO plans (id, name, price_monthly, price_yearly, trial_days, branch_limit,
		student_limit, ai_token_limit, features, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, plan.ID,
		plan.Name, plan.PriceMonthly, plan.PriceYearly, plan.TrialDays, plan.BranchLimit, plan.StudentLimit,
		plan.AITokenLimit, string(features), plan.IsActive)
	return err
}

func (s *MySQLStore) UpdatePlan(plan *models.Plan) error {
	features, err := json.Marshal(plan.Features)
	if err != nil {
		return err
	}
	result, err := s.db.Exec(`UPDATE plans SET name=?, price_monthly=?, price_yearly=?, trial_days=?, branch_limit=?,
		student_limit=?, ai_token_limit=?, features=?, is_active=? WHERE id=?`, plan.Name, plan.PriceMonthly,
		plan.PriceYearly, plan.TrialDays, plan.BranchLimit, plan.StudentLimit, plan.AITokenLimit,
		string(features), plan.IsActive, plan.ID)
	if err != nil {
		return err
	}
	return requireAffected(result, "tarif topilmadi")
}

func (s *MySQLStore) DeletePlan(id string) error {
	result, err := s.db.Exec("DELETE FROM plans WHERE id=?", id)
	if err != nil {
		return err
	}
	return requireAffected(result, "tarif topilmadi")
}

func (s *MySQLStore) GetFeatureFlags() ([]models.FeatureFlag, error) {
	rows, err := s.db.Query(`SELECT code, name, COALESCE(description, ''), is_enabled_globally,
		COALESCE(required_plan, '') FROM feature_flags ORDER BY code`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	flags := make([]models.FeatureFlag, 0)
	for rows.Next() {
		var flag models.FeatureFlag
		if err := rows.Scan(&flag.Code, &flag.Name, &flag.Description, &flag.IsEnabledGlobally, &flag.RequiredPlan); err != nil {
			return nil, err
		}
		flags = append(flags, flag)
	}
	return flags, rows.Err()
}

func (s *MySQLStore) UpdateFeatureFlag(code string, enabled bool) error {
	result, err := s.db.Exec("UPDATE feature_flags SET is_enabled_globally=?, updated_at=CURRENT_TIMESTAMP WHERE code=?", enabled, code)
	if err != nil {
		return err
	}
	return requireAffected(result, "feature flag topilmadi")
}

func (s *MySQLStore) GetInvoices() ([]models.Invoice, error) {
	rows, err := s.db.Query(`SELECT i.id, i.organization_id, COALESCE(o.name, ''), COALESCE(o.plan_name, ''),
		i.amount, i.status, COALESCE(i.payment_method, ''), i.paid_at, i.due_date, i.created_at
		FROM invoices i LEFT JOIN organizations o ON o.id=i.organization_id ORDER BY i.created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	invoices := make([]models.Invoice, 0)
	for rows.Next() {
		var invoice models.Invoice
		var paidAt sql.NullTime
		if err := rows.Scan(&invoice.ID, &invoice.OrganizationID, &invoice.OrgName, &invoice.PlanName,
			&invoice.Amount, &invoice.Status, &invoice.PaymentMethod, &paidAt, &invoice.DueDate, &invoice.CreatedAt); err != nil {
			return nil, err
		}
		if paidAt.Valid {
			invoice.PaidAt = &paidAt.Time
		}
		invoices = append(invoices, invoice)
	}
	return invoices, rows.Err()
}

func (s *MySQLStore) CreateInvoice(invoice *models.Invoice) error {
	if invoice.ID == "" {
		invoice.ID = "INV-" + newUUID()[:12]
	}
	if invoice.DueDate.IsZero() {
		invoice.DueDate = time.Now().Add(30 * 24 * time.Hour)
	}
	if invoice.CreatedAt.IsZero() {
		invoice.CreatedAt = time.Now()
	}
	_, err := s.db.Exec(`INSERT INTO invoices (id, organization_id, amount, status, payment_method, paid_at, due_date, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, invoice.ID, invoice.OrganizationID, invoice.Amount,
		defaultString(invoice.Status, "pending"), nullableString(invoice.PaymentMethod), invoice.PaidAt,
		invoice.DueDate, invoice.CreatedAt)
	return err
}

func (s *MySQLStore) RecordInvoicePayment(id, paymentMethod string) error {
	result, err := s.db.Exec(`UPDATE invoices SET status='paid', payment_method=?, paid_at=CURRENT_TIMESTAMP WHERE id=?`, paymentMethod, id)
	if err != nil {
		return err
	}
	return requireAffected(result, "invoys topilmadi")
}

func (s *MySQLStore) GetAuditLogs() ([]models.AuditLog, error) {
	rows, err := s.db.Query(`SELECT id, created_at, COALESCE(user_name, ''), action, target,
		COALESCE(ip_address, ''), COALESCE(status, '') FROM audit_logs ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	logs := make([]models.AuditLog, 0)
	for rows.Next() {
		var entry models.AuditLog
		if err := rows.Scan(&entry.ID, &entry.Timestamp, &entry.AdminName, &entry.Action, &entry.Target,
			&entry.IPAddress, &entry.Status); err != nil {
			return nil, err
		}
		logs = append(logs, entry)
	}
	return logs, rows.Err()
}

func (s *MySQLStore) CreateAuditLog(entry *models.AuditLog) error {
	if entry.ID == "" {
		entry.ID = newUUID()
	}
	if entry.Timestamp.IsZero() {
		entry.Timestamp = time.Now()
	}
	_, err := s.db.Exec(`INSERT INTO audit_logs (id, user_name, action, target, ip_address, status, details, created_at)
		VALUES (?, ?, ?, ?, ?, ?, JSON_OBJECT(), ?)`, entry.ID, entry.AdminName, entry.Action, entry.Target,
		entry.IPAddress, defaultString(entry.Status, "success"), entry.Timestamp)
	return err
}

func (s *MySQLStore) RecordAIUsage(entry *models.AIUsageLog) error {
	if entry.ID == "" {
		entry.ID = newUUID()
	}
	if entry.CreatedAt.IsZero() {
		entry.CreatedAt = time.Now()
	}
	_, err := s.db.Exec(`INSERT INTO ai_usage_logs (id, organization_id, tool_called, input_tokens, output_tokens,
		cost_usd, latency_ms, status, created_at) VALUES (?, NULLIF(?, ''), ?, ?, ?, ?, ?, ?, ?)`, entry.ID,
		entry.OrganizationID, entry.ToolCalled, entry.InputTokens, entry.OutputTokens, entry.CostUSD,
		entry.LatencyMs, defaultString(entry.Status, "success"), entry.CreatedAt)
	if err != nil {
		return err
	}
	if entry.OrganizationID != "" {
		_, err = s.db.Exec("UPDATE organizations SET ai_tokens_used=ai_tokens_used+? WHERE id=?", entry.InputTokens+entry.OutputTokens, entry.OrganizationID)
	}
	return err
}

func (s *MySQLStore) getBranchesCount(orgID string) (int, error) {
	var count int
	err := s.db.QueryRow("SELECT COUNT(*) FROM branches WHERE organization_id=?", orgID).Scan(&count)
	return count, err
}

func requireAffected(result sql.Result, missingMessage string) error {
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		return errors.New(missingMessage)
	}
	return nil
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func nullableString(value string) any {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	return value
}
