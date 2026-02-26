---
stepsCompleted: ['step-01-preflight-and-context']
lastStep: 'step-01-preflight-and-context'
lastSaved: '2026-02-26'
workflowType: 'testarch-atdd'
inputDocuments:
  - _bmad-output/implementation-artifacts/5-1-staff-authentication-role-management.md
  - _bmad/tea/config.yaml
  - _bmad/tea/testarch/knowledge/test-quality.md
  - _bmad/tea/testarch/knowledge/test-levels-framework.md
  - _bmad/tea/testarch/knowledge/data-factories.md
  - _bmad/tea/testarch/knowledge/auth-session.md
---

# ATDD Checklist - Story 5.1: Staff Authentication & Role Management

**Date:** 2026-02-26
**Author:** Teavillageboy
**Primary Test Level:** API (integration) + optional E2E when Playwright added

---

## Step 1: Preflight & Context (Complete)

### 1. Stack Detection

- **detected_stack:** `fullstack`
- **Evidence:** Monorepo with `backend` (NestJS, Prisma, Jest) and `frontend` (Next.js 15, React 19).
- **Config:** `test_stack_type: auto` (from `_bmad/tea/config.yaml`).

### 2. Prerequisites

| Requirement | Status |
|-------------|--------|
| Story with clear acceptance criteria | ✅ Loaded: `5-1-staff-authentication-role-management.md` (5 ACs) |
| Test framework (backend) | ✅ Backend: Jest + supertest, `jest.config.js`, `jest-e2e.json` (`.e2e-spec.ts`) |
| Test framework (frontend/E2E) | ⚠️ Chưa có Playwright/Cypress. Frontend `test` script: "No tests yet". |
| `{project-root}/tests` | ⚠️ Thư mục chưa tồn tại — sẽ tạo khi sinh test. |

**Quyết định:** Tiến hành ATDD **ưu tiên API** (Jest/supertest trong backend). Các test E2E cho login page sẽ được ghi trong checklist và triển khai khi thêm Playwright.

### 3. Story Context (Loaded)

- **Story:** 5.1 Staff Authentication & Role Management
- **As a** manager or owner **I want** create/manage staff accounts with roles and branch access **So that** team members log in with correct permissions.
- **Acceptance criteria:** 5 (staff creation & login, JWT + refresh cookie, invalid password message, deactivate invalidates sessions, refresh token rotation).
- **Tech:** NestJS auth module, JWT 15min + refresh token (httpOnly cookie, 7d), BCrypt, RBAC (staff/kitchen/manager), Prisma User + RefreshToken.

### 4. Framework & Patterns

- **Backend:** Jest (unit), Jest e2e (`jest-e2e.json`, rootDir `.`, `*.e2e-spec.ts`).
- **test_dir:** `{project-root}/tests` (chưa có; API tests sẽ nằm trong `backend` theo convention hiện tại, hoặc tạo `tests/` ở root nếu cần).

### 5. TEA Config Flags

- `tea_use_playwright_utils`: true
- `tea_browser_automation`: auto
- `test_stack_type`: auto

### 6. Knowledge Fragments Loaded

- **Core:** test-quality.md, test-levels-framework.md, data-factories.md, auth-session.md (patterns for API auth, factories, isolation).

---

## Story Summary (from artifact)

As a manager or owner, I want to create and manage staff accounts with assigned roles and branch access, so that each team member can log in with the correct permissions for their job.

---

## Acceptance Criteria (from story)

1. **AC1:** Manager creates staff (email, password, role, branch) → account created, staff can log in.
2. **AC2:** Staff logs in with valid email/password → JWT access token + redirect to role dashboard.
3. **AC3:** Incorrect password → error "Invalid email or password.", no token.
4. **AC4:** Manager deactivates staff → sessions invalidated, cannot log in until reactivated.
5. **AC5:** Access token expires → refresh token issues new access token transparently, or redirect to login if refresh expired.

---

*Next: Step 2 — Generation mode.*
