-- EduOne Multi-Tenant SaaS PostgreSQL Migration: 003_coins_homework_tests_finances.sql
-- Ushbu migratsiya Koin va Mukofotlar, Uyga vazifalar, Testlar, Bilim xaritasi, Markaz xarajatlari va Hamkorlik modullarini qo'shadi.

-- 1. Uyga vazifalar (Homework & Submissions)
CREATE TABLE IF NOT EXISTS homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    coins_reward INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_homework_group ON homework(group_id, deadline);

CREATE TABLE IF NOT EXISTS homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    content TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- submitted, late, reviewed, rejected
    grade INT,
    feedback TEXT,
    coins_awarded INT DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE(homework_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_homework_sub_student ON homework_submissions(student_id);

-- 2. Testlar va Imtihonlar (Tests & Exams)
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 45,
    max_score INT NOT NULL DEFAULT 100,
    pass_score INT NOT NULL DEFAULT 60,
    is_ai_generated BOOLEAN DEFAULT FALSE,
    coins_reward INT NOT NULL DEFAULT 25,
    status VARCHAR(50) DEFAULT 'active', -- draft, active, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tests_org ON tests(organization_id);

CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'single_choice', -- single_choice, multiple_choice, open_ended
    options JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"id": "a", "text": "..."}]
    correct_answer TEXT NOT NULL,
    points INT NOT NULL DEFAULT 5,
    explanation TEXT,
    order_num INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id, order_num);

CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    score INT NOT NULL DEFAULT 0,
    percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL DEFAULT FALSE,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    coins_awarded INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(test_id, student_id, started_at)
);

CREATE INDEX IF NOT EXISTS idx_test_attempts_student ON test_attempts(student_id);

-- 3. Bilim xaritasi va o'zlashtirish tahlili (Knowledge Tracking)
CREATE TABLE IF NOT EXISTS learning_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject VARCHAR(150) NOT NULL,
    topic VARCHAR(200) NOT NULL,
    mastery_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    total_tasks INT NOT NULL DEFAULT 0,
    completed_tasks INT NOT NULL DEFAULT 0,
    strengths TEXT[],
    weaknesses TEXT[],
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject, topic)
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_student ON learning_progress(student_id, subject);

-- 4. Koin va Mukofotlar Tizimi (Coins & Rewards System)
CREATE TABLE IF NOT EXISTS coin_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    balance INT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    total_earned INT NOT NULL DEFAULT 0,
    total_spent INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_coin_wallets_student ON coin_wallets(student_id);

CREATE TABLE IF NOT EXISTS coin_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_code VARCHAR(100) NOT NULL, -- homework_done, test_passed_90, perfect_attendance, extra_assignment
    name VARCHAR(200) NOT NULL,
    coins_amount INT NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    UNIQUE(organization_id, activity_code)
);

CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES coin_wallets(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount INT NOT NULL, -- musbat: mukofot olindi, manfiy: xaridlarga sarflandi
    transaction_type VARCHAR(50) NOT NULL, -- earned, spent, refund, correction
    source_activity VARCHAR(100) NOT NULL,
    reference_id UUID, -- homework_submission_id, test_attempt_id, reward_redemption_id
    authorized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_student ON coin_transactions(student_id, created_at);

CREATE TABLE IF NOT EXISTS reward_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    coin_price INT NOT NULL CHECK (coin_price > 0),
    stock_quantity INT NOT NULL DEFAULT -1, -- -1: cheksiz
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reward_catalog_org ON reward_catalog(organization_id);

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    reward_id UUID NOT NULL REFERENCES reward_catalog(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    coin_amount INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, delivered, rejected, cancelled
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_reward_redemptions_student ON reward_redemptions(student_id);

-- 5. O'quv Markazi Xarajatlari va Ustozlar Oyliklari (B2C Expenses & Salaries)
CREATE TABLE IF NOT EXISTS organization_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    category VARCHAR(100) NOT NULL, -- rent, utilities, equipment, marketing, software, other
    amount NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer',
    recipient VARCHAR(255),
    description TEXT,
    expense_date DATE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_org_expenses_date ON organization_expenses(organization_id, expense_date);

CREATE TABLE IF NOT EXISTS teacher_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    period VARCHAR(20) NOT NULL, -- YYYY-MM
    calculated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    bonuses NUMERIC(15, 2) NOT NULL DEFAULT 0,
    deductions NUMERIC(15, 2) NOT NULL DEFAULT 0,
    net_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, cancelled
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_teacher_salaries_period ON teacher_salaries(organization_id, teacher_id, period);

-- 6. Hamkorlar, Chegirmalar va Bonuslar (Partners & Bonuses)
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT,
    contact_info JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partner_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL: barcha markazlar uchun
    title VARCHAR(255) NOT NULL,
    discount_percent NUMERIC(5, 2),
    promo_code VARCHAR(100),
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INT DEFAULT 100,
    times_used INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_partner_offers_active ON partner_offers(is_active, valid_until);

-- 7. Bildirishnomalar (In-app notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'in_app', -- in_app, telegram, sms
    status VARCHAR(50) NOT NULL DEFAULT 'unread', -- unread, read, sent, failed
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, status);
