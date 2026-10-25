ALTER TABLE students
    ADD COLUMN group_id CHAR(36) NULL,
    ADD COLUMN monthly_fee NUMERIC(15, 2) NOT NULL DEFAULT 600000,
    ADD COLUMN payment_type VARCHAR(30) NOT NULL DEFAULT 'monthly',
    ADD COLUMN enrolled_date DATE NULL,
    ADD COLUMN balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
    ADD COLUMN coins INT NOT NULL DEFAULT 0,
    ADD INDEX idx_students_group (group_id);