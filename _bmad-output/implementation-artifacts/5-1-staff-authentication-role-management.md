# Story 5.1: Staff Authentication & Role Management

Status: done

## Story

As a manager or owner,
I want to create and manage staff accounts with assigned roles and branch access,
So that each team member can log in with the correct permissions for their job.

## Acceptance Criteria

1. **Given** the manager opens the staff management panel, **When** they create a new staff account with email, password, role (staff/kitchen/manager), and branch assignment, **Then** the account is created and the staff member can log in with those credentials.

2. **Given** a staff member logs in with valid email and password, **When** authentication succeeds, **Then** they receive a JWT access token and are redirected to the dashboard appropriate for their role.

3. **Given** a staff member enters an incorrect password, **When** they attempt to log in, **Then** an error message is shown: "Invalid email or password." and no token is issued.

4. **Given** a manager deactivates a staff account, **When** the deactivation is saved, **Then** any existing sessions for that account are invalidated and the staff member cannot log in again until reactivated.

5. **Given** a staff member's access token expires, **When** they make an authenticated API request, **Then** the system uses the refresh token to issue a new access token transparently, or redirects to login if the refresh token is also expired.

## Tasks / Subtasks

- [x] **Task 1: Install dependencies** (all ACs)
  - [x] `pnpm --filter backend add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt`
  - [x] `pnpm --filter backend add -D @types/passport-jwt @types/bcrypt`
- [x] **Task 2: Prisma – extend User, add RefreshToken** (AC: 4, 5)
  - [x] Add `isActive Boolean @default(true) @map("is_active")` to `User` model
  - [x] Add `refreshTokens RefreshToken[]` relation to `User`
  - [x] Create `RefreshToken` model (see schema below)
  - [x] Run `npx prisma migrate dev --name add_auth_fields`
- [x] **Task 3: Auth module – login** (AC: 2, 3)
  - [x] `POST /api/auth/login` — validate email+password (BCrypt compare). If `isActive === false`: return 401 `INVALID_CREDENTIALS`. If wrong password: return 401 `INVALID_CREDENTIALS`, message exactly `"Invalid email or password."`. If valid: issue access token (JWT, 15 min) + refresh token (UUID, 7 days), store refresh token hash in DB, set refresh token in **httpOnly cookie** (`refreshToken`, `sameSite: strict`, `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`), return `{ "data": { "accessToken", "expiresIn", "user": { id, email, name, role, branchId } } }` in body.
- [x] **Task 4: Auth module – refresh** (AC: 5)
  - [x] `POST /api/auth/refresh` — read `refreshToken` from httpOnly cookie, lookup by hash in DB, check `revokedAt == null && expiresAt > now`. If invalid: 401 `REFRESH_TOKEN_INVALID`. If valid: issue new access token, rotate refresh token (revoke old, store new in DB, set new cookie). Return same shape as login.
- [x] **Task 5: Auth module – logout** (AC: 4, 5)
  - [x] `POST /api/auth/logout` — read `refreshToken` cookie, set `revokedAt = now` in DB, clear cookie. Return `{ "data": { "success": true } }`. No auth guard required (allow expired access token; cookie is sufficient).
- [x] **Task 6: Guards and RBAC** (AC: 2)
  - [x] `JwtAuthGuard` at `backend/src/common/guards/jwt-auth.guard.ts`: validate access token from `Authorization: Bearer <token>`, attach `{ id, email, role, branchId }` to `request.user`. Return 401 if missing/invalid/expired.
  - [x] `RolesGuard` at `backend/src/common/guards/roles.guard.ts`: check `request.user.role` against `@Roles(...)` metadata.
  - [x] `@Roles()` decorator at `backend/src/common/decorators/roles.decorator.ts`.
  - [x] `@CurrentUser()` decorator at `backend/src/common/decorators/current-user.decorator.ts`.
  - [x] Apply `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('manager')` to all manager-only routes.
