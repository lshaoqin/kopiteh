# Kopiteh — Technical & Operational Documentation

**Version:** 1.0.0  
**Last Updated:** July 2026  
**Stack:** Express (Node.js 22) + Next.js 15 (React 19) + PostgreSQL 17 + Socket.io

---

## Table of Contents

1. [Solution Architecture & Technical Design](#1-solution-architecture--technical-design)
2. [Deployment & Rollback Procedures](#2-deployment--rollback-procedures)
3. [Configuration Guide](#3-configuration-guide)
4. [Operations / Support Runbook](#4-operations--support-runbook)
5. [Troubleshooting Guide](#5-troubleshooting-guide)
6. [API / Interface Documentation](#6-api--interface-documentation)
7. [Database / Data Model Documentation](#7-database--data-model-documentation)
8. [Known Issues, Limitations & Workarounds](#8-known-issues-limitations--workarounds)
9. [Monitoring & Alerting Information](#9-monitoring--alerting-information)

---

## 1. Solution Architecture & Technical Design

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │  Admin   │  │  Runner  │  │ Ordering │   (Next.js 15 SPA)    │
│  │  Panel   │  │  Panel   │  │   Flow   │                       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                       │
│       │              │              │                           │
│       │    HTTP REST + Socket.io     │    (WebSocket for        │
│       │              │              │     real-time updates)    │
└───────┼──────────────┼──────────────┼───────────────────────────┘
        │              │              │
   ┌────▼──────────────▼──────────────▼─────┐
   │         EXPRESS API (Port 4000)        │
   │  ┌──────────────────────────────────┐  │
   │  │  Controllers → Services → DB     │  │
   │  │  Middleware (Auth, Validation,   │  │
   │  │    Multer, ErrorHandler)         │  │
   │  │  Socket.io Server                │  │
   │  └──────────────────────────────────┘  │
   └────────────────┬───────────────────────┘
                    │
   ┌────────────────▼───────────────────────┐
   │       PostgreSQL 17 (Port 5432)        │
   │  ┌──────────────────────────────────┐  │
   │  │  venue, stalls, menu_item,       │  │
   │  │  orders, order_item, users,      │  │
   │  │  tables, user_sessions ...       │  │
   │  └──────────────────────────────────┘  │
   └────────────────────────────────────────┘
   ┌────────────────────────────────────────┐
   │    Supabase S3 Storage (Images)        │
   └────────────────────────────────────────┘
   ┌────────────────────────────────────────┐
   │    SendGrid (Email — password reset)   │
   └────────────────────────────────────────┘
```

### 1.2 Monorepo Structure

```
kopiteh/
├── types/                  # Shared TypeScript DTOs (imported by frontend)
│   ├── auth.ts             # User, UserRole, auth payloads
│   ├── venue.ts            # Venue interface
│   ├── stall.ts            # Stall interface
│   ├── table.ts            # Table interface
│   ├── item.ts             # MenuItem, Modifier, Category
│   ├── order.ts            # Order, OrderItem, status enums
│   └── common.ts           # ID, Decimal type aliases
│
├── backend/                # Express API (Dockerized)
│   ├── Dockerfile           # Node 22 Alpine, ts-node-dev hot reload
│   ├── docker-compose.yml   # PostgreSQL 17 + Express
│   ├── migrations/          # Sequential .sql files
│   └── src/
│       ├── index.ts         # App entry (HTTP + WebSocket server)
│       ├── seed.ts          # Database seeder
│       ├── config/          # DB pool, S3 storage client
│       ├── types/           # Backend-specific types (errors, success, payloads)
│       ├── middleware/      # Auth, validation (zod + express-validator), multer
│       ├── controllers/     # HTTP request handlers
│       ├── services/        # Business logic (DB queries, WebSocket)
│       └── routes/          # Express router definitions
│
├── frontend/               # Next.js 15 App Router
│   ├── app/                # /admin, /runner, /ordering page routes
│   ├── components/ui/      # shadcn/ui + custom components
│   ├── stores/             # Zustand state (auth, cart, runner)
│   ├── context/            # AuthContext (token refresh), WebSocketContext
│   ├── lib/                # API client (fetchClient), mock data, utils
│   └── public/             # Static assets
│
└── package.json            # Root placeholder (TypeScript dep only)
```

### 1.3 Backend Architecture (Layered Pattern)

Every resource follows this flow:

```
Routes ──→ Validation Middleware ──→ Controller ──→ Service ──→ Database
  │              (express-validator)      │              │          (pg Pool)
  │                                       │              │
  │                                  BadRequestError    ServiceResult<T>
  │                                  (400 validation)   (success/error)
  │
  └──→ Response: { success, code, payload: { status, message, data } }
```

**Key patterns:**
- **No ORM** — raw parameterised SQL via `pg.Pool`
- **BaseService** provides `query()` and `tx()` (transaction wrapper with auto ROLLBACK)
- **ServiceResult<T>** union type returned by all services — controllers unwrap it
- **Error handler middleware** catches thrown `BadRequestError` instances and unhandled errors
- **Image uploads** go to Supabase S3-compatible storage via `@aws-sdk/client-s3`
- **Email** (password reset) via SendGrid
- **Waiting time** for stalls is calculated dynamically from active order items' `prep_time` in the last 24 hours (no stored column)

### 1.4 Frontend Architecture

- **Next.js 15** with App Router, **Turbopack** dev server
- **Three modules:** `/admin`, `/runner`, `/ordering`
- **State management:** Zustand with `persist` middleware (localStorage)
  - `auth.store.ts` — JWT tokens, user info
  - `cart.store.ts` — shopping cart with venue/table/volunteer context
  - `runner.store.ts` — runner authentication state
- **AuthContext** — auto-refreshes JWT on app boot (checks stored refresh token)
- **WebSocketContext** — singleton Socket.io client; auto-joins user room; exposes `joinStall` / `leaveStall`
- **API client** (`lib/api.ts`) — `fetchClient<T>()` unwraps the backend's nested response shape automatically
- **Styling:** Tailwind CSS v4 + shadcn/ui components (Radix primitives)

### 1.5 Real-Time Communication (WebSocket)

```
Socket.io Rooms:
  user_{userId}     ← Customers get order status updates
  stall_{stallId}   ← Runners get live order items for their stall

Events:
  Client → Server:   join_user, join_stall, leave_stall
  Server → User:     order_item_created, order_item_updated, order_status_updated
  Server → Stall:    order_item_created, order_item_updated
```

### 1.6 Authentication Flow

**Admin (JWT):**
1. Login → receives `access_token` (15 min) + `refresh_token` (30 days)
2. Refresh tokens stored as bcrypt hash in `user_sessions`
3. Access token sent as `Authorization: Bearer <token>`
4. `authenticateToken` middleware guards write endpoints
5. Auto-refresh in frontend via `AuthContext` on page load

**Runner (Simple):**
1. Runner enters name code, compared against `NEXT_PUBLIC_RUNNER_CODE` env var
2. State persisted in `runner.store.ts` (localStorage)
3. No server-side auth — client-side check only

**Ordering (No Auth):**
1. Public flow — no authentication required
2. `user_id` defaults to 1 (guest) if not provided

### 1.7 Order Lifecycle

```
STANDARD Order Items:
  INCOMING → PREPARING → SERVED
                        ↕ (revert)
  Any state → CANCELLED

CUSTOM Order Items:
  INCOMING → SERVED    (skips PREPARING)
  Any state → CANCELLED

Order Status (derived from items):
  All items SERVED/CANCELLED → Order COMPLETED
  All items CANCELLED        → Order CANCELLED
  Otherwise                  → Order PENDING
```

---

## 2. Deployment & Rollback Procedures

### 2.1 Local Development (Docker)

```bash
# 1. Start the backend stack (PostgreSQL + Express)
cd backend
docker compose up --build

# 2. Reset DB, run migrations, and seed data (in container)
docker compose exec backend npm run rollback
docker compose exec backend npm run migrate
docker compose exec backend npm run seed

# 3. Start the frontend (in separate terminal)
cd frontend
npm run dev
```

**Access:**
- Backend API: `http://localhost:4000`
- Frontend: `http://localhost:3000`
- Health check: `http://localhost:4000/health`

### 2.2 Production Deployment (Render / Docker Host)

**Prerequisites:**
- PostgreSQL 17 database (or Supabase project)
- Supabase S3-compatible storage bucket
- SendGrid account for emails

**Backend deployment steps:**

1. **Set environment variables** (see [Configuration Guide](#3-configuration-guide))
2. **Build the Docker image:**
   ```bash
   cd backend
   docker build -t kopiteh-backend .
   ```
3. **Run database migrations** against target DB:
   ```bash
   # Using individual env vars (dev):
   DB_USER=postgres DB_HOST=host DB_NAME=kopiteh DB_PASSWORD=xxx DB_PORT=5432 \
     npx ts-node src/scripts/migrate.ts

   # Or using DATABASE_URL (production):
   DATABASE_URL=postgresql://... npx ts-node src/scripts/migrate.ts
   ```
4. **Start the container:**
   ```bash
   docker run -d -p 4000:4000 --env-file .env kopiteh-backend
   ```
5. **(Optional) Seed data:**
   ```bash
   docker compose exec backend npm run seed
   ```
6. **Verify health check:**
   ```bash
   curl http://localhost:4000/health
   # Expected: { "status": "ok", "database": "connected", "dbLatencyMs": ..., "timestamp": "..." }
   ```

**Frontend deployment steps (Vercel / static host):**

1. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL` = your backend URL (e.g. `https://api.kopiteh.com/api`)
   - `NEXT_PUBLIC_RUNNER_CODE` = shared runner secret code

2. **Build and deploy:**
   ```bash
   cd frontend
   npm run build
   # Deploy .next/ output or connect Vercel to the repo
   ```
3. **Ensure `FRONTEND_URL` on the backend** matches the deployed frontend origin (for CORS).

### 2.3 Rollback Procedures

**Database rollback:**
```bash
# Full destructive rollback (drops ALL tables):
docker compose exec backend npm run rollback
# Then re-migrate and re-seed as needed:
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

**WARNING:** `rollback` drops ALL tables including data. There is no per-migration rollback. To undo a specific migration only, you must write a manual SQL script.

**Backend code rollback:**
- Docker: `docker compose down`, checkout previous commit, `docker compose up --build`
- Render: redeploy previous commit/tag from the dashboard or push the previous commit

**Frontend code rollback:**
- Vercel: select the previous deployment in the dashboard and "Promote to Production"
- Manual: checkout previous commit, rebuild, re-deploy

---

## 3. Configuration Guide

### 3.1 Backend Environment Variables (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | Server listen port |
| `NODE_ENV` | No | — | `production` enables SSL for DB |
| `FRONTEND_URL` | No | `*` | CORS allowed origin |
| **Database (Production)** | | | |
| `DATABASE_URL` | Prod* | — | Full PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db?sslmode=require`) |
| `SUPABASE_URL` | Prod* | — | Alternative to DATABASE_URL (Supabase connection string) |
| **Database (Development)** | | | |
| `DB_USER` / `POSTGRES_USER` | Dev* | — | Database user |
| `DB_HOST` / `POSTGRES_HOST` | Dev* | — | Database host (e.g. `db` for Docker) |
| `DB_NAME` / `POSTGRES_DB` | Dev* | — | Database name |
| `DB_PASSWORD` / `POSTGRES_PASSWORD` | Dev* | — | Database password |
| `DB_PORT` / `POSTGRES_PORT` | No | `5432` | Database port |
| **Auth** | | | |
| `JWT_SECRET` | Yes | — | Signing key for access tokens |
| `JWT_REFRESH_SECRET` | Yes | — | Signing key for refresh tokens |
| `ADMIN_SIGNUP_CODE` | Yes | — | Secret code required for admin registration |
| **Storage** | | | |
| `SUPABASE_STORAGE` | Yes | — | Supabase S3 endpoint (must end with `/storage/v1/s3`) |
| `SUPABASE_REGION` | Yes | — | S3 region (e.g. `ap-southeast-1`) |
| `SUPABASE_ACCESS_KEY_ID` | Yes | — | S3 access key |
| `SUPABASE_SECRET_ACCESS_KEY` | Yes | — | S3 secret key |
| `SUPABASE_BUCKET_NAME` | Yes | — | S3 bucket name |
| **Email** | | | |
| `SENDGRID_API_KEY` | No | — | SendGrid API key (for password reset emails) |
| `SENDER_EMAIL` | No | — | Verified sender email address |

\* At least one DB connection method must be configured.

### 3.2 Frontend Environment Variables (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:4000/api` | Backend API base URL (must include `/api`) |
| `NEXT_PUBLIC_RUNNER_CODE` | Yes | — | Secret code runners use to authenticate |
| `NEXT_PUBLIC_WS_URL` | No | — | Explicit WebSocket URL (auto-derived from API_URL if not set) |

**Note:** `NEXT_PUBLIC_*` variables are bundled at build time and exposed to the browser. Do not store secrets in them.

### 3.3 Docker Compose Variables

The `docker-compose.yml` passes all `.env` variables to both containers. The DB container uses `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` to initialise the database.

---

## 4. Operations / Support Runbook

### 4.1 Daily Operations

**Start the environment:**
```bash
cd backend && docker compose up -d
cd frontend && npm run dev
```

**Stop the environment:**
```bash
cd backend && docker compose down
```

**View backend logs:**
```bash
docker compose logs -f backend
docker compose logs -f db
```

### 4.2 Database Maintenance

**Reset and re-seed (full data wipe):**
```bash
docker compose exec backend npm run rollback
docker compose exec backend npm run migrate
docker compose exec backend npm run seed
```

**Run only new migrations:**
```bash
docker compose exec backend npm run migrate
```

**Connect to DB directly:**
```bash
docker compose exec db psql -U postgres -d kopiteh
```

**Check database size and table row counts:**
```sql
SELECT table_name, n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

### 4.3 Common Admin Tasks

**Create a new admin account:**
1. Visit `/admin/auth/signup`
2. Enter name, email, password, and the `ADMIN_SIGNUP_CODE`

**Add a new venue:**
1. Admin → Manage Venues → Create Venue
2. Fill in name, address, image, opening hours
3. Create stalls under the venue
4. Create tables for the venue (single or bulk range)

**Add menu items to a stall:**
1. Admin → Manage Venues → Select Venue → Select Stall
2. Create categories (optional)
3. Create items with price, prep time, image
4. Add modifier sections (e.g. "Size", "Spiciness")
5. Add modifier options (e.g. "Small +$0", "Large +$1")

**View order analytics:**
1. Admin → View Analytics
2. Select year/month to see per-stall totals

**Filter and view all orders:**
1. Admin → View Orders
2. Use date range, table#, venue, and stall filters
3. Expand rows to see individual items

### 4.4 Runner Operations

1. Runner opens `/runner` → login with runner code
2. Select venue → select stall
3. Real-time order panel shows:
   - **Incoming** (new orders awaiting preparation)
   - **Preparing** (being cooked)
   - **Served** (completed)
   - **Cancelled** (cancelled items)
4. Actions per item:
   - **Update Status** (advance INCOMING→PREPARING→SERVED)
   - **Revert Status** (go back a step)
   - **Cancel** item
   - **Edit** item (quantity, modifiers, remarks)
   - **Delete** item
5. Runners can also add **custom orders** (free-form items not on the menu)

### 4.5 Ordering Flow (Volunteer/Companion)

1. Open `/ordering` → select role "Companion"
2. Enter volunteer name
3. Select venue → select table
4. Browse stalls (shows estimated waiting time)
5. Select stall → browse menu → select item
6. Customise (choose modifiers/options) → add to cart
7. Repeat for more items
8. Go to cart → review → submit order
9. Track order status at `/ordering/status`

---

## 5. Troubleshooting Guide

### 5.1 Backend Won't Start

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running | Run `docker compose up -d db`; verify with `docker compose ps` |
| `Database connection error` | Wrong DB credentials | Check `.env` values match `docker-compose.yml`; ensure `DB_HOST=db` (not `localhost`) |
| `Missing SUPABASE_STORAGE` | Storage env vars missing | Set all `SUPABASE_*` vars in `.env` (even if not using storage yet) |
| `JWT secret is not configured` | Missing JWT keys | Set `JWT_SECRET` and `JWT_REFRESH_SECRET` in `.env` |
| Port 4000 already in use | Another process on port 4000 | Kill the process or change `PORT` in `.env` |

### 5.2 Frontend Won't Start

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| `404` or CORS errors on API calls | Wrong API URL or backend not running | Verify `NEXT_PUBLIC_API_URL` in `frontend/.env` points to running backend |
| White page / infinite loading | AuthContext stuck on token refresh | Clear localStorage (`auth-storage` key) and reload |
| WebSocket disconnected | Backend not running or wrong URL | WebSocket URL is derived from `NEXT_PUBLIC_API_URL`; check backend logs for connection attempts |
| `Module not found` errors | Missing npm packages | Run `npm install` in `frontend/` |

### 5.3 Database Issues

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Migration fails with "already exists" | Table created manually or partial migration applied | Run `rollback`, then `migrate` again |
| Migration fails mid-way | Invalid SQL or constraint violation | Check error message; fix migration SQL; if partial, run `rollback` and `migrate` |
| `relation "order" does not exist` | Table name not quoted | Always use double quotes: `"order"`, `"table"` — these are reserved words in SQL |
| Data integrity issues (orphan records) | Cascade deletes misconfigured | Review foreign key constraints in migration `0001`; use manual SQL to clean up |

### 5.4 WebSocket Issues

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Runner not seeing new orders | Not joined to stall room | Runner must select a stall; verify `socket.emit('join_stall', stallId)` fires |
| Customer not receiving status updates | `user_id` is null on order items | Ensure `user_id` is populated when creating orders |
| `Socket.IO not initialized` in logs | Server started before WebSocket init | Should not happen normally; restart backend |
| WebSocket 400/connection refused | CORS or path mismatch | Backend `FRONTEND_URL` must match frontend origin; default path is `/socket.io` |

### 5.5 Image Upload Issues

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Upload returns 500 | S3 credentials wrong or bucket missing | Verify all `SUPABASE_*` env vars; check bucket exists in Supabase dashboard |
| Image URL 404 | Bucket not public or URL construction bug | Check Supabase bucket's access policy; verify `SUPABASE_STORAGE` ends with `/storage/v1/s3` |
| "File too large" error | Exceeded multer 5MB limit | Resize image before upload or increase limit in `upload.middleware.ts` |

### 5.6 Order Status Inconsistencies

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Order stuck in PENDING with all items SERVED | Status update race condition | Re-trigger status update by cancelling and re-serving one item |
| "Zombie" COMPLETED orders with 0 items | Items deleted without updating order status | The "View Orders" page auto-fixes these: sets them to CANCELLED |

---

## 6. API / Interface Documentation

### 6.1 Response Convention

All endpoints return:
```json
{
  "success": true | false,
  "code": "OK" | "CREATED" | "NOT_FOUND" | "VALIDATION_ERROR" | ...,
  "payload": {
    "status": 200,
    "message": "Request processed successfully.",
    "data": <result> | null
  }
}
```

**Error codes:** `NOT_FOUND` (404), `VALIDATION_ERROR` (400), `DATABASE_ERROR` (500), `UNAUTHORIZED` (401), `INTERNAL_ERROR` (500), `EMAIL_NOT_VERIFIED` (403)

**Frontend unwrapping:** `fetchClient<T>()` in `frontend/lib/api.ts` automatically extracts `payload.data` and throws on `success: false`.

### 6.2 Health Check

```
GET /health
```
Returns:
```json
{
  "status": "ok",
  "database": "connected",
  "dbLatencyMs": 3,
  "timestamp": "2026-07-25T..."
}
```

### 6.3 Auth Endpoints

| Method | Route | Auth | Body | Response |
|--------|-------|------|------|----------|
| POST | `/api/auth/create-account` | No | `{ name, email, password, secretCode }` | User object |
| POST | `/api/auth/account-login` | No | `{ email, password }` | `{ access_token, refresh_token, user }` |
| GET | `/api/auth/auth-check` | No | Query: `?token=...` | `{ valid: boolean }` |
| POST | `/api/auth/forgot-password` | No | `{ email }` | Message |
| POST | `/api/auth/refresh` | No | `{ refresh_token }` | `{ access_token, refresh_token, user }` |
| POST | `/api/auth/logout` | No | `{ refresh_token }` | Message |

### 6.4 Venue Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/venue` | No | List all venues |
| GET | `/api/venue/:id` | No | Get venue by ID |
| GET | `/api/venue/:id/tables` | No | Get active tables for venue |
| POST | `/api/venue/create` | JWT | Create venue |
| PATCH | `/api/venue/update/:id` | JWT | Update venue |
| DELETE | `/api/venue/remove/:id` | JWT | Delete venue |

### 6.5 Stall Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/stalls/venue/:venue_id` | No | Stalls for venue (with calculated waiting_time) |
| GET | `/api/stalls/:id` | No | Get stall by ID |
| POST | `/api/stalls/create` | JWT | Create stall |
| POST | `/api/stalls/venue/:venue_id/import` | JWT | Bulk Excel import (stalls + items + modifiers) |
| PATCH | `/api/stalls/update/:id` | JWT | Update stall |
| DELETE | `/api/stalls/remove/:id` | JWT | Delete stall |

### 6.6 Table Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/tables/venue/:venue_id` | No | Active tables for venue |
| GET | `/api/tables/:id` | No | Get table by ID |
| POST | `/api/tables/create` | JWT | Create single table |
| POST | `/api/tables/create-bulk` | JWT | Create range of tables |
| DELETE | `/api/tables/remove/:id` | JWT | Soft-delete (set is_active=false) |
| DELETE | `/api/tables/remove-bulk` | JWT | Soft-delete multiple tables |

### 6.7 Menu Item Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/items/stalls/:stall_id` | No | Items for stall (optional `?category_id`) |
| GET | `/api/items/:id` | No | Get item by ID |
| GET | `/api/items/default/:stall_id` | No | Get default item for stall |
| POST | `/api/items/create` | JWT | Create item (with nested modifiers) |
| PUT | `/api/items/update/:id` | JWT | Update item (with modifier sync) |
| DELETE | `/api/items/remove/:id` | JWT | Delete item |
| PATCH | `/api/items/toggle/:id` | JWT | Toggle is_available |
| PATCH | `/api/items/toggle-availability/:id` | No | Toggle is_available (runner use) |

### 6.8 Category Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/categories/stalls/:stall_id` | No | Categories for stall |
| GET | `/api/categories/:id` | No | Get category |
| POST | `/api/categories/create` | JWT | Create category |
| PUT | `/api/categories/update/:id` | JWT | Update category |
| DELETE | `/api/categories/remove/:id` | JWT | Delete category |

### 6.9 Modifier Section Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/item-sections/items/:item_id` | No | Sections for item |
| GET | `/api/item-sections/:id` | No | Get section |
| POST | `/api/item-sections/create` | JWT | Create section |
| PUT | `/api/item-sections/update/:id` | JWT | Update section |
| DELETE | `/api/item-sections/remove/:id` | JWT | Delete section |

### 6.10 Modifier (Option) Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/modifiers/sections/:section_id` | No | Options by section |
| GET | `/api/modifiers/items/:item_id` | No | Options by item |
| GET | `/api/modifiers/:id` | No | Get option |
| POST | `/api/modifiers/create` | JWT | Create option |
| PUT | `/api/modifiers/update/:id` | JWT | Update option |
| DELETE | `/api/modifiers/remove/:id` | JWT | Delete option |

### 6.11 Order Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/order` | JWT | Filtered listing (date, table, venue, stall, pagination) |
| GET | `/api/order/:id` | No | Get order by ID |
| GET | `/api/order/user/:user_id` | No | User's orders (last 7 days) |
| GET | `/api/order/table/:table_id` | No | Table orders with items (last 7 days, `?venueId=` optional) |
| GET | `/api/order/analytics/monthly` | JWT | Monthly analytics (`?year=&month=&venueId=`) |
| POST | `/api/order/create` | No | Create order with nested items |
| PUT | `/api/order/update/:id` | No | Update order |
| PUT | `/api/order/cancel/:id` | No | Cancel all items in an order |

**Create order request body:**
```json
{
  "table_id": 1,
  "total_price": 15.50,
  "volunteer_name": "Alice",
  "items": [
    {
      "item_id": 5,
      "quantity": 2,
      "price": 6.00,
      "notes": "extra spicy",
      "modifiers": [
        { "option_id": 12, "name": "Large", "price": 1.50 }
      ]
    }
  ]
}
```

**Filtered listing query parameters:**
`?startDate=ISO&endDate=ISO&tableNumber=X&tableId=X&venueId=X&stallId=X&page=1&limit=15`

### 6.12 Order Item Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/orderItem/id/:type/:id` | No | Get item by type (`STANDARD`\|`CUSTOM`) and ID |
| GET | `/api/orderItem/order/:order_id` | No | Items for order (with modifiers) |
| GET | `/api/orderItem/stall/:stall_id` | No | Items for stall (last 7 days, both types) |
| GET | `/api/orderItem/modifiers/:order_item_id` | No | Modifiers on order item |
| POST | `/api/orderItem/create/:type` | No | Create STANDARD or CUSTOM order item |
| PUT | `/api/orderItem/update/:type/:id` | No | Update item (name, quantity, modifiers, remarks) |
| PUT | `/api/orderItem/updateStatus/:type/:id` | No | Advance to next status |
| PUT | `/api/orderItem/revertStatus/:type/:id` | No | Revert to previous status |
| PUT | `/api/orderItem/cancel/:type/:id` | No | Cancel item |
| DELETE | `/api/orderItem/delete/:type/:id` | No | Delete item |

**STANDARD order item create body:**
```json
{
  "order_id": 10,
  "item_id": 5,
  "quantity": 2,
  "price": 6.00,
  "notes": "no onions",
  "modifiers": [
    { "option_id": 12, "name": "Large", "price": 1.50 }
  ]
}
```

**CUSTOM order item create body:**
```json
{
  "stall_id": 3,
  "table_id": 1,
  "order_item_name": "Special request",
  "quantity": 1,
  "price": 8.50,
  "remarks": "no peanuts",
  "volunteer_name": "Bob"
}
```

### 6.13 Upload Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/upload/single` | No | Single file (`multipart/form-data`, field: `file`) |
| POST | `/api/upload/multiple` | No | Multiple files (max 10, field: `files`) |
| POST | `/api/upload/base64` | No | Base64 image (`{ image, fileName }`) |

**Limits:** 5MB per file, allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

**Response:** `{ imageUrl: "https://..." }`

### 6.14 WebSocket Events

| Event (Client→Server) | Payload | Description |
|------------------------|---------|-------------|
| `join_user` | `number` (userId) | Join personal notification room |
| `join_stall` | `number` (stallId) | Join stall room for order updates |
| `leave_stall` | `number` (stallId) | Leave stall room |

| Event (Server→Client) | Room | Payload | Description |
|------------------------|------|---------|-------------|
| `order_item_created` | `user_{id}`, `stall_{id}` | `{ orderItem }` | New order item added |
| `order_item_updated` | `user_{id}`, `stall_{id}` | `{ orderItem }` | Order item modified |
| `order_status_updated` | `user_{id}` | `{ orderId, status }` | Order-level status change |

---

## 7. Database / Data Model Documentation

### 7.1 Entity-Relationship Overview

```
venue  1──N  stall  1──N  menu_item  1──N  menu_item_modifier_section
  │                │                              │
  │                │                             1──N menu_item_modifier
  │                │
  │               1──N  menu_item_category  1──N  menu_item
  │
 1──N  "table"  1──N  "order"  1──N  order_item  1──N  order_item_modifiers
                  │              │
                  │              N──1  menu_item
                  │
                  N──1  users  1──N  user_sessions
                  │
                  stall ──N  custom_order_item
```

### 7.2 Table Definitions

#### `venue`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `venue_id` | SERIAL | PK | Auto-increment ID |
| `name` | VARCHAR | NOT NULL | Venue name |
| `address` | VARCHAR | — | Physical address |
| `description` | TEXT | — | Venue description |
| `image_url` | VARCHAR | — | Hero image URL |
| `opening_hours` | VARCHAR | — | Free-text hours |

#### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | SERIAL | PK | Auto-increment ID |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'user' | `admin`, `runner`, `user` |
| `is_authenticated` | BOOLEAN | NOT NULL, DEFAULT FALSE | Email verified |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `verify_code` | VARCHAR(6) | — | Email verification code |
| `verify_code_expires_at` | TIMESTAMPTZ | — | Expiry for verify code |
| `reset_password_code` | VARCHAR(6) | — | Password reset code |
| `reset_password_expires_at` | TIMESTAMPTZ | — | Expiry for reset code |

#### `user_sessions`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_session_id` | UUID | PK | Session identifier |
| `user_id` | INT | FK → users(user_id) ON DELETE CASCADE | |
| `refresh_token_hash` | TEXT | NOT NULL | bcrypt hash of refresh token |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

#### `stall`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `stall_id` | SERIAL | PK | Auto-increment ID |
| `venue_id` | INTEGER | FK → venue(venue_id) ON DELETE CASCADE | |
| `name` | VARCHAR | NOT NULL | Stall name |
| `description` | TEXT | — | |
| `stall_image` | VARCHAR | — | Image URL |
| `is_open` | BOOLEAN | NOT NULL, DEFAULT TRUE | Operating status |
| `waiting_time` | INTEGER | DEFAULT 0, CHECK >= 0 | **DEPRECATED** — now calculated dynamically |
| `allow_remarks` | BOOLEAN (added 0005) | — | Whether ordering flow shows remarks field |

**Indexes:** `idx_stall_venue_id` on `venue_id`

#### `menu_item_category`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `category_id` | SERIAL | PK | |
| `stall_id` | INTEGER | FK → stall(stall_id) ON DELETE CASCADE | |
| `name` | VARCHAR | NOT NULL | Category label |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | Display ordering |

**Indexes:** `idx_category_stall_id` on `stall_id`

#### `menu_item`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `item_id` | SERIAL | PK | |
| `stall_id` | INTEGER | FK → stall(stall_id) ON DELETE CASCADE | |
| `category_id` | INTEGER | FK → menu_item_category ON DELETE SET NULL | Nullable |
| `item_image` | VARCHAR | — | Image URL |
| `name` | VARCHAR | NOT NULL | Item name |
| `description` | TEXT | — | |
| `price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | |
| `prep_time` | INTEGER | NOT NULL, DEFAULT 0, CHECK >= 0 | Minutes |
| `is_available` | BOOLEAN | NOT NULL, DEFAULT TRUE | |

**Indexes:** `idx_menu_item_stall_id`, `idx_menu_item_category_id`

#### `menu_item_modifier_section`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `section_id` | SERIAL | PK | |
| `item_id` | INTEGER | FK → menu_item(item_id) ON DELETE CASCADE | |
| `name` | VARCHAR | NOT NULL | e.g. "Size", "Spiciness" |
| `min_selections` | INTEGER | NOT NULL, DEFAULT 0 | Minimum required picks |
| `max_selections` | INTEGER | NOT NULL, DEFAULT 1 | Maximum allowed picks |

**Check constraint:** `max_selections >= min_selections`  
**Indexes:** `idx_modifier_section_item_id`

#### `menu_item_modifier`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `option_id` | SERIAL | PK | |
| `section_id` | INTEGER | FK → menu_item_modifier_section ON DELETE CASCADE | |
| `item_id` | INTEGER | FK → menu_item(item_id) ON DELETE CASCADE | Denormalised for convenience |
| `name` | VARCHAR | NOT NULL | e.g. "Large", "Spicy" |
| `price_modifier` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Added cost |
| `is_available` | BOOLEAN | NOT NULL, DEFAULT TRUE | |

**Indexes:** `idx_modifier_item_id`

#### `"table"` (quoted — SQL reserved word)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `table_id` | SERIAL | PK | |
| `venue_id` | INTEGER | FK → venue(venue_id) ON DELETE CASCADE | |
| `table_number` | VARCHAR | — | Display number (e.g. "1", "A") |
| `is_active` | BOOLEAN | (added 0004) | Soft-delete flag |

**Indexes:** `idx_table_venue_id`

#### `"order"` (quoted — SQL reserved word)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `order_id` | SERIAL | PK | |
| `table_id` | INTEGER | FK → "table"(table_id) ON DELETE RESTRICT | |
| `user_id` | INTEGER | FK → users(user_id) ON DELETE RESTRICT | Nullable |
| `status` | VARCHAR | NOT NULL, DEFAULT 'PENDING' | PENDING, COMPLETED, CANCELLED |
| `total_price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `volunteer_name` | VARCHAR | (added 0006) | Name of volunteer who placed order |

**Indexes:** `idx_order_table_id`

#### `order_item`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `order_item_id` | SERIAL | PK | |
| `order_id` | INTEGER | FK → "order"(order_id) ON DELETE CASCADE | |
| `item_id` | INTEGER | FK → menu_item(item_id) ON DELETE RESTRICT | |
| `status` | VARCHAR | NOT NULL, DEFAULT 'INCOMING' | INCOMING, PREPARING, SERVED, CANCELLED |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | |
| `price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Unit price at time of order |
| `remarks` | TEXT | (added 0003) | Customer notes |

**Indexes:** `idx_order_item_order_id`, `idx_order_item_item_id`

#### `custom_order_item`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `order_item_id` | SERIAL | PK | |
| `stall_id` | INTEGER | FK → stall(stall_id) ON DELETE CASCADE | |
| `table_id` | INTEGER | FK → "table"(table_id) ON DELETE RESTRICT | |
| `user_id` | INTEGER | FK → users ON DELETE CASCADE | Nullable |
| `order_item_name` | VARCHAR | NOT NULL | Free-text item name |
| `status` | VARCHAR | NOT NULL, DEFAULT 'INCOMING' | INCOMING, SERVED, CANCELLED |
| `quantity` | INTEGER | NOT NULL, DEFAULT 1, CHECK > 0 | |
| `price` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Unit price |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `remarks` | TEXT | — | |
| `volunteer_name` | VARCHAR | (added 0006) | |

**Indexes:** `idx_custom_order_item_stall_id`, `idx_custom_order_item_table_id`

#### `order_item_modifiers`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `order_item_option_id` | SERIAL | PK | |
| `order_item_id` | INTEGER | FK → order_item ON DELETE CASCADE | |
| `option_id` | INTEGER | FK → menu_item_modifier ON DELETE RESTRICT | |
| `price_modifier` | DECIMAL(10,2) | NOT NULL, DEFAULT 0, CHECK >= 0 | Price at time of order |
| `option_name` | VARCHAR | NOT NULL | Name at time of order (snapshot) |

**Indexes:** `idx_order_item_modifiers_order_item_id`, `idx_order_item_modifiers_option_id`

#### `_migrations`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PK | |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Migration filename |
| `applied_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

### 7.3 Migration Files

| File | Description |
|------|-------------|
| `0001_create_tables.sql` | Full schema (14 tables, all constraints, indexes) |
| `0002_remove_waiting_time.sql` | Dropped `waiting_time` column from `stall` |
| `0003_move_remarks_to_order_item.sql` | Moved `remarks` from `order` → `order_item`; added to `custom_order_item` |
| `0004_alter_table_add_is_active.sql` | Added `is_active` to `"table"`; dropped `qr_code` column |
| `0005_add_remarks_column.sql` | Added `allow_remarks` to `stall` |
| `0006_add_volunteername_column.sql` | Added `volunteer_name` to `"order"` and `custom_order_item` |

---

## 8. Known Issues, Limitations & Workarounds

### 8.1 Known Issues

| # | Issue | Impact | Workaround |
|---|-------|--------|------------|
| 1 | **Migrate/rollback rely on separate `pg.Pool`** — both `migrate.ts` and `rollback.ts` create their own pools with duplicated connection logic | If connection details change, they must be updated in 3 places (database.ts, migrate.ts, rollback.ts) | Keep all three in sync; refactor to shared config |
| 2 | **"Zombie" COMPLETED orders with zero items** — deleting all items from a COMPLETED order doesn't revert status | These orders appear in filtered listings | The "View Orders" page auto-corrects them to CANCELLED on load |
| 3 | **CUSTOM order items skip PREPARING** — they go INCOMING → SERVED directly | Runners can't track PREPARING state for custom items | Use cancellation + re-creation as a workaround |
| 4 | **Waiting time uses ALL order items (not just current order)** — may span multiple orders for the same table | Inflated waiting time for tables ordering sequentially | Acceptable as intended behaviour (shows stall backlog); clear old orders or cancel them |
| 5 | **`rollback` is all-or-nothing** — no per-migration rollback | Must drop all data to undo a single migration | Write a manual reverse migration `.sql` file instead |
| 6 | **Runner auth is client-side only** — the runner "code" is embedded in the frontend bundle | Anyone with browser devtools can extract `NEXT_PUBLIC_RUNNER_CODE` | Not a security-critical feature; consider server-side validation if needed |
| 7 | **Order `user_id` defaults to 1** when creating from the ordering flow | All guest orders are attributed to user 1 | Register anonymous users or use table-based identity if needed |
| 8 | **No rate limiting** on API endpoints | Susceptible to abuse (e.g. repeated password reset emails) | Add rate limiting middleware for production |
| 9 | **File upload limit hardcoded** at 5MB in `upload.middleware.ts` | Large images rejected | Edit middleware constant or compress images before upload |

### 8.2 Limitations

| # | Limitation | Detail |
|---|-----------|--------|
| 1 | **No automated tests** | Only one backend WebSocket test and one frontend component test exist. No integration or E2E tests. |
| 2 | **No CI/CD pipeline** | All deployments are manual. No lint-staged, no pre-commit hooks. |
| 3 | **No database backups configured** | No automated backup script or pg_dump schedule. |
| 4 | **No observability** | No APM (Sentry, Datadog), no structured logging, no metrics collection beyond console.log. |
| 5 | **No horizontal scaling** | Single Node.js process with in-memory WebSocket state. Socket.io rooms are lost on restart. |
| 6 | **TypeScript strict mode disabled** on frontend (`strict: false`) | Potential for more runtime bugs than the backend. |
| 7 | **No pagination on stall/items API** | All items for a stall returned in one call. Could be slow with large menus. |

### 8.3 Recommended Future Improvements

1. Add comprehensive test suite (Jest/Vitest for backend services, Playwright for E2E)
2. Set up GitHub Actions CI/CD pipeline
3. Implement structured logging (Winston/Pino)
4. Add Sentry or similar error tracking
5. Add rate limiting (express-rate-limit)
6. Set up automated database backups (pg_dump cron or managed DB backups)
7. Implement pagination on high-volume GET endpoints
8. Move runner auth to server-side JWT
9. Add request ID correlation for distributed tracing
10. Consider Redis adapter for Socket.io to support horizontal scaling

---

## 9. Monitoring & Alerting Information

### 9.1 Health Check Endpoint

**`GET /health`**

This is the primary monitoring endpoint. It tests database connectivity and reports latency.

```json
{
  "status": "ok",
  "database": "connected",
  "dbLatencyMs": 3,
  "timestamp": "2026-07-25T10:30:00.000Z"
}
```

**Status codes:**
- `200` — all healthy
- `503` — database degraded or disconnected

**Recommended monitoring:** Configure a health check (e.g. Render health check, UptimeRobot, or Pingdom) to poll `/health` every 30–60 seconds. Alert if the endpoint returns non-200 or takes longer than 5 seconds.

### 9.2 Log Output

All backend logs go to `stdout`/`stderr`:
- **Database:** `Database connected successfully` on startup; `Database connection error: ...` on failure
- **Startup:** `Server running on port 4000`
- **WebSocket:** `User connected: <socketId>`, `User disconnected: <socketId>`, room join/leave events
- **WebSocket errors:** `Socket.IO not initialized` (if emit before init), `WebSocket emit error: ...`
- **Health check errors:** `Health check DB error: ...`

**How to view:**
```bash
# Docker Compose
docker compose logs -f backend

# Direct (Render / non-Docker)
# stdout is captured by the platform
```

### 9.3 Key Metrics to Monitor

| Metric | How to check | Healthy threshold |
|--------|-------------|-------------------|
| **API response time** | `/health` `dbLatencyMs` field | < 100ms |
| **Database connectivity** | `/health` `database` field | Must be `"connected"` |
| **Error rate** | Search logs for `ERROR`, `error` | Near zero in normal operation |
| **WebSocket connections** | Logs for `User connected` / `User disconnected` | Stable count during business hours |
| **Memory/CPU** | Docker stats or platform dashboard | Under 80% utilisation |
| **Disk space** | `df -h` or platform dashboard | Under 85% used (especially DB volume) |
| **Container uptime** | `docker ps` or platform status | No unexpected restarts |

### 9.4 Manual Health Checks (Quick Reference)

```bash
# Check backend is responding
curl -s http://localhost:4000/health | python -m json.tool

# Check database directly
docker compose exec db psql -U postgres -d kopiteh -c "SELECT COUNT(*) FROM stall;"

# Check Docker container status
docker compose ps

# Check backend container resource usage
docker stats express_backend postgres_db --no-stream

# Check backend logs for errors (last 50 lines)
docker compose logs --tail=50 backend

# Test frontend is serving
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
```

### 9.5 Alerting Recommendations

| Alert | Condition | Severity | Response |
|-------|-----------|----------|----------|
| Health check fails (503) | `/health` returns non-200 for 2+ consecutive checks | **Critical** | Check DB connectivity, restart backend container |
| High latency | `dbLatencyMs` > 500ms for 5+ minutes | **Warning** | Check DB load, long-running queries |
| Backend down | Port 4000 not reachable | **Critical** | Restart Docker container, check for crash logs |
| Frontend down | Port 3000 not serving | **Critical** | Restart Vercel deployment or local dev server |
| Disk space low | DB volume < 15% free | **Warning** | Clean old data, increase volume size |
| All WebSocket disconnected | No `User connected` logs for 10+ minutes during business hours | **Warning** | Check backend Socket.io initialisation, check CORS |

### 9.6 No Built-in Monitoring Dashboard

The application does **not** include a built-in metrics dashboard. For production, consider adding:
- **Render dashboard** — if deployed on Render (built-in metrics, logs, health checks)
- **Docker/Portainer** — for self-hosted Docker monitoring
- **Sentry** — for error tracking
- **Prometheus + Grafana** — for custom metrics

---

## Appendix A: Quick Reference — Key Ports

| Service | Port | Protocol |
|---------|------|----------|
| Frontend (Next.js) | 3000 | HTTP |
| Backend (Express) | 4000 | HTTP |
| PostgreSQL | 5432 | TCP |
| WebSocket | 4000 (same as backend) | WS / WSS |

## Appendix B: Quick Reference — Directory Structure

```
kopiteh/
├── types/                 # Shared TS types (DTOs)
├── backend/               # Express API
│   ├── .env               # Secrets (gitignored)
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── migrations/        # SQL migration files
│   └── src/
│       ├── index.ts       # Entry point
│       ├── seed.ts        # DB seeder
│       ├── config/        # DB pool, S3 client
│       ├── types/         # Backend types
│       ├── middleware/     # Express middleware
│       ├── controllers/   # Route handlers
│       ├── services/      # Business logic
│       ├── routes/        # Route definitions
│       └── scripts/       # migrate.ts, rollback.ts
├── frontend/              # Next.js 15 app
│   ├── .env               # Public env vars (gitignored)
│   ├── app/               # App Router pages
│   ├── components/        # UI components
│   ├── stores/            # Zustand stores
│   ├── context/           # React context providers
│   └── lib/               # API client, utils
└── package.json           # Root placeholder
```

## Appendix C: Useful SQL Queries

```sql
-- Total orders by day (last 7 days)
SELECT DATE(created_at) as day, COUNT(*) as orders
FROM "order"
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY day;

-- Top selling items (last 30 days)
SELECT mi.name, COUNT(*) as order_count
FROM order_item oi
JOIN menu_item mi ON oi.item_id = mi.item_id
JOIN "order" o ON oi.order_id = o.order_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY mi.name
ORDER BY order_count DESC
LIMIT 10;

-- Active stalls with open status
SELECT s.name, v.name as venue
FROM stall s
JOIN venue v ON s.venue_id = v.venue_id
WHERE s.is_open = TRUE;

-- Clean up old user sessions
DELETE FROM user_sessions WHERE created_at < NOW() - INTERVAL '30 days';

-- Check for orphaned order_item_modifiers
SELECT oim.* FROM order_item_modifiers oim
LEFT JOIN order_item oi ON oim.order_item_id = oi.order_item_id
WHERE oi.order_item_id IS NULL;
```

---

*Document maintained by: Kopiteh development team*  
*For questions or updates, contact the project maintainers.*
