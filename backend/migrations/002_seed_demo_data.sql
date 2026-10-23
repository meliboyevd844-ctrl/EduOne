-- EduOne Multi-Tenant SaaS PostgreSQL Migration: 002_seed_demo_data.sql
-- Boshlang'ich tizim rollari, tariflar va feature flag'lar

-- 1. Rollar
INSERT INTO roles (code, name, description) VALUES
('SUPER_ADMIN', 'Platforma Super Admini', 'Butun EduOne platformasi va barcha tashkilotlarni global boshqarish huquqi'),
('ORG_ADMIN', 'Tashkilot Egasi / Bosh Admini', 'Muayyan o''quv markazining barcha filiallari, moliyasi va xodimlarini boshqarish'),
('BRANCH_ADMIN', 'Filial Boshqaruvchisi', 'Faqat bitta filial darslari, xonalari va o''quvchilarini boshqarish'),
('TEACHER', 'Fan O''qituvchisi', 'O''z guruhlari dars jadvali, davomat olish va baholash huquqi'),
('ASSISTANT', 'Yordamchi O''qituvchi', 'Davomat va uyga vazifalarni tekshirishda ko''maklashish'),
('STUDENT', 'O''quvchi', 'Shaxsiy davomat, dars jadvali va test natijalarini ko''rish'),
('PARENT', 'Ota-ona', 'Farzandining davomati, to''lovlari va bildirishnomalarni qabul qilish')
ON CONFLICT (code) DO NOTHING;

-- 2. Tariflar
INSERT INTO plans (id, name, price_monthly, price_yearly, trial_days, branch_limit, student_limit, ai_token_limit, features) VALUES
('STARTER', 'Boshlang‘ich', 800000.00, 8000000.00, 14, 1, 250, 100000, '["1 ta filial", "250 tagacha o''quvchi", "Dars jadvali", "100k AI token", "Telegram bot"]'::jsonb),
('PRO', 'Professional', 1800000.00, 18000000.00, 14, 5, 1200, 500000, '["5 ta filial", "1200 tagacha o''quvchi", "To''lovlar billingi", "500k AI token", "Telegram bot", "KPI hisobi"]'::jsonb),
('ENTERPRISE', 'Enterprise', 3500000.00, 35000000.00, 30, 20, 5000, 1500000, '["20 ta filial", "5000+ o''quvchi", "Face ID integratsiya", "1.5M AI token", "Shaxsiy subdomen", "24/7 VIP SLA"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Feature Flags
INSERT INTO feature_flags (code, name, description, is_enabled_globally, required_plan) VALUES
('claude_ai', 'Claude AI Asistenti', 'Tashkilot admini va o‘quvchilar uchun Claude API orqali tahlil', TRUE, 'STARTER'),
('telegram_bot', 'Telegram Bot Xabarnomalari', 'Ota-ona va o‘quvchilarga avtomatik dars va to‘lov xabarnomalari', TRUE, 'STARTER'),
('face_id_turnstile', 'Face ID & Turniket Integratsiyasi', 'Kameradan yuzni tanib olish orqali avtomatlashtirilgan davomat tizimi', FALSE, 'ENTERPRISE'),
('online_billing', 'Avtomatlashtirilgan Online Billing', 'Payme va Click shlyuzlari orqali to‘g‘ridan-to‘g‘ri to‘lov', TRUE, 'PRO'),
('ai_student_tutor', 'AI Shaxsiy Repetitor', 'O‘quvchi test natijalari asosida shaxsiy o‘quv rejalari tuzish', TRUE, 'PRO')
ON CONFLICT (code) DO NOTHING;
