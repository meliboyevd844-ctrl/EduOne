ALTER TABLE branches
    ADD CONSTRAINT fk_branches_organization
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

ALTER TABLE students
    ADD INDEX idx_students_branch_fk (branch_id),
    ADD CONSTRAINT fk_students_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_students_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;

ALTER TABLE student_payments
    ADD INDEX idx_student_payments_branch_fk (branch_id),
    ADD INDEX idx_student_payments_student_fk (student_id),
    ADD CONSTRAINT fk_student_payments_organization
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_student_payments_branch
        FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_student_payments_student
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;