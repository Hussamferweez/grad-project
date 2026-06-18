# Clinico - Dental Clinic Management System

Production-ready full-stack dental clinic platform with role-based doctor/patient portals, Supabase auth/database, modern UI, and responsive dashboards.

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS + shadcn/ui + Radix UI + clsx + tailwind-merge
- Framer Motion animations
- Supabase (Auth + PostgreSQL + Storage)
- React Hook Form + Zod
- date-fns + react-day-picker
- Recharts
- Sonner toasts
- Zustand state

## Project Structure

```text
clinico/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (doctor)/doctor/
│   │   ├── dashboard/page.tsx
│   │   ├── patients/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── appointments/page.tsx
│   │   ├── calendar/page.tsx
│   │   ├── medical-records/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (patient)/patient/
│   │   ├── dashboard/page.tsx
│   │   ├── appointments/page.tsx
│   │   ├── medical-records/page.tsx
│   │   ├── payments/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── auth/callback/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── components/
│   ├── appointments/
│   ├── common/
│   ├── dashboard/
│   ├── forms/
│   ├── patients/
│   └── ui/
├── hooks/
├── lib/
├── store/
├── types/
├── supabase/
│   ├── client.ts
│   ├── middleware.ts
│   ├── queries.ts
│   ├── server.ts
│   └── schema.sql
├── public/
├── middleware.ts
├── .env.example
├── package.json
├── tailwind.config.ts
└── ...
```

## Setup

1. Create a Supabase project.
2. In Supabase SQL editor, run `supabase/schema.sql`.
3. Enable auth providers:
   1. Email/Password
   2. Google OAuth (set callback URL to `http://localhost:3000/auth/callback`)
4. Copy env file:

```bash
cp .env.example .env.local
```

5. Add your keys in `.env.local`.
6. Install dependencies and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Roles

- **Doctor**: Full dashboard, patient CRUD, appointments CRUD, calendar, records, billing.
- **Patient**: Personal dashboard, appointments, medical record, payments, profile.

## Notes

- Middleware protects role routes and redirects users to the proper portal.
- OAuth callback auto-creates profile records and patient rows when needed.
- Billing page includes mock Stripe checkout action for demo flow.
