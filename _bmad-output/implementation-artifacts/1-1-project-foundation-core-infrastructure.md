# Story 1.1: Project Foundation & Core Infrastructure

Status: ready-for-dev

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

- [ ] **Task 1: Monorepo root** (AC: 1, 5)
  - [ ] Create `pnpm-workspace.yaml` with `packages: ["backend", "frontend"]`
  - [ ] Root `package.json` with scripts: `dev` (concurrent backend + frontend), `lint`, `test`
  - [ ] Root `.env.example` listing all required env vars (see env vars list below)
  - [ ] Root `.gitignore` covering node_modules, .env, dist, .next, prisma/*.db
  - [ ] `README.md` with project overview, prerequisites (Node 20+, pnpm, PostgreSQL, Redis), setup steps, and dev commands
- [ ] **Task 2: Backend scaffold** (AC: 1, 2, 4)
  - [ ] NestJS app in `backend/` (TypeScript, NestJS v11.x, Express adapter)
  - [ ] Set `app.setGlobalPrefix('api')` in `main.ts`
  - [ ] Enable CORS in `main.ts` (allow frontend origin, configurable via env)
  - [ ] Health module at `backend/src/modules/health/`: `GET /api/health` → `{ "data": { "status": "ok" } }`
  - [ ] Global exception filter at `backend/src/common/filters/http-exception.filter.ts` → all errors return `{ "error": { "code": "...", "message": "...", "details": {} } }`
  - [ ] Redis module at `backend/src/common/redis/`: injectable `RedisService`, connect on bootstrap, log success/failure
  - [ ] Config module at `backend/src/common/config/`: load env vars via `@nestjs/config`
  - [ ] `backend/.env.example` with all backend-specific vars
- [ ] **Task 3: Prisma + DB** (AC: 3)
  - [ ] Prisma at `backend/prisma/schema.prisma` (NOT at repo root)
  - [ ] `branches` table with exact fields (see schema below)
  - [ ] `users` table with exact fields including `password_hash` and `role` enum (see schema below)
  - [ ] Run `npx prisma migrate dev --name init` to generate initial migration
  - [ ] PrismaService at `backend/src/common/prisma/prisma.service.ts`: injectable, `onModuleInit` connect
- [ ] **Task 4: Frontend scaffold** (AC: 1, 5)
  - [ ] Next.js 15 app in `frontend/` (TypeScript, App Router)
  - [ ] Init shadcn-ui: `pnpm dlx shadcn@latest init`
  - [ ] Create route group directories: `app/(guest)/`, `app/(staff)/`, `app/(kitchen)/`, `app/(manager)/` — each with an empty `layout.tsx` that passes through children
  - [ ] Root layout (`app/layout.tsx`) and landing page (`app/page.tsx`) that renders without errors
  - [ ] Create `frontend/lib/api-client.ts` stub (empty export, will be implemented in later stories)
- [ ] **Task 5: Docker Compose for local dev** (AC: 1, 4)
  - [ ] `docker-compose.yml` at repo root with PostgreSQL and Redis services
  - [ ] Document usage in `README.md` (`docker compose up -d` before `pnpm dev`)
- [ ] **Task 6: Verify and run** (AC: 1, 2, 3, 4, 5)
  - [ ] `pnpm install` at root succeeds
  - [ ] `docker compose up -d` starts Postgres + Redis
  - [ ] `npx prisma migrate dev` creates tables without errors
  - [ ] `pnpm dev` starts both backend and frontend concurrently
  - [ ] `curl localhost:<PORT>/api/health` returns `{ "data": { "status": "ok" } }`
  - [ ] Verify directory structure matches architecture

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

### Completion Notes List

### File List
