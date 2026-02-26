# Story 5.2: Branch & Table Configuration

Status: ready-for-dev

## Story

As a manager or owner,
I want to configure each branch's tables, zones, opening hours, and peak-time windows,
So that the booking system and operational tools reflect the real layout and schedule of each location.

## Acceptance Criteria

1. **Given** the manager opens the branch configuration panel, **When** they create a new branch with name, address, and opening hours, **Then** the branch is saved and appears in the branch selector on the booking page.

2. **Given** the manager adds tables to a branch, **When** each table is saved with a table ID, seating capacity, and zone assignment, **Then** the table appears on the table map for that branch with the correct zone grouping.

3. **Given** the manager configures opening hours for a branch, **When** a guest attempts to book outside those hours, **Then** no time slots are shown for that period and a message reads: "No availability outside opening hours."

4. **Given** the manager defines a peak-time window (e.g. 18:00–21:00 on weekdays), **When** the system is within that window, **Then** peak-time friendly menu flags are activated and the host dashboard highlights the peak indicator.

5. **Given** the manager edits an existing table's capacity or zone, **When** the change is saved, **Then** the table map and booking availability calculations reflect the updated values immediately.

## Tasks / Subtasks

- [ ] **Task 1: Install dependency** (AC: 3, 4)
  - [ ] `pnpm --filter backend add luxon` and `pnpm --filter backend add -D @types/luxon` — for timezone-aware time comparisons.
- [ ] **Task 2: Prisma – extend Branch, add Table** (AC: 1, 2, 3, 4, 5)
  - [ ] Extend `Branch` model: add `openingHours`, `peakTimeStart`, `peakTimeEnd`, `peakDays`, `timezone` (see schema below). Additive migration; backfill with nullable defaults.
  - [ ] Add `Table` model with `isActive` soft-delete flag and `tableToken` (see schema below).
  - [ ] Run `npx prisma migrate dev --name add_branch_config_and_tables`
- [ ] **Task 3: Branch module – CRUD** (AC: 1, 3, 4)
  - [ ] `GET /api/branches` — **public** (no auth needed) for branch selector on booking page. Returns `{ id, name, address, openingHours, timezone }` — enough for 1.2 slot generation.
  - [ ] `GET /api/branches/:branchId` — public. Full branch detail including `isPeakNow` (see peak-time below). Route param: `:branchId` (camelCase per architecture).
  - [ ] `POST /api/branches` — **manager only** (scoped: manager can only create if `branchId` in token matches, or seed via migration — see note). Body: `{ name, address?, phone?, openingHours?, peakTimeStart?, peakTimeEnd?, peakDays?, timezone }`.
  - [ ] `PATCH /api/branches/:branchId` — **manager only**, scoped: manager can only edit their own branch (`request.user.branchId === params.branchId`). Return 403 otherwise.
  - [ ] **Note on branch creation in Phase 1:** Branches are typically seeded via migration or by a chain owner. Since there's no superadmin role in Phase 1, `POST /api/branches` should still be implemented (manager role) but the FE panel is for edit only in practice. Do NOT expose "create branch" to branch-level managers in the frontend; keep it backend-only for Phase 1.
- [ ] **Task 4: Table module – CRUD** (AC: 2, 5)
  - [ ] `GET /api/branches/:branchId/tables` — **manager auth**, scoped to branch. Filter `isActive = true`. Return `{ id, tableCode, capacity, zone, tableToken }`.
  - [ ] `POST /api/branches/:branchId/tables` — **manager only**, scoped. Body: `{ tableCode, capacity, zone }`. `tableToken` auto-generated (UUID). Reject duplicate `tableCode` within same branch: 409 `TABLE_CODE_ALREADY_EXISTS`.
  - [ ] `PATCH /api/tables/:tableId` — **manager only**, scoped. Body: `{ capacity?, zone? }`. Does NOT change `tableToken` (QR codes remain valid). Returns updated table.
  - [ ] `DELETE /api/tables/:tableId` — **soft-delete only**: set `isActive = false`. Do NOT hard-delete rows (other stories reference tableId and tableToken). Return `{ "data": { "success": true } }`.
- [ ] **Task 5: Opening hours data contract** (AC: 3)
  - [ ] **Scope boundary:** 5.2 stores opening hours and exposes them via API. Enforcement ("No availability outside opening hours") is implemented in **Story 1.2** which reads `openingHours` from `GET /api/branches/:branchId`. 5.2 does NOT implement slot generation or filtering.
  - [ ] Validate `openingHours` shape on write: array of `{ dayOfWeek: 0–6, open: "HH:mm", close: "HH:mm" }`. Reject malformed entries with 400.
  - [ ] Expose `openingHours` and `timezone` in all branch GET responses so 1.2 can perform correct local-time filtering.
