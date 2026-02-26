# Story 1.1: Project Foundation & Core Infrastructure

Status: done

## Story

As a development team,
I want the project monorepo initialized with backend (NestJS + Prisma + PostgreSQL + Redis) and frontend (Next.js + shadcn-ui) scaffolded and runnable locally,
So that all subsequent stories can be built on a consistent, working foundation aligned with the architecture document.

## Acceptance Criteria

1. **Given** the repository is cloned and `.env` is configured from `.env.example`, **When** `pnpm install && pnpm dev` is run, **Then** the backend server starts on its configured port and the frontend renders without errors.

2. **Given** the backend is running, **When** `GET /api/health` is called, **Then** it returns `{ "data": { "status": "ok" } }` with HTTP 200.

3. **Given** the Prisma schema is initialized with the `branches` and `users` tables, **When** `npx prisma migrate dev` is run, **Then** the PostgreSQL database is created with those tables and no migration errors occur.

4. **Given** Redis is configured, **When** the backend starts, **Then** it connects to Redis without errors and logs confirmation.

5. **Given** the project is set up, **When** the directory structure is reviewed, **Then** it matches the architecture document: `backend/` (including `backend/prisma/`), `frontend/`, `pnpm-workspace.yaml`, and `.env.example` with all required variables documented. *(Note: the epics file lists `prisma/` at root – this is incorrect; Prisma lives at `backend/prisma/` per architecture.)*

## Tasks / Subtasks