- [x] **Task 7: Staff management (manager)** (AC: 1, 4)
  - [x] `POST /api/users` (manager only): create staff. Hash password with BCrypt (rounds: 10). Reject duplicate email with 409 `EMAIL_ALREADY_EXISTS`. Reject if `role === 'guest'` with 400 `INVALID_ROLE`. Return `{ "data": { id, email, name, role, branchId } }`.
  - [x] `GET /api/users` (manager only): list staff. Scope to `branchId` from JWT token (manager sees only their branch). Return `{ "data": [...], "meta": { "total" } }`.
  - [x] `PATCH /api/users/:id` (manager only): update `isActive`. On deactivate (`isActive: false`): set `revokedAt = now` on ALL refresh tokens for that user. Existing access tokens remain valid until TTL expires (15 min max window — acceptable).
- [x] **Task 8: Login page + role-based redirect** (AC: 2)
  - [x] Single login page: `frontend/app/login/page.tsx` (outside route groups so all roles share it).
  - [x] On success: store `accessToken` in-memory (React context or module-level variable — NOT localStorage); refresh token is in httpOnly cookie (browser handles it automatically). Redirect by role: `staff` → `/foh-dashboard`, `kitchen` → `/queue`, `manager` → `/analytics`. If route does not exist yet, redirect to `/` as placeholder.
- [x] **Task 9: Frontend token refresh interceptor** (AC: 5)
  - [x] In `frontend/lib/api-client.ts`: on any 401 response, call `POST /api/auth/refresh` (cookie sent automatically). If refresh succeeds: update in-memory access token, retry original request once. If refresh fails: clear in-memory token, redirect to `/login`.

## Developer Context

### Existing schema (from Story 1.1)

```prisma
// Already in DB — do NOT recreate
enum UserRole { guest staff kitchen manager }
model Branch { id, name, address, phone, createdAt, updatedAt, users[] }
model User {
  id, email (unique), passwordHash, name,
  role UserRole @default(staff),
  branchId, branch, createdAt, updatedAt,
  @@index([branchId])
}
```

### New Prisma additions (additive migration)

```prisma
model User {
  // ADD to existing User model:
  isActive      Boolean        @default(true) @map("is_active")
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String    @id @default(uuid())
  userId    String    @map("user_id")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @map("token_hash")  // SHA-256 of the raw refresh token UUID
  expiresAt DateTime  @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime  @default(now()) @map("created_at")

  @@index([userId], name: "idx_refresh_tokens_user_id")
  @@index([tokenHash], name: "idx_refresh_tokens_token_hash")
  @@map("refresh_tokens")
}
```

### Auth API contract

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | none | Login, returns access token in body + refresh token in httpOnly cookie |
| POST | /api/auth/refresh | none (cookie) | Rotate refresh token, returns new access token |
| POST | /api/auth/logout | none (cookie) | Revoke refresh token, clear cookie |
| POST | /api/users | manager | Create staff account |
| GET | /api/users | manager | List staff (scoped to own branchId) |
| PATCH | /api/users/:id | manager | Update isActive (deactivate/reactivate) |

**Login success response** (body):
```json
{ "data": { "accessToken": "eyJ...", "expiresIn": 900, "user": { "id", "email", "name", "role", "branchId" } } }
```
Refresh token is set as httpOnly cookie, not in the body.

**Login error** (401):
```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." } }
```

**Duplicate email** (409):
```json
{ "error": { "code": "EMAIL_ALREADY_EXISTS", "message": "An account with this email already exists." } }
```

**Invalid role** (400):
```json
{ "error": { "code": "INVALID_ROLE", "message": "Staff accounts cannot have role 'guest'." } }
```

### RBAC matrix