- [ ] **Task 6: Peak-time computation** (AC: 4)
  - [ ] Implement `isPeakNow(branch: Branch): boolean` in `branch.service.ts`:
    - Convert current UTC time to branch timezone using `luxon`: `DateTime.now().setZone(branch.timezone)`.
    - Compare local HH:mm against `peakTimeStart` and `peakTimeEnd`.
    - If `peakDays` is set, check `localNow.weekday ∈ peakDays` (luxon weekday: 1=Mon, 7=Sun).
  - [ ] Include `isPeakNow: boolean` in `GET /api/branches/:branchId` response.
  - [ ] This field will be consumed by Epic 2 (menu flags) and Epic 3 (host dashboard). 5.2 only provides the computation; wiring to UI is done in those epics.
- [ ] **Task 7: Branch configuration panel (manager frontend)** (AC: 1, 2, 4, 5)
  - [ ] Manager UI at `frontend/app/(manager)/config/page.tsx`: edit branch details (name, address, opening hours, timezone, peak window). Calls `PATCH /api/branches/:branchId`.
  - [ ] Per-branch table list: show table code, capacity, zone; add/edit table (POST/PATCH); soft-delete button (DELETE). Table map is a simple list for this story — full visual map in Epic 3.
  - [ ] **Do NOT** show "create branch" in the UI. Branch exists in DB (seeded); manager only edits.

## Developer Context

### Existing schema (from Story 1.1)

```prisma
// Already in DB — do NOT recreate or change existing fields
model Branch { id, name, address, phone, createdAt, updatedAt, users[] }
model User { id, email, passwordHash, name, role, branchId, isActive, refreshTokens[], createdAt, updatedAt }
```

### New Prisma additions (additive migration)

```prisma
model Branch {
  // EXISTING fields unchanged — ADD these:
  openingHours  Json?    @map("opening_hours")
  // Shape: [{ dayOfWeek: 0-6, open: "HH:mm", close: "HH:mm" }]
  peakTimeStart String?  @map("peak_time_start")  // "18:00"
  peakTimeEnd   String?  @map("peak_time_end")    // "21:00"
  peakDays      Json?    @map("peak_days")         // [1,2,3,4,5] = Mon-Fri; null = all days
  timezone      String   @default("Asia/Ho_Chi_Minh") @map("timezone")
  tables        Table[]
}

model Table {
  id          String   @id @default(uuid())
  branchId    String   @map("branch_id")
  branch      Branch   @relation(fields: [branchId], references: [id], onDelete: Cascade)
  tableCode   String   @map("table_code")   // e.g. "A1", "B3" — unique per branch
  capacity    Int                            // number of seats
  zone        String                         // e.g. "A", "Terrace"
  tableToken  String   @unique @default(uuid()) @map("table_token")  // used in QR URL (Story 2.1)
  isActive    Boolean  @default(true) @map("is_active")              // soft-delete flag
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  @@unique([branchId, tableCode], name: "uq_tables_branch_code")
  @@index([branchId], name: "idx_tables_branch_id")
  @@index([branchId, zone], name: "idx_tables_branch_zone")
  @@index([tableToken], name: "idx_tables_table_token")
  @@map("tables")
}
```

### API contract

**Branch responses** (all roles):
```json
// GET /api/branches
{ "data": [{ "id", "name", "address", "openingHours", "timezone" }], "meta": { "total" } }

// GET /api/branches/:branchId
{ "data": { "id", "name", "address", "phone", "openingHours", "peakTimeStart",
            "peakTimeEnd", "peakDays", "timezone", "isPeakNow": true } }
```

**Table responses** (manager):
```json
// GET /api/branches/:branchId/tables
{ "data": [{ "id", "tableCode", "capacity", "zone", "tableToken" }], "meta": { "total" } }
```

**Error codes:**
```json
{ "error": { "code": "TABLE_CODE_ALREADY_EXISTS", "message": "Table code 'A1' already exists in this branch." } }
{ "error": { "code": "TABLE_NOT_FOUND", "message": "Table not found." } }
{ "error": { "code": "BRANCH_NOT_FOUND", "message": "Branch not found." } }
{ "error": { "code": "FORBIDDEN", "message": "You can only manage your own branch." } }
```

### RBAC matrix

| Endpoint | public/guest | staff | kitchen | manager |
|----------|-------------|-------|---------|---------|
| GET /api/branches | ✓ | ✓ | ✓ | ✓ |
| GET /api/branches/:branchId | ✓ | ✓ | ✓ | ✓ |
| POST /api/branches | ✗ | ✗ | ✗ | ✓ (own branch only) |
| PATCH /api/branches/:branchId | ✗ | ✗ | ✗ | ✓ (own branch only) |
| GET /api/branches/:branchId/tables | ✗ | ✗ | ✗ | ✓ (own branch) |
| POST /api/branches/:branchId/tables | ✗ | ✗ | ✗ | ✓ (own branch) |
| PATCH /api/tables/:tableId | ✗ | ✗ | ✗ | ✓ (own branch) |
| DELETE /api/tables/:tableId | ✗ | ✗ | ✗ | ✓ (own branch) |