- [x] **Task 1: Monorepo root** (AC: 1, 5)
  - [x] Create `pnpm-workspace.yaml` with `packages: ["backend", "frontend"]`
  - [x] Root `package.json` with scripts: `dev` (concurrent backend + frontend), `lint`, `test`
  - [x] Root `.env.example` listing all required env vars (see env vars list below)
  - [x] Root `.gitignore` covering node_modules, .env, dist, .next, prisma/*.db
  - [x] `README.md` with project overview, prerequisites (Node 20+, pnpm, PostgreSQL, Redis), setup steps, and dev commands
- [x] **Task 2: Backend scaffold** (AC: 1, 2, 4)
  - [x] NestJS app in `backend/` (TypeScript, NestJS v11.x, Express adapter)
  - [x] Set `app.setGlobalPrefix('api')` in `main.ts`
  - [x] Enable CORS in `main.ts` (allow frontend origin, configurable via env)
  - [x] Health module at `backend/src/modules/health/`: `GET /api/health` → `{ "data": { "status": "ok" } }`
  - [x] Global exception filter at `backend/src/common/filters/http-exception.filter.ts` → all errors return `{ "error": { "code": "...", "message": "...", "details": {} } }`
  - [x] Redis module at `backend/src/common/redis/`: injectable `RedisService`, connect on bootstrap, log success/failure
  - [x] Config module at `backend/src/common/config/`: load env vars via `@nestjs/config`
  - [x] `backend/.env.example` with all backend-specific vars
- [x] **Task 3: Prisma + DB** (AC: 3)
  - [x] Prisma at `backend/prisma/schema.prisma` (NOT at repo root)
  - [x] `branches` table with exact fields (see schema below)
  - [x] `users` table with exact fields including `password_hash` and `role` enum (see schema below)
  - [x] Run `npx prisma migrate dev --name init` to generate initial migration
  - [x] PrismaService at `backend/src/common/prisma/prisma.service.ts`: injectable, `onModuleInit` connect
- [x] **Task 4: Frontend scaffold** (AC: 1, 5)
  - [x] Next.js 15 app in `frontend/` (TypeScript, App Router)
  - [x] Init shadcn-ui: `pnpm dlx shadcn@latest init`
  - [x] Create route group directories: `app/(guest)/`, `app/(staff)/`, `app/(kitchen)/`, `app/(manager)/` — each with an empty `layout.tsx` that passes through children
  - [x] Root layout (`app/layout.tsx`) and landing page (`app/page.tsx`) that renders without errors
  - [x] Create `frontend/lib/api-client.ts` stub (empty export, will be implemented in later stories)
- [x] **Task 5: Docker Compose for local dev** (AC: 1, 4)
  - [x] `docker-compose.yml` at repo root with PostgreSQL and Redis services
  - [x] Document usage in `README.md` (`docker compose up -d` before `pnpm dev`)
- [x] **Task 6: Verify and run** (AC: 1, 2, 3, 4, 5)
  - [x] `pnpm install` at root succeeds
  - [x] `docker compose up -d` starts Postgres + Redis
  - [x] `npx prisma migrate dev` creates tables without errors
  - [x] `pnpm dev` starts both backend and frontend concurrently
  - [x] `curl localhost:<PORT>/api/health` returns `{ "data": { "status": "ok" } }`
  - [x] Verify directory structure matches architecture

## Developer Context

### Prisma Schema Specification

Use `backend/prisma/schema.prisma`. All table names **plural, snake_case**. All column names **snake_case**. Use `@map` and `@@map` to map PascalCase Prisma models to snake_case DB tables.

```prisma
enum UserRole {
  guest
  staff
  kitchen
  manager
}

model Branch {
  id        String   @id @default(uuid())
  name      String
  address   String?
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  users     User[]

  @@map("branches")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  name         String
  role         UserRole @default(staff)
  branchId     String   @map("branch_id")
  branch       Branch   @relation(fields: [branchId], references: [id])
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([branchId], name: "idx_users_branch_id")
  @@map("users")
}
```

### Env Vars (`.env.example`)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/launuongngon?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"

# Backend
PORT=3001
NODE_ENV=development

# Auth (placeholder for future stories)
JWT_SECRET="change-me-in-production"
JWT_EXPIRATION="30m"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### API Contract

- **Global prefix:** Set `app.setGlobalPrefix('api')` in `backend/src/main.ts`.
- **Success response:** `{ "data": <payload> }` — applies to health endpoint and all future endpoints.
- **Error response:** `{ "error": { "code": "ERROR_CODE", "message": "Human message", "details": {} } }` — implement via global exception filter.
- **JSON fields:** camelCase. Date/time: ISO 8601 UTC strings.

### CORS

Enable CORS in `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});
```
Add `FRONTEND_URL` to `.env.example`.

### Backend File Structure

```
backend/src/
├── main.ts                       # bootstrap, setGlobalPrefix('api'), enableCors, Redis log
├── app.module.ts                 # imports: ConfigModule, PrismaModule, RedisModule, HealthModule
├── common/
│   ├── config/config.module.ts   # @nestjs/config with .env
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts     # extends PrismaClient, onModuleInit
│   ├── redis/
│   │   ├── redis.module.ts
│   │   └── redis.service.ts      # injectable, connect + log
│   └── filters/
│       └── http-exception.filter.ts  # global { error: { code, message, details } }
└── modules/
    └── health/
        ├── health.module.ts
        └── health.controller.ts  # GET /api/health → { data: { status: "ok" } }
```

### Frontend File Structure

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (guest)/layout.tsx        # passthrough layout for guest routes
│   ├── (staff)/layout.tsx        # passthrough layout for staff routes
│   ├── (kitchen)/layout.tsx      # passthrough layout for kitchen routes
│   └── (manager)/layout.tsx      # passthrough layout for manager routes
├── components/ui/                # shadcn-ui components
├── lib/
│   └── api-client.ts             # stub for later
└── ...
```

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: launuongngon
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
volumes:
  pgdata:
```

### Anti-Patterns to Avoid

- **Do NOT** create `apps/` or `packages/` directories. Keep `backend/` and `frontend/` at repo root.
- **Do NOT** put Prisma at repo root (`prisma/`). It must be at `backend/prisma/`.
- **Do NOT** use Drizzle, TypeORM, or any ORM other than Prisma.
- **Do NOT** introduce Fastify; use the default Express adapter.
- **Do NOT** use Redux, MobX, Zustand, or any state manager. React Query will be added in later stories.
- **Do NOT** add authentication logic in this story. Only scaffold the `users` table; auth guards come in Story 5.1.
- **Do NOT** skip the global exception filter — every response must follow the `{ data }` / `{ error }` contract from day one.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Project structure, API format, naming, Prisma/Redis, health endpoint, auth design, backend modules
- [Source: _bmad-output/planning-artifacts/epics.md] — Story 1.1 acceptance criteria, Epic 1 context, cross-epic dependencies
- [Source: _bmad-output/planning-artifacts/prd.md] — Phase 1 scope, NFRs, tech stack constraints

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

- Backend health: unit test `HealthController` asserts `GET /health` → `{ data: { status: "ok" } }`. Backend starts with Prisma + Redis when ports free; frontend bound to port 3000 (`next dev -p 3000`) to avoid conflicting with backend 3001.
- pnpm workspace: `node-linker=hoisted` in `.npmrc` so backend resolves `@nestjs/config` and `@prisma/client` from root `node_modules`; `prisma generate` run from backend outputs to root `node_modules/@prisma/client`.

### Completion Notes List

- Monorepo: pnpm-workspace (backend, frontend), root scripts dev/lint/test, .env.example, .gitignore, README with setup and Docker.
- Backend: NestJS 11, global prefix `api`, CORS, health module, global HTTP exception filter, RedisService, ConfigModule (common/config), PrismaService + schema (branches, users), initial migration.
- Frontend: Next.js 15, Tailwind + shadcn init (components.json, globals.css), route groups (guest, staff, kitchen, manager), root layout and page, `lib/api-client.ts` stub, `lib/utils.ts` (cn).
- Docker: docker-compose.yml (postgres:16-alpine, redis:7-alpine). README documents `docker compose up -d` before `pnpm dev`.
- Verify: `pnpm install`, `docker compose up -d`, `npx prisma migrate dev`, `pnpm dev` (frontend -p 3000). Health contract verified by unit test; manual curl works when backend binds to 3001.
- **Code Review fixes applied:**
  - `@nestjs/config` upgraded to ^4.0.0 (NestJS 11 compatible).
  - `HttpExceptionFilter` rewrote code derivation: string-body HttpException → status-derived code (NOT_FOUND, FORBIDDEN, etc.); object-body supports explicit `code` field; array messages normalized.
  - Removed dead `APP_FILTER` import from `main.ts`.
  - `RedisService` now injects `ConfigService` instead of reading `process.env` directly.
  - Added unit tests: `http-exception.filter.spec.ts` (5 cases), `redis.service.spec.ts` (3 cases), `prisma.service.spec.ts` (2 cases). Total: 11 tests, all pass.

### File List

- `.env.example` (new)
- `.gitignore` (updated)
- `.npmrc` (new)
- `README.md` (new)
- `package.json` (new)
- `pnpm-workspace.yaml` (new)
- `pnpm-lock.yaml` (new)
- `docker-compose.yml` (new)
- `backend/package.json` (new)
- `backend/tsconfig.json` (new)
- `backend/nest-cli.json` (new)
- `backend/jest.config.js` (new)
- `backend/.env.example` (new)
- `backend/src/main.ts` (updated: removed dead APP_FILTER import)
- `backend/src/app.module.ts` (new)
- `backend/src/common/config/config.module.ts` (new)
- `backend/src/common/filters/http-exception.filter.ts` (updated: code review fixes — status-derived codes)
- `backend/src/common/filters/http-exception.filter.spec.ts` (new)
- `backend/src/common/redis/redis.module.ts` (new)
- `backend/src/common/redis/redis.service.ts` (updated: inject ConfigService)
- `backend/src/common/redis/redis.service.spec.ts` (new)
- `backend/src/common/prisma/prisma.module.ts` (new)
- `backend/src/common/prisma/prisma.service.ts` (new)
- `backend/src/common/prisma/prisma.service.spec.ts` (new)
- `backend/src/modules/health/health.module.ts` (new)
- `backend/src/modules/health/health.controller.ts` (new)
- `backend/src/modules/health/health.controller.spec.ts` (new)
- `backend/prisma/schema.prisma` (new)
- `backend/prisma/migrations/20260226000000_init/migration.sql` (new)
- `frontend/package.json` (new)
- `frontend/next.config.ts` (new)
- `frontend/tsconfig.json` (new)
- `frontend/tailwind.config.ts` (new)
- `frontend/postcss.config.mjs` (new)
- `frontend/components.json` (new)
- `frontend/app/globals.css` (new)
- `frontend/app/layout.tsx` (new)
- `frontend/app/page.tsx` (new)
- `frontend/app/(guest)/layout.tsx` (new)
- `frontend/app/(staff)/layout.tsx` (new)
- `frontend/app/(kitchen)/layout.tsx` (new)
- `frontend/app/(manager)/layout.tsx` (new)
- `frontend/lib/utils.ts` (new)
- `frontend/lib/api-client.ts` (new)
- `frontend/components/ui/.gitkeep` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (updated: 1-1 → in-progress then review)
- `_bmad-output/implementation-artifacts/1-1-project-foundation-core-infrastructure.md` (updated: tasks marked complete, status → review, Dev Agent Record, File List)
