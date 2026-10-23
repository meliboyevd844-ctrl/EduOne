# EduOne — Multi-Tenant SaaS Platform for Learning Centers

EduOne is a comprehensive Multi-Tenant SaaS platform designed for educational centers and academies. It combines an intuitive CRM/ERP for branch administrators, a dedicated Teacher Portal, and a powerful Super Admin control panel.

## 🚀 Key Features

- **Multi-Tenant Architecture**: Isolate data per education center with support for multiple branches.
- **Super Admin Platform**: 13 management modules including tenant onboarding, subscription plans, AI monitoring, Telegram bot settings, and audit logs.
- **Center ERP/CRM**:
  - Leads management pipeline (Kanban view)
  - Student and Teacher records
  - Group scheduling and room allocation
  - Attendance tracking with Turnstile / QR code simulator
  - Financial cashier shift management and Click / Payme integration
  - Gamification with EduCoins and rewards shop
- **Teacher Portal**: Class schedules, homework assignments, student grading, and test management.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS, React Router v6, Lucide Icons
- **Backend**: Golang (Go 1.24), Chi Router v5, JWT Authentication, Rate Limiting
- **Database**: PostgreSQL (Multi-tenant migrations included in `backend/migrations/`)
- **Integrations**: Anthropic Claude 3.5 Sonnet, Telegram Bot API, Click, Payme

## 🏁 Getting Started

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
go run cmd/server/main.go
```
