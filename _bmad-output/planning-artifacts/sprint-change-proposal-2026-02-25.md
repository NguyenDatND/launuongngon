# Sprint Change Proposal – Backend Tech Stack Standardization (NestJS)

**Project:** LauNuongNgon  
**Date:** 2026-02-25  
**Requested by:** Teavillageboy  
**Scope classification:** Moderate (architecture-level change early in implementation)

---

## 1. Issue Summary

### 1.1 Triggering Story and Context

- **Triggering story:** Story 1.1 – _Project Foundation & Core Infrastructure_ (Epic 1: Booking & Peak-Hour Check-in).
- **Current implementation direction:**
  - Planning artifacts (PRD, epics, Story 1.1) and the architecture document assume a **ServerCN/Express-style Node.js backend** with Prisma, PostgreSQL, and Redis.
  - The architecture document also evaluated NestJS-based options (e.g., “ZENN stack”, “drizzle-nest-next”) but ultimately selected a ServerCN-based backend as the initial foundation.
- **New decision:** The project owner has decided to **standardize the backend on NestJS** for the entire product, not just for a single story.

### 1.2 Core Problem Statement

The current architecture and implementation plan are partially aligned to a ServerCN/Express-style backend, while the desired long-term direction is a **NestJS-based backend**. Continuing with ServerCN/Express would:

- Create divergence between the desired framework (NestJS) and the documented/implemented backend.
- Make it harder to leverage NestJS’s modular architecture, DI container, guards, and testing patterns across all epics.
- Increase cognitive overhead and refactor cost later, especially as more stories build on the current foundation.

This change proposal aims to **pivot the backend foundation to NestJS now**, early in Story 1.1, while keeping:

- The core stack: **TypeScript, PostgreSQL, Prisma ORM, Redis, Next.js frontend**.
- All domain requirements, epics, and story-level acceptance criteria **unchanged** at the business level.

### 1.3 Evidence and Timing

- Implementation is still early (Story 1.1 in progress), so the amount of committed ServerCN/Express-specific code is limited (health endpoint, initial routes, basic scaffolding).
- Planning artifacts already assume a clean separation between backend and frontend, and list NestJS as a serious candidate.
- The architecture document is internally inconsistent: it selects ServerCN as the starter, but some later sections (e.g., auth/guards) already reference typical NestJS patterns. This is a good moment to normalize everything on NestJS.

---

## 2. Impact Analysis

### 2.1 Epic-Level Impact

- **Epics 1–5 (Booking, QR experience, In-store operations, Billing, Analytics):**
  - **Business behavior:** Unchanged. All functional and non-functional requirements remain valid.
  - **Technical realization:** Backend implementation moves from “ServerCN/Express-style services + routes” to **NestJS modules, controllers, services, and guards**.
- No new epics are required; this is a **technical implementation change** that affects how existing epics/stories are implemented.

### 2.2 Story-Level Impact

- **Story 1.1: Project Foundation & Core Infrastructure**
  - **Story text:**
    - OLD: “…backend (ServerCN + Prisma + PostgreSQL + Redis) and frontend (Next.js + shadcn-ui)…”
    - NEW: “…backend (**NestJS + Prisma + PostgreSQL + Redis**) and frontend (Next.js + shadcn-ui)…”
  - **Acceptance criteria:**
    - Still valid as-is (health check endpoint, Prisma migrations, Redis connectivity, project structure, stack/version guardrails).
    - Only the **backend framework** wording changes from ServerCN/Express-style to NestJS.
  - **Tasks/subtasks:** Replace “ServerCN-style patterns” and Express-specific items with NestJS equivalents (Nest CLI scaffold, Nest module/controller/service folders, health controller, Nest testing harness).

- **Future stories (Epics 1–5):**
  - Any future mention of “ServerCN backend”, “Express-style routes”, or “ServerCN components” should be updated to refer to **NestJS modules/controllers/services** while preserving behavior and endpoints.

### 2.3 Artifact Conflicts and Required Updates

#### 2.3.1 PRD (`prd.md`)

- **Section: Additional Requirements**
  - OLD: “The system must be implemented as a full-stack web application using a Next.js frontend (with shadcn-ui) and a **ServerCN-based Node.js backend** with PostgreSQL as the primary database.”
  - NEW: “The system must be implemented as a full-stack web application using a Next.js frontend (with shadcn-ui) and a **NestJS-based Node.js backend** with PostgreSQL as the primary database.”
- All other PRD content (FR/NFR, flows, scope) remains valid and independent of the backend framework choice.

#### 2.3.2 Epics & Stories (`epics.md`)

- **Story 1.1 description and Dev Notes:**
  - Replace all mentions of “ServerCN”, “Express-style server”, and “ServerCN-based API” with **NestJS** equivalents.
  - Keep the acceptance criteria for `/api/health`, Prisma migrations, Redis connectivity, and project structure unchanged.
  - Ensure the “Stack & versions” and “Architecture & Technical Guardrails” references align with NestJS.

