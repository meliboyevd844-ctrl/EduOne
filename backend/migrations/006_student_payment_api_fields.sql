ALTER TABLE student_payments
    ADD COLUMN payment_mode VARCHAR(30) NOT NULL DEFAULT 'monthly',
    ADD COLUMN payment_month CHAR(7) NULL,
    ADD COLUMN receipt_number VARCHAR(40) NULL;

UPDATE student_payments
SET payment_month = DATE_FORMAT(paid_at, '%Y-%m'),
    receipt_number = CONCAT('RCP-LEGACY-', id);

ALTER TABLE student_payments
    MODIFY payment_month CHAR(7) NOT NULL,
    MODIFY receipt_number VARCHAR(40) NOT NULL,
    ADD UNIQUE INDEX idx_student_payments_receipt (receipt_number);