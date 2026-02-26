# Lau Nuong Ngon

Monorepo for the Lau Nuong Ngon restaurant management system: backend (NestJS + Prisma + PostgreSQL + Redis) and frontend (Next.js + shadcn-ui).

## Prerequisites

- **Node.js** 20+
- **pnpm** (package manager)
- **PostgreSQL** (e.g. 16)
- **Redis** (e.g. 7)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy the environment template to **backend** (backend and Prisma read from `backend/.env` only):

   ```bash
   cp .env.example backend/.env
   # Edit backend/.env if your database or Redis URLs differ.
   ```

3. Start PostgreSQL and Redis with Docker Compose (run this before `pnpm dev`):

   ```bash
   docker compose up -d postgres redis
   ```

4. Run database migrations:

   ```bash
   cd backend && npx prisma migrate dev && cd ..
   ```

5. Start backend and frontend:

   ```bash
   pnpm dev
   ```

- Backend: http://localhost:3001 (API prefix: `/api`)
- Frontend: http://localhost:3000

## Running with Docker (full stack)

To run the whole stack (PostgreSQL, Redis, backend, frontend) in containers:

```bash
# Optional: set JWT secret for production-like run
export JWT_SECRET=your-secret
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:3001/api  
- Backend runs Prisma migrations on startup. DB and Redis are wired via service names inside the network.

To run only infrastructure (DB + Redis) for local dev, use:

```bash
docker compose up -d postgres redis
```

## Dev commands

| Command       | Description                          |
|---------------|--------------------------------------|
| `pnpm dev`    | Run backend and frontend concurrently |
| `pnpm lint`   | Lint all workspaces                  |
| `pnpm test`   | Run tests in all workspaces          |

## Project structure

- `backend/` — NestJS API, Prisma, Redis
- `frontend/` — Next.js 15 App Router, shadcn-ui
- `pnpm-workspace.yaml` — workspace packages
- `.env.example` — env template; copy to `backend/.env` for backend and Prisma
