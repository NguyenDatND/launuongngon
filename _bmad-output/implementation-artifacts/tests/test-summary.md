# Test Automation Summary (Story 5.1)

## Generated / Updated Tests

### API / E2E (Backend - Jest + supertest)
- [x] `backend/test/auth.e2e-spec.ts` – Auth happy path + error cases (login, refresh, logout)
- [x] `backend/test/users.e2e-spec.ts` – Staff management, RBAC, deactivation behavior, expired JWT handling

## Coverage vs Acceptance Criteria

- **AC1 – Manager creates staff, staff can log in**
  - Covered by: `Users (e2e) – allows newly created staff to log in with given credentials`.

- **AC2 – Valid login issues JWT + role-based redirect**
  - Backend issuance + cookie: covered by `Auth (e2e) – valid credentials return accessToken + refresh cookie`.
  - Frontend redirect: implemented in `frontend/app/login/page.tsx` + `frontend/contexts/auth-context.tsx` (no automated UI tests yet).

- **AC3 – Incorrect password shows "Invalid email or password."**
  - Covered by: `Auth (e2e) – wrong password / inactive / non-existent email all return INVALID_CREDENTIALS with unified message`.

- **AC4 – Deactivation invalidates sessions**
  - Covered by: `Users (e2e) – revokes existing sessions and prevents login after deactivation` (asserts login blocked + refresh cookie invalid after deactivation).

- **AC5 – Access token expires; refresh issues new token or redirects to login**
  - Backend refresh endpoint: covered by `Auth (e2e) – missing vs valid refresh cookie`.
  - Backend expired access token behavior: covered by `Users (e2e) – returns 401 for expired access token`.
  - Frontend auto-refresh + redirect: implemented in `frontend/lib/api-client.ts` + `frontend/lib/auth-store.ts` (not yet covered by browser tests).

## Commands

- **Backend E2E:** `pnpm --filter backend test:e2e`

## Next Steps

- Add frontend E2E (Playwright) to cover:
  - Login form UX (error message display, redirects by role).
  - End-to-end refresh-on-401 behavior in the browser.
