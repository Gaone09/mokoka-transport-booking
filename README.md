Jones Coaches — Luxury Intercity Transport Platform

A full-stack web application for booking intercity coach travel. Built with **React** (frontend) and **Node.js / Express /PostgreSQL** (backend).

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Environment Variables](#environment-variables)
5. [Database Setup](#database-setup)
6. [Running the App](#running-the-app)
7. [API Reference](#api-reference)
8. [Testing the API](#testing-the-api)
9. [Security Features](#security-features)
10. [Deployment Checklist](#deployment-checklist)

---

## Project Structure

```
jones-coaches/
│
├── frontend/                  ← React app (Vite)
│   └── src/
│       ├── api.js             ← centralised fetch (auto token refresh)
│       ├── App.jsx            ← router + protected routes
│       ├── index.css          ← global styles
│       ├── components/
│       │   └── Navbar.jsx
│       └── pages/
│           ├── Login.jsx      ← sign in / register
│           ├── Home.jsx       ← booking form
│           ├── MyBookings.jsx ← user's trips
│           ├── FindBooking.jsx← lookup by reference
│           └── AdminScanner.jsx ← QR ticket scanner (admin)
│
└── backend/                   ← Node.js / Express API
    ├── server.js              ← entry point
    ├── logger.js              ← Winston logger
    ├── db/pool.js             ← PostgreSQL connection pool
    ├── middleware/
    │   ├── auth.js            ← JWT verify + admin guard
    │   ├── errorHandler.js    ← global error handler
    │   └── validate.js        ← express-validator helper
    ├── routes/
    │   ├── auth.js            ← /api/auth/*
    │   ├── routes.js          ← /api/routes
    │   ├── trips.js           ← /api/trips
    │   ├── bookings.js        ← /api/bookings
    │   ├── admin.js           ← /api/admin/*
    │   └── webhook.js         ← /api/webhooks/stripe
    └── sql/
        ├── schema.sql         ← creates all tables
        └── seed.sql           ← inserts routes, trips, admin user
```

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React 18, Vite, React Router v6                 |
| Backend   | Node.js, Express 4                              |
| Database  | PostgreSQL 16                                   |
| Auth      | JWT (access token 15m) + refresh token (7 days) |
| Payments  | Stripe (PaymentIntents + Webhooks)              |
| Container | Docker + Docker Compose                         |
| Logging   | Winston                                         |

---

## Getting Started

### Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v18 or higher
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

---

## Environment Variables

### Backend — `backend/.env`

Copy the example file and fill in your values:

```bash
cd backend
cp .env.example .env
```

Then open `.env` and set:

```env
# Database (matches docker-compose)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mokoka_transport
DB_USER=mokoka_admin
DB_PASSWORD=strongpassword123

# JWT — generate strong random secrets:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_64_char_random_string_here
REFRESH_SECRET=your_different_64_char_random_string_here

# Server
PORT=5000
NODE_ENV=development

# CORS — your frontend URL
ALLOWED_ORIGIN=http://localhost:5173

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

---

## Database Setup

### Option A — Docker (recommended, zero setup)

```bash
cd backend
docker-compose up postgres -d
```

Docker will automatically run `schema.sql` then `seed.sql` on the first start. That's it — database is ready.

### Option B — Manual PostgreSQL

```bash
# Create the database
psql -U postgres -c "CREATE DATABASE mokoka_transport;"
psql -U postgres -c "CREATE USER mokoka_admin WITH PASSWORD 'strongpassword123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mokoka_transport TO mokoka_admin;"

# Run schema then seed
psql -U mokoka_admin -d mokoka_transport -f backend/sql/schema.sql
psql -U mokoka_admin -d mokoka_transport -f backend/sql/seed.sql
```

---

## Running the App

### Step 1 — Start the database

```bash
cd backend
docker-compose up postgres -d
```

### Step 2 — Start the backend

```bash
cd backend
npm install
npm run dev
```

You should see: `Backend running on port 5000`

Verify it works: open http://localhost:5000/health — you should see:
```json
{ "status": "OK", "db": "connected" }
```

### Step 3 — Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

### Default Admin Account (from seed.sql)

| Field    | Value                       |
|----------|-----------------------------|
| Email    | admin@jonescoaches.com      |
| Password | Admin@1234                  |
| Role     | admin                       |

> ⚠️ Change this password immediately in any non-development environment.

---

## API Reference

Base URL: `http://localhost:5000`

All protected routes require the header:
```
Authorization: Bearer <access_token>
```

---

Detailed API reference, testing examples, and security notes are included in the repository. See `backend/` and `frontend/` for code and configuration.