| Endpoint | guest | staff | kitchen | manager |
|----------|-------|-------|---------|---------|
| POST /api/auth/login | ✓ | ✓ | ✓ | ✓ |
| POST /api/auth/refresh | ✓ | ✓ | ✓ | ✓ |
| POST /api/auth/logout | ✓ | ✓ | ✓ | ✓ |
| POST /api/users | ✗ | ✗ | ✗ | ✓ |
| GET /api/users | ✗ | ✗ | ✗ | ✓ |
| PATCH /api/users/:id | ✗ | ✗ | ✗ | ✓ |

`guest` role: reserved for system-level QR flows (future); staff accounts MUST have `role ∈ { staff, kitchen, manager }`.

### JWT and security

- **Access token:** 15 min TTL. JWT payload: `{ sub: userId, role, branchId, iat, exp }`. Sign with `JWT_SECRET` from env.
- **Refresh token:** Raw: random UUID v4. Stored: SHA-256 hash. TTL: 7 days (`expiresAt = now + 7d`).
- **Cookie settings:** `httpOnly: true`, `sameSite: 'strict'`, `path: '/'`, `secure: true` in production.
- **Password:** BCrypt with salt rounds 10. Never log or return `passwordHash`.
- **Error message:** Always `"Invalid email or password."` regardless of whether email exists (prevents user enumeration).

### Backend file structure

```
backend/src/
├── modules/
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.controller.ts     # POST /api/auth/login, /refresh, /logout
│       ├── auth.service.ts        # validate, issueTokens, revokeToken
│       └── jwt.strategy.ts        # passport-jwt strategy
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── decorators/
│       ├── current-user.decorator.ts
│       └── roles.decorator.ts
```

Users CRUD controller: `backend/src/modules/users/users.controller.ts` + `users.service.ts`.

### Frontend

- **Token storage:** `accessToken` in React context (e.g. `AuthContext`). httpOnly cookie for refresh token (browser handles automatically — no JS access needed).
- **Login page:** `frontend/app/login/page.tsx` — outside `(staff)/(manager)/(kitchen)` groups.
- **Role redirects after login:** `staff` → `/foh-dashboard`, `kitchen` → `/queue`, `manager` → `/analytics`.
- **Interceptor:** In `lib/api-client.ts`, wrap `fetch`/`axios`: on 401 → call `/api/auth/refresh` → if success update accessToken in context + retry → if fail redirect to `/login`.
- **Logout:** Call `POST /api/auth/logout`, clear context, redirect to `/login`.

### Anti-patterns to avoid

- **Do NOT** store access token in `localStorage` or `sessionStorage` (XSS risk).
- **Do NOT** create `POST /api/auth/register` — user creation is `POST /api/users` (manager only).
- **Do NOT** expose `passwordHash` in any API response.
- **Do NOT** allow staff accounts with `role = 'guest'`.
- **Do NOT** skip cookie httpOnly — returning refresh token in body is insecure.

### Dependencies

- Story 1.1 done: `User`, `Branch` models, Prisma, global exception filter, API format, CORS.
- This story adds: `isActive`, `RefreshToken` model, auth module, users module, guards, decorators.
- No password reset in this story.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Auth & Security, JWT strategy, RBAC
- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.1 AC
- [Source: _bmad-output/implementation-artifacts/1-1-project-foundation-core-infrastructure.md] — Existing User/Branch schema, API contract, guards placeholder
- [Source: backend/prisma/schema.prisma] — Actual current schema (User, Branch, UserRole enum)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Task 1: Installed @nestjs/jwt, @nestjs/passport, passport, passport-jwt, bcrypt and dev types; added cookie-parser for refresh cookie.
- Task 2: Extended Prisma User with isActive and refreshTokens relation; added RefreshToken model; migration add_auth_fields applied.
- Task 3–5: AuthModule with login (200 + httpOnly cookie), refresh (rotate token, new cookie), logout (revoke + clear cookie). E2e: wrong password, inactive user, non-existent email → 401 INVALID_CREDENTIALS; valid login → 200 + Set-Cookie; refresh and logout e2e added.
- Task 6: JwtStrategy (Bearer token, payload sub/email/role/branchId), JwtAuthGuard, RolesGuard, @Roles(), @CurrentUser(); JWT payload includes email for request.user.
- Task 7: UsersModule POST/GET/PATCH /api/users (manager only, branch-scoped); e2e for 401/403, INVALID_ROLE, EMAIL_ALREADY_EXISTS, create/list/patch isActive.
- Task 8: Login page at /login; AuthProvider + auth-store (in-memory token); role redirect staff→/foh-dashboard, kitchen→/queue, manager→/analytics; placeholder pages for those routes.
- Task 9: api-client doFetch on 401 calls /auth/refresh, updates auth-store, retries once; on refresh fail clears auth and redirects to /login.

