ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_code) REFERENCES roles(code) ON DELETE CASCADE;
ALTER TABLE role_permissions ADD CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_code) REFERENCES permissions(code) ON DELETE CASCADE;

ALTER TABLE organization_memberships ADD CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE organization_memberships ADD CONSTRAINT fk_memberships_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE organization_memberships ADD CONSTRAINT fk_memberships_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE organization_memberships ADD CONSTRAINT fk_memberships_role FOREIGN KEY (role_code) REFERENCES roles(code) ON DELETE RESTRICT;

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT;
ALTER TABLE invoices ADD CONSTRAINT fk_invoices_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;
ALTER TABLE feature_flags ADD CONSTRAINT fk_feature_flags_plan FOREIGN KEY (required_plan) REFERENCES plans(id) ON DELETE SET NULL;

ALTER TABLE `groups` ADD CONSTRAINT fk_groups_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE `groups` ADD CONSTRAINT fk_groups_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
ALTER TABLE teachers ADD CONSTRAINT fk_teachers_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE teachers ADD CONSTRAINT fk_teachers_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE teachers ADD CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE students ADD CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE students ADD CONSTRAINT fk_students_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL;

ALTER TABLE lessons ADD CONSTRAINT fk_lessons_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT fk_lessons_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT fk_lessons_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE;
ALTER TABLE lessons ADD CONSTRAINT fk_lessons_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
ALTER TABLE attendance ADD CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE student_payments ADD CONSTRAINT fk_student_payments_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL;

ALTER TABLE telegram_accounts ADD CONSTRAINT fk_telegram_accounts_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE telegram_accounts ADD CONSTRAINT fk_telegram_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE telegram_accounts ADD CONSTRAINT fk_telegram_accounts_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE ai_usage_logs ADD CONSTRAINT fk_ai_usage_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE ai_usage_logs ADD CONSTRAINT fk_ai_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE audit_logs ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE homework ADD CONSTRAINT fk_homework_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE homework ADD CONSTRAINT fk_homework_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE;
ALTER TABLE homework ADD CONSTRAINT fk_homework_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE;
ALTER TABLE homework ADD CONSTRAINT fk_homework_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;
ALTER TABLE homework_submissions ADD CONSTRAINT fk_homework_submissions_homework FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE;
ALTER TABLE homework_submissions ADD CONSTRAINT fk_homework_submissions_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE homework_submissions ADD CONSTRAINT fk_homework_submissions_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tests ADD CONSTRAINT fk_tests_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE tests ADD CONSTRAINT fk_tests_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE tests ADD CONSTRAINT fk_tests_group FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL;
ALTER TABLE tests ADD CONSTRAINT fk_tests_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE test_questions ADD CONSTRAINT fk_test_questions_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
ALTER TABLE test_attempts ADD CONSTRAINT fk_test_attempts_test FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE;
ALTER TABLE test_attempts ADD CONSTRAINT fk_test_attempts_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE learning_progress ADD CONSTRAINT fk_learning_progress_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE learning_progress ADD CONSTRAINT fk_learning_progress_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;

ALTER TABLE coin_rules ADD CONSTRAINT fk_coin_rules_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE reward_catalog ADD CONSTRAINT fk_reward_catalog_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE reward_redemptions ADD CONSTRAINT fk_reward_redemptions_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE reward_redemptions ADD CONSTRAINT fk_reward_redemptions_reward FOREIGN KEY (reward_id) REFERENCES reward_catalog(id) ON DELETE RESTRICT;
ALTER TABLE reward_redemptions ADD CONSTRAINT fk_reward_redemptions_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE;
ALTER TABLE reward_redemptions ADD CONSTRAINT fk_reward_redemptions_processor FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE organization_expenses ADD CONSTRAINT fk_expenses_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE organization_expenses ADD CONSTRAINT fk_expenses_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE organization_expenses ADD CONSTRAINT fk_expenses_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE teacher_salaries ADD CONSTRAINT fk_teacher_salaries_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE teacher_salaries ADD CONSTRAINT fk_teacher_salaries_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE teacher_salaries ADD CONSTRAINT fk_teacher_salaries_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;
ALTER TABLE partner_offers ADD CONSTRAINT fk_partner_offers_partner FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE CASCADE;
ALTER TABLE partner_offers ADD CONSTRAINT fk_partner_offers_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;