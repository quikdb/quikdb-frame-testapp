# TaskBoard — Full-Featured Next.js Reference App

A deliberately heavy, full-featured project management tool built with Next.js. This app serves as a reference implementation that participants will convert to a lighter framework as part of the QuikDB framework migration challenge.

## Why is this app "heavy"?

- **Next.js + React** — Full SSR/SSG framework with large runtime
- **Mongoose** — MongoDB ODM with schema validation
- **Socket.IO** — Real-time WebSocket layer (both server and client)
- **Recharts** — Charting library with D3 dependencies
- **TanStack React Query** — Client-side data fetching/caching
- **Tailwind CSS + CVA + tailwind-merge + clsx** — Styling stack
- **lucide-react** — Icon library
- **date-fns** — Date formatting library
- **zod** — Schema validation
- **jsonwebtoken + bcryptjs** — Auth dependencies

The Docker image will be 400MB+, cold start takes several seconds, and memory usage sits at 150MB+ at idle.

## Features

- **Landing Page** (`/`) — SSR with live stats from database
- **Dashboard** (`/dashboard`) — Client-side charts (pie, bar, line, area)
- **Tasks** (`/tasks`) — SSR task list with pagination, filtering, sorting
- **Task Detail** (`/tasks/[id]`) — SSR individual task view with comments
- **Chat** (`/chat`) — Real-time chat using Socket.IO
- **REST API** — Full CRUD at `/api/v1/tasks`, `/api/v1/users`, etc.
- **Auth** — JWT-based with middleware verification
- **Rate Limiting** — In-memory per-IP rate limiter
- **Request Logging** — Logs method, path, duration for all API calls

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Run in development mode
npm run dev

# Or run with Socket.IO support (custom server)
node server.js
```

The app works **without MongoDB** — it falls back to an in-memory data store with 12 sample tasks and 4 users pre-loaded.

## With MongoDB

```bash
# Set your MongoDB URI
export MONGODB_URI=mongodb://localhost:27017/taskboard

# Seed the database
npm run seed

# Start the app
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/v1/auth/login` | Login (returns JWT) |
| GET | `/api/v1/tasks` | List tasks (paginated, filterable) |
| POST | `/api/v1/tasks` | Create task |
| GET | `/api/v1/tasks/:id` | Get task |
| PUT | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task |
| GET | `/api/v1/stats` | Dashboard statistics |
| GET | `/api/v1/users` | List users |
| POST | `/api/v1/users` | Create user |
| GET | `/api/v1/chat/messages` | Get chat messages |

### Authentication

All `/api/v1/*` endpoints (except login) require a JWT token:

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@taskboard.dev","password":"password123"}'

# Use the token
curl http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer <your-token>"
```

### Default Credentials

- **Email:** admin@taskboard.dev
- **Password:** password123

## Docker

```bash
docker build -t taskboard .
docker run -p 3000:3000 -e JWT_SECRET=your-secret taskboard
```

## Deploy on QuikDB

The `quikdb.json` file is pre-configured:

```json
{
  "name": "taskboard",
  "buildCommand": "npm install && npm run build",
  "startCommand": "npm start",
  "port": 3000
}
```

## Project Structure

```
src/
  app/
    api/
      health/route.ts          — Health check
      v1/
        auth/login/route.ts    — JWT login
        tasks/route.ts         — Task CRUD (list, create)
        tasks/[id]/route.ts    — Task CRUD (get, update, delete)
        stats/route.ts         — Dashboard stats
        users/route.ts         — User management
        chat/messages/route.ts — Chat messages
        ws/route.ts            — WebSocket info
    chat/page.tsx              — Real-time chat page
    dashboard/page.tsx         — Analytics dashboard
    tasks/page.tsx             — Task list (SSR)
    tasks/[id]/page.tsx        — Task detail (SSR)
    page.tsx                   — Landing page (SSR)
    layout.tsx                 — Root layout
  components/
    Navbar.tsx                 — Navigation bar
    Providers.tsx              — React Query provider
    TaskFilters.tsx            — Client-side filter controls
  lib/
    auth.ts                    — JWT sign/verify, password hashing
    data.ts                    — Data access layer (MongoDB + fallback)
    db.ts                      — MongoDB connection
    models/                    — Mongoose models
    rate-limiter.ts            — In-memory rate limiter
    store.ts                   — In-memory data store fallback
    utils.ts                   — Utility functions
    validation.ts              — Zod schemas
  middleware.ts                — Auth + rate limit + logging middleware
scripts/
  seed.js                      — Database seeder
server.js                      — Custom server with Socket.IO
```
