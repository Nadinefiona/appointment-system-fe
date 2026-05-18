# Appointment System — Frontend

Next.js App Router client for the Django REST API in `../appointment_system`.

## Setup

```bash
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API should run at `http://127.0.0.1:8000` (see `NEXT_PUBLIC_API_URL`).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Django API base URL (default `http://127.0.0.1:8000`) |

## Architecture

- **`src/lib/api/client.ts`** — Browser client via `/api/proxy/*` (adds JWT from httpOnly cookies server-side).
- **`src/lib/auth/`** — Login/register/logout route handlers set cookies; `AuthProvider` for session UI.
- **`src/middleware.ts`** — Role-based route protection.
- **TanStack Query** — Server state; **react-hook-form + zod** — forms.

API docs: `{API_URL}/api/docs/`

## Roles

| Role | Home route |
|------|------------|
| client | `/client/providers` |
| provider | `/provider/dashboard` |
| admin | `/admin/providers` |