- **Cross-references to architecture and stack:**
  - Where epics or story notes reference “ServerCN backend patterns”, adjust them to “NestJS modules, controllers, services, and guards”.

#### 2.3.3 Architecture Document (`architecture.md`)

Key changes:

1. **Starter Template Selection**
   - OLD: Selected starter is “ServerCN backend + Next.js (shadcn-ui) frontend”, with NestJS options treated as alternatives.
   - NEW: Selected starter is **“NestJS backend + Next.js (shadcn-ui) frontend”**, with:
     - Backend: **NestJS** (TypeScript), REST under `/api`, using controllers/services/guards, and Prisma ORM.
     - Frontend: Next.js + shadcn-ui as currently documented.
   - Remove ServerCN-specific initialization commands and replace them with Nest CLI commands, e.g.:
     - `npx @nestjs/cli new backend`

2. **Backend Structure**
   - Keep the high-level `backend/` directory, but align substructure with NestJS conventions, for example:
     - `src/main.ts`, `src/app.module.ts`
     - Feature modules under `src/modules/*` (e.g., `booking`, `table`, `order`, `bill`, `branch`, `auth`).
     - Shared providers/guards/interceptors under `src/common/*`.
   - Map previous “routes/controllers/services” to NestJS modules and controllers, keeping the same API surface:
     - `/api/health` → `HealthModule` + `HealthController`.
     - `/api/bookings` → `BookingsModule` + `BookingsController`, etc.

3. **Auth & Security Section**
   - Normalize on NestJS:
     - Use Nest’s `AuthGuard`, custom `RolesGuard`, and decorators like `@UseGuards(JwtAuthGuard, RolesGuard)` and `@Roles('staff', 'manager', ...)`.
     - Keep JWT strategy, roles, and RBAC semantics as already described; only the framework integration details change to NestJS primitives.

4. **Implementation Patterns & Consistency Rules**
   - Replace references to “ServerCN/Express backend” with “NestJS backend”.
   - Clarify that:
     - Controllers are thin; business logic is in services.
     - Prisma client is injected into services (via a `PrismaService` provider).
     - Redis client is provided as an injectable NestJS provider.
   - Keep response format, naming conventions, and data formats identical (`{ data, error }`, camelCase JSON, snake_case DB).

5. **Project Structure & Boundaries**
   - Keep the root structure (`backend/`, `frontend/`, `prisma/`, `pnpm-workspace.yaml`) but update the backend section to reflect NestJS file naming and module layout instead of hand-rolled Express/ServerCN code.

#### 2.3.4 UX Specification (`ux-design-specification.md`)

- No change required; UX flows and screens do not depend on the backend framework.

#### 2.3.5 Implementation Artifacts – Story 1.1 (`1-1-project-foundation-core-infrastructure.md`)

- Update:
  - Story description and tasks to say “NestJS + Prisma + PostgreSQL + Redis” instead of “ServerCN + Prisma + PostgreSQL + Redis”.
  - Backend file list and path expectations to reference NestJS entrypoints and modules rather than `app.ts`/Express routes (while still keeping `/api/health` and other endpoints as specified).

### 2.4 Technical Impact Summary

- **Codebase:**
  - Replace or refactor the current `backend/` Express-style ServerCN scaffolding into a NestJS application while preserving endpoints, Prisma setup, and Redis integration.
  - Update tests for `/api/health` and any other backend tests to use Nest’s testing utilities or keep them as HTTP-level tests via the running Nest app.
- **Tooling:**
  - Add Nest CLI as a dev dependency and update backend scripts (e.g., `backend:dev`, `backend:build`) to use Nest-driven commands or equivalent `ts-node`/`node` entrypoints.
  - Keep pnpm, Prisma CLI, and Postgres/Redis usage unchanged.

---

## 3. Recommended Approach

### 3.1 Options Evaluated

1. **Option 1 – Direct Adjustment (Recommended)**
   - Update planning artifacts (PRD, epics, architecture, Story 1.1) to declare **NestJS** as the backend framework.
   - Refactor the existing `backend/` foundation into a NestJS app while preserving the same endpoints, database schema, and Redis usage.
   - Continue implementing all future stories on top of NestJS.
   - **Effort:** Medium (focused mostly on foundation and documentation).
   - **Risk:** Low–Medium (early-stage change; main risk is migration of existing Express glue code).

2. **Option 2 – Rollback and Re-Start Backend**
   - Throw away current backend scaffolding and re-bootstrap `backend/` entirely with NestJS.
   - Re-implement `/api/health`, Prisma integration, and Redis connectivity from scratch.
   - **Effort:** Medium–High (depending on how much backend work has already been done).
   - **Risk:** Medium (risk of losing useful patterns/tests already in place).

3. **Option 3 – MVP Scope Reduction or Dual-Stack Transition**
   - Keep ServerCN/Express for part of MVP and gradually introduce NestJS later.
   - This would introduce a dual-backend or phased migration plan.
   - **Effort:** High (managing two patterns).
   - **Risk:** High (increased complexity, inconsistent patterns, confusion for future work).