**Code Review Fixes (2026-02-26):**
- H1: JwtModule now uses registerAsync + ConfigService.getOrThrow('JWT_SECRET'); JwtStrategy injects ConfigService — no more hardcoded fallback.
- H2: Added UpdateIsActiveDto with @IsBoolean() + ValidationPipe(transform:true) — runtime boolean coercion guaranteed.
- H3: createStaff now validates branchId exists in DB before creating user (BRANCH_NOT_FOUND 400).
- H4: AuthInitializer component added — on mount, attempts silent POST /auth/refresh if no access token in memory, restoring auth state after page reload.
- M1: ValidationPipe global (whitelist, transform) added to main.ts; LoginDto and CreateStaffDto with class-validator decorators.
- M2: updateIsActive now throws NotFoundException (404) instead of BadRequestException (400) for user not found.
- M3: auth.e2e-spec.ts cleanup scoped to testUserId instead of deleteMany({}) on full table.
- M4: login/page.tsx now uses apiPost() from api-client instead of raw fetch.
- M5: POST /api/users has explicit @HttpCode(HttpStatus.CREATED).
- L1: Removed unused AuthService import from jwt.strategy.ts.
- L3: Removed unused expiresIn destructure in login/page.tsx.

### File List

- backend/package.json (auth + cookie-parser deps)
- backend/prisma/schema.prisma (User.isActive, RefreshToken)
- backend/prisma/migrations/20260226052526_add_auth_fields/migration.sql
- backend/src/main.ts (cookieParser)
- backend/src/app.module.ts (AuthModule, UsersModule)
- backend/src/modules/auth/auth.module.ts
- backend/src/modules/auth/auth.controller.ts
- backend/src/modules/auth/auth.service.ts
- backend/src/modules/auth/jwt.strategy.ts
- backend/src/modules/users/users.module.ts
- backend/src/modules/users/users.controller.ts
- backend/src/modules/users/users.service.ts
- backend/src/common/guards/jwt-auth.guard.ts
- backend/src/common/guards/roles.guard.ts
- backend/src/common/decorators/roles.decorator.ts
- backend/src/common/decorators/current-user.decorator.ts
- backend/test/auth.e2e-spec.ts
- backend/test/users.e2e-spec.ts
- frontend/app/layout.tsx (Providers)
- frontend/app/providers.tsx
- frontend/app/login/page.tsx
- frontend/app/(staff)/foh-dashboard/page.tsx
- frontend/app/(kitchen)/queue/page.tsx
- frontend/app/(manager)/analytics/page.tsx
- frontend/contexts/auth-context.tsx
- frontend/lib/auth-store.ts
- frontend/lib/api-client.ts
- backend/prisma/seed.ts (NEW — bootstrap initial manager via prisma db seed)
- _bmad-output/implementation-artifacts/sprint-status.yaml (5-1 → in-progress then review then done)
- backend/src/modules/auth/dto/login.dto.ts (NEW)
- backend/src/modules/users/dto/create-staff.dto.ts (NEW)
- backend/src/modules/users/dto/update-is-active.dto.ts (NEW)
- frontend/components/auth-initializer.tsx (NEW — silent refresh on page reload)
