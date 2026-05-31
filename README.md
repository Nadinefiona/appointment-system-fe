# Appoint — Frontend

A simple appointment booking app. Clients book services, providers manage their hours, and admins oversee everything.

## Features

- Book a service by provider, date, and available time
- View, cancel, and re-book appointments
- Providers set weekly availability and see their schedule
- Admins manage users, services, and bookings

## Tech

Next.js (App Router) · React · TypeScript · Tailwind CSS · TanStack Query

## Getting started

```bash
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm install
npm run dev
```

Open http://localhost:3000. The backend API should be running (default `http://127.0.0.1:8000`).