### 3.2 Chosen Path Forward

- **Selected approach:** **Option 1 – Direct Adjustment**
- **Justification:**
  - The project is still early in implementation (Story 1.1), so the amount of Express-specific code is limited and manageable to refactor.
  - All required infrastructure (Prisma, Postgres, Redis, Next.js) remains the same, reducing complexity.
  - NestJS provides strong architectural guardrails that fit the multi-epic, multi-persona system described in PRD/UX/Architecture.
  - Avoids the long-term cost and confusion of running with a non-preferred backend framework.

---

## 4. Detailed Change Proposals

> Note: Mode requested by user: **Batch**. All proposals are presented together for review.

### 4.1 PRD Edits

- **Section:** “Additional Requirements”
- **Change:** Replace “ServerCN-based Node.js backend” with “NestJS-based Node.js backend”.
- **Rationale:** Align product-level technical description with the chosen backend framework while keeping all domain requirements intact.

### 4.2 Epics & Story 1.1 Edits

- **Story 1.1 – Story text and acceptance criteria**
  - Update the story description to:
    - “backend (**NestJS + Prisma + PostgreSQL + Redis**) and frontend (Next.js + shadcn-ui) scaffolded and runnable locally…”
  - Ensure references to the backend framework in acceptance criteria and tasks are updated from ServerCN/Express to NestJS, while keeping:
    - `/api/health` endpoint behavior exactly as specified.
    - Prisma migrations, Redis connectivity, and project structure requirements unchanged.

- **Dev Notes and stack guardrails**
  - Replace ServerCN-specific language with NestJS but keep:
    - Node.js Active LTS version, Next.js 15.x, Prisma, PostgreSQL, Redis.
    - The `{ data, error }` response format and naming conventions (camelCase JSON, snake_case DB).

### 4.3 Architecture Document Edits

1. **Starter selection:**
   - Promote “NestJS backend + Next.js” to the selected starter and demote/retire ServerCN as an evaluated-but-not-chosen option.

2. **Backend structure and patterns:**
   - Describe the backend as a NestJS app with modules per domain (booking, tables, orders, bills, branch, auth) and shared modules for logging, config, Redis, Prisma.
   - Show example file layout that matches NestJS idioms (e.g., `src/modules/booking/booking.module.ts`, `booking.controller.ts`, `booking.service.ts`).

3. **Auth & security:**
   - Explicitly document JWT-based auth and RBAC using NestJS guards/decorators.
   - Keep the roles (`guest`, `staff`, `kitchen`, `manager`) and behavior exactly as previously designed.

4. **Implementation patterns & consistency rules:**
   - Clarify that **all backend implementation must use NestJS modules/controllers/services**, with Prisma and Redis access going through injectable providers.
   - Enforce that response format, error format, naming, and directory boundaries do not change.

### 4.4 Implementation Artifact Edits – Story 1.1

- Update the implementation artifact for Story 1.1 to:
  - Reflect NestJS-specific backend files (e.g., `main.ts`, module structure) instead of an Express `app.ts` plus routes.
  - Keep the existing frontend structure, tests, and environment scripts but adjust backend scripts to start the Nest app.
  - Document any one-time migration steps needed to move from the initial Express scaffolding to NestJS (if code has already been committed).

---

## 5. Implementation Handoff

### 5.1 Scope Classification

- **Scope:** **Moderate**
  - The change is architectural (framework-level) but occurs very early in the implementation.
  - Main work is consolidating planning artifacts and refactoring the backend foundation; business requirements and UX remain unchanged.

### 5.2 Responsibilities and Next Steps

- **Development Team (you / dev agent):**
  1. Refactor or re-bootstrap `backend/` as a NestJS app (via Nest CLI or manual migration) while keeping:
     - `/api/health` endpoint and its contract.
     - Prisma schema and migrations, PostgreSQL, and Redis integration.
  2. Update backend scripts and tests to run against the NestJS app.
  3. Ensure Story 1.1 acceptance criteria still pass in full.

- **Product Owner / Scrum Master (same person in this context):**
  1. Apply the proposed wording changes to `prd.md`, `epics.md`, `architecture.md`, and `1-1-project-foundation-core-infrastructure.md`.
  2. Confirm that no other planning artifacts still reference ServerCN/Express as the chosen backend.

### 5.3 Success Criteria

- All planning artifacts consistently describe a **NestJS-based backend** with Next.js, Prisma, PostgreSQL, and Redis.
- The repository runs locally with `pnpm dev`, starting a NestJS backend and the existing Next.js frontend successfully.
- `/api/health` behaves exactly as specified.
- Story 1.1 is marked as complete with its implementation aligned to the updated architecture.

---

**Status:** Proposal drafted for batch review.  
**Next action:** Confirm approval of this proposal, then update planning artifacts and refactor the backend foundation to NestJS under Story 1.1.