Branch scope enforcement: `if (request.user.branchId !== params.branchId) throw ForbiddenException`.

### Opening hours shape

```json
[
  { "dayOfWeek": 1, "open": "10:00", "close": "22:00" },
  { "dayOfWeek": 2, "open": "10:00", "close": "22:00" },
  { "dayOfWeek": 6, "open": "09:00", "close": "23:00" },
  { "dayOfWeek": 0, "open": "09:00", "close": "23:00" }
]
```
- `dayOfWeek`: 0 = Sunday, 1 = Monday … 6 = Saturday (JS convention, NOT luxon weekday).
- If a day has no entry → branch is closed that day.
- Validate on write; reject if `open >= close` or values outside `"00:00"–"23:59"`.

### Peak-time timezone logic

```typescript
// In branch.service.ts
import { DateTime } from 'luxon';

isPeakNow(branch: Branch): boolean {
  if (!branch.peakTimeStart || !branch.peakTimeEnd || !branch.timezone) return false;
  const now = DateTime.now().setZone(branch.timezone);
  const [sh, sm] = branch.peakTimeStart.split(':').map(Number);
  const [eh, em] = branch.peakTimeEnd.split(':').map(Number);
  const currentMinutes = now.hour * 60 + now.minute;
  const startMinutes = sh * 60 + sm;
  const endMinutes = eh * 60 + em;
  if (!currentMinutes >= startMinutes || currentMinutes >= endMinutes) return false;
  // Check peak days (peakDays uses JS dayOfWeek: 0=Sun)
  if (branch.peakDays) {
    const peakDays = branch.peakDays as number[];
    const jsDow = now.weekday === 7 ? 0 : now.weekday; // luxon: 7=Sun → JS: 0=Sun
    if (!peakDays.includes(jsDow)) return false;
  }
  return true;
}
```

### Backend file structure

```
backend/src/modules/
├── branch/
│   ├── branch.module.ts
│   ├── branch.controller.ts   # GET /api/branches, GET/PATCH /api/branches/:branchId
│   └── branch.service.ts      # CRUD + isPeakNow()
└── table/
    ├── table.module.ts
    ├── table.controller.ts    # GET/POST /api/branches/:branchId/tables, PATCH/DELETE /api/tables/:tableId
    └── table.service.ts       # CRUD with soft-delete
```

### Scope boundaries (critical)

- **5.2 does NOT implement slot generation or slot filtering.** It only stores and exposes opening hours. Story **1.2** reads `GET /api/branches/:branchId` and filters generated time slots using `openingHours` and `timezone`.
- **5.2 does NOT wire peak-time flags to menu or host dashboard UI.** It only computes and returns `isPeakNow`. Stories **2.2** (menu flags) and **3.2** (host dashboard) consume this field.
- **`tableToken` is stored in 5.2 but used by 2.1** (QR code generation). Do not build QR logic here.

### Note for Story 1.2 (Time Slot Configuration)

Story 1.2 (Branch Availability & Time Slot Browsing) needs pre-configured time slots per branch (e.g. 18:00–19:30, 19:30–21:00). These are NOT stored in 5.2. Story 1.2 must add a `TimeSlot` model (additive migration) with fields: `branchId`, `slotStart` (HH:mm), `slotEnd` (HH:mm), `dayOfWeek` (0–6), `capacity`. Dev agent for 1.2 should create this model and a management endpoint.

### Anti-patterns to avoid

- **Do NOT hard-delete Table rows.** Set `isActive = false`. Other stories reference `tableToken` and `tableId`.
- **Do NOT change `tableToken` on PATCH.** QR codes remain valid after capacity/zone edits.
- **Do NOT compare peak-time in UTC.** Always convert to `branch.timezone` using luxon before comparing HH:mm strings.
- **Do NOT allow manager to edit other branches.** Scope every branch/table mutation to `request.user.branchId`.
- **Do NOT implement slot generation in this story.** Boundary: 5.2 = data storage + API; 1.2 = slot logic.

### Dependencies

- Story 1.1: Branch, User models, Prisma, API format, CORS.
- Story 5.1: Manager auth + guards; protect all manager endpoints in this story.
- Story 1.2 (consumes): Will read `openingHours`, `timezone` from branches API.
- Stories 2.1 (consumes): Will use `tableToken` from Table.
- Stories 2.2, 3.2 (consume): Will use `isPeakNow` from branch detail.
- Story 3.1 (consumes): Will use tables list (id, tableCode, capacity, zone) for table map.

### References

- [Source: _bmad-output/planning-artifacts/architecture.md] — Data model, API patterns, branch_id, naming
- [Source: _bmad-output/planning-artifacts/epics.md] — Story 5.2 AC, Epic 5, FR19
- [Source: _bmad-output/implementation-artifacts/1-1-project-foundation-core-infrastructure.md] — Branch schema base, API contract
- [Source: backend/prisma/schema.prisma] — Actual current schema to extend

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
