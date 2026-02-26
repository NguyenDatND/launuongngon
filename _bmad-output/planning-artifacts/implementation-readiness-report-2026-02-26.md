---
stepsCompleted: [step-01-document-discovery, step-02-prd-analysis, step-03-epic-coverage-validation, step-04-ux-alignment, step-05-epic-quality-review, step-06-final-assessment]
documentInventory:
  prd: [prd.md]
  architecture: [architecture.md]
  epics: [epics.md]
  ux: [ux-design-specification.md]
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-26
**Project:** LauNuongNgon

---

## PRD Analysis

### Functional Requirements

**Epic: Booking & Peak-Hour Check-in**

- **FR-1.1 Table Booking by Time Slot:** Customers can choose branch, date, time slot (e.g. 18:00–19:30, 19:30–21:00), party size, optional notes (e.g. birthday, baby chair, allergies). System shows availability per time slot (remaining capacity).
- **FR-1.2 Soft Holds and Confirmation Deadline:** Optionally allow "soft hold" bookings where customers must confirm before a deadline (e.g. by 17:00 for evening slots). If not confirmed, the hold auto-expires and capacity is released.
- **FR-1.3 Booking Confirmation with Code/QR:** After successful booking, system generates booking code and QR code linking to booking details. Confirmation can be displayed on-screen and optionally sent via email/SMS (minimal template).
- **FR-1.4 Check-in on Arrival:** At the branch, host or kiosk can scan the booking QR/code. System validates branch, time window (e.g. ±10 minutes), party size. Booking is marked as "checked-in" and associated to a specific table.
- **FR-1.5 Punctuality and Late Arrival Handling:** System highlights bookings: on time; late but still within grace period; past the grace window (at risk of being released). Host UI clearly shows suggested actions (e.g. prioritize seating vs release slot).

**Epic: QR In-Store Experience (Menu, Ordering, Bill)**

- **FR-2.1 Table-Specific QR Codes:** Each table has a unique QR code. Scanning QR opens the menu page already bound to that table context; no login required.
- **FR-2.2 Digital Menu with Peak-Hour Tags:** Menu items include name, category, description, image (optional), price; flags such as "fast to prepare" or "peak-hour friendly". Front-end highlights recommended/fast items during peak times.
- **FR-2.3 Ordering from the Table:** Guests can add items to the current table's order; add notes per item (e.g. less spicy, no onion). Orders are sent to the staff/kitchen/bar queues.
- **FR-2.4 Real-Time Bill View:** Guests see list of ordered items grouped by type (food/drinks/others), current total including configurable fees/taxes. Bill updates automatically as new items are added or modified by staff.
- **FR-2.5 Time-Remaining and Soft "End-of-Slot" Reminders:** For time-limited slots, system can show a banner when the table is nearing the end of its reserved time (e.g. 20 minutes left) and surface gentle suggestions like ordering dessert or preparing for checkout.

**Epic: In-Store Operations (Host, Staff, Kitchen/Bar)**

- **FR-3.1 Table Map and State Management:** System maintains table states: Free, Reserved (future booking), Occupied (seated), Needs cleaning. Host/staff see a visual map or list grouped by areas (e.g. A/B/C).
- **FR-3.2 Host Dashboard:** Shows upcoming bookings and their status (confirmed, soft hold, at risk), walk-in queue (optional), tables needing cleaning, tables nearing end of reserved time.
- **FR-3.3 Cleaning Prioritization:** When multiple tables are in "needs cleaning" state, system suggests a prioritized list based on presence of waiting guests, table size and demand (e.g. 4-seat tables during peak), proximity or other simple rules.
- **FR-3.4 Staff Order Console:** Staff can view active orders per table, confirm or adjust orders submitted via QR, add manual orders (e.g. guests without QR).
- **FR-3.5 Kitchen/Bar Screens:** Kitchen/bar sees ordered items grouped by preparation station and time; status (new, in progress, ready). Optionally print kitchen/bar tickets.

**Epic: Billing, Discounts, and Feedback**

- **FR-4.1 Bill Adjustments:** Authorized staff can add/remove items, adjust quantities, apply simple discounts (percentage, fixed amount). Basic audit log for adjustments (who, when, what changed).
- **FR-4.2 Bill Closing and Table Turnover:** When payment is completed (handled by existing POS or cash), staff marks the bill as closed and sets table state to "needs cleaning" or "free".
- **FR-4.3 Lightweight Post-Meal Feedback:** After bill closing, guests can optionally answer a very short survey: 1–2 rating questions (waiting time, service), optional free-text comment.

**Epic: Chain Management & Analytics**

- **FR-5.1 Branch and Layout Configuration:** Admin/owner can create and edit branches; configure number of tables, table sizes, and basic zones; configure opening hours and peak time ranges.
- **FR-5.2 Basic Reporting and Dashboards:** At minimum, show daily revenue per branch (as far as data is available), count of online bookings vs walk-ins, no-show rate and late arrival patterns.
- **FR-5.3 Peak Utilization Heatmaps:** Visualize occupancy by hour/day-of-week, usage of different table sizes; help owners adjust layout and staffing.
- **FR-5.4 No-Show Soft Flags:** Track repeated no-shows or very late arrivals at the booking-identity level. Surface soft flags to staff (internal only) to support decisions such as requiring deposits for certain bookings.

**Total FRs: 22**

### Non-Functional Requirements

- **NFR1 (Reliability):** System should handle typical peak load of a medium-size chain (exact numbers to be defined later) without noticeable slowdowns in critical flows (booking, check-in, ordering).
- **NFR2 (Usability):** Interfaces must be simple enough for staff with limited technical training and for guests who just scan a QR and want to order quickly.
- **NFR3 (Performance):** QR menu and bill view load in under ~2 seconds on common mobile devices and networks.
- **NFR4 (Availability):** Acceptable to have planned downtime off-peak; long-term target is high availability but Phase 1 can tolerate modest SLAs.

**Total NFRs: 4**

### Additional Requirements

- **Scope constraints (Phase 1):** Web-first, mobile-friendly UI; no loyalty/points, complex vouchers, deep POS/accounting, native apps; online table booking, QR in-store, core operations tooling, lightweight chain analytics only.
- **Integration:** Payment completed via existing POS or cash; exact integration level with existing POS/cash systems in branches is an open question.
- **Open questions/risks (Section 7):** Policy for deposit requirements and no-show thresholds; data privacy and retention for customer identifiers and booking history; operational change management and training per branch.
- **Business rules:** Time-limited slots with end-of-slot reminders; configurable fees/taxes on bill; audit log for bill adjustments.

### PRD Completeness Assessment

The PRD is well structured with clear Phase 1 scope, personas, use cases, and requirements grouped by epic. All 22 functional requirements are explicitly numbered (FR-1.1 through FR-5.4) and four non-functional areas (reliability, usability, performance, availability) are stated. Goals vs non-goals and in-scope vs out-of-scope are explicit. Open questions and risks are documented. The document is suitable for traceability validation against epics and stories.

---

## Epic Coverage Validation

### Coverage Matrix

Epics document uses flat numbering FR1–FR22; PRD uses FR-X.Y by epic. Mapping is 1:1 (FR-1.1 = FR1, …, FR-5.4 = FR22). All PRD FRs are covered in the epics FR Coverage Map and epic list.

| PRD FR   | Epic Coverage                                      | Status    |
|----------|-----------------------------------------------------|-----------|
| FR-1.1   | Epic 1 – Booking & Peak-Hour Check-in               | ✓ Covered |
| FR-1.2   | Epic 1 – Booking & Peak-Hour Check-in               | ✓ Covered |
| FR-1.3   | Epic 1 – Booking & Peak-Hour Check-in               | ✓ Covered |
| FR-1.4   | Epic 1 – Booking & Peak-Hour Check-in               | ✓ Covered |
| FR-1.5   | Epic 1 – Booking & Peak-Hour Check-in              | ✓ Covered |
| FR-2.1   | Epic 2 – QR Table Experience                        | ✓ Covered |
| FR-2.2   | Epic 2 – QR Table Experience                        | ✓ Covered |
| FR-2.3   | Epic 2 – QR Table Experience                        | ✓ Covered |
| FR-2.4   | Epic 2 – QR Table Experience                        | ✓ Covered |
| FR-2.5   | Epic 2 – QR Table Experience                        | ✓ Covered |
| FR-3.1   | Epic 3 – In-Store Operations                        | ✓ Covered |
| FR-3.2   | Epic 3 – In-Store Operations                        | ✓ Covered |
| FR-3.3   | Epic 3 – In-Store Operations                        | ✓ Covered |
| FR-3.4   | Epic 3 – In-Store Operations                        | ✓ Covered |
| FR-3.5   | Epic 3 – In-Store Operations                        | ✓ Covered |
| FR-4.1   | Epic 4 – Billing & Post-Meal Feedback               | ✓ Covered |
| FR-4.2   | Epic 4 – Billing & Post-Meal Feedback               | ✓ Covered |
| FR-4.3   | Epic 4 – Billing & Post-Meal Feedback              | ✓ Covered |
| FR-5.1   | Epic 5 – Branch Configuration & Analytics          | ✓ Covered |
| FR-5.2   | Epic 5 – Branch Configuration & Analytics          | ✓ Covered |
| FR-5.3   | Epic 5 – Branch Configuration & Analytics          | ✓ Covered |
| FR-5.4   | Epic 5 – Branch Configuration & Analytics          | ✓ Covered |

### Missing Requirements

None. All 22 PRD functional requirements are covered in the epics document (FR Coverage Map and epic summaries).

### Coverage Statistics

- **Total PRD FRs:** 22  
- **FRs covered in epics:** 22  
- **Coverage percentage:** 100%

---

## UX Alignment Assessment

### UX Document Status

**Found.** `ux-design-specification.md` (6 KB) in planning-artifacts. It defines Executive Summary (vision, target users, design challenges), six Core UX Areas with screen groups, and design opportunities aligned with PRD.

### Alignment with PRD

- **User journeys ↔ PRD use cases:** UX screen groups map to all PRD key use cases: booking & confirmation (1–2), check-in (2), walk-in (3), QR menu/order/bill (4), staff/kitchen coordination (5–6), bill close & turnover (7), manager analytics (8).
- **Personas:** UX Target Users (Guests, FOH staff, Kitchen/bar, Branch managers & chain owners) match PRD Section 4 personas.
- **FR coverage:** UX areas 1–6 cover Guest Booking & Check-in (FR-1.x), QR Table Experience (FR-2.x), Host & Staff & Kitchen (FR-3.x), Bill Control (FR-4.x), Manager Dashboard & Config (FR-5.x). No UX requirement was found that is not reflected in the PRD.

### Alignment with Architecture

- **Explicit UX reference:** Architecture document’s “Scale & Complexity” and “Starter Template” sections cite PRD and UX; frontend is described as supporting “màn hình booking, table map, dashboards theo UX spec.”
- **Performance:** NFR (QR menu/bill load < ~2s) is reflected in architecture’s reliability/performance goals and caching strategy.
- **Realtime/updates:** Architecture includes a realtime/notifications module for table/order/bill state updates, supporting UX needs for live table map and live bill.
- **Segmentation:** Architecture and epics require clear separation of guest, staff, kitchen, and manager experiences; UX specifies distinct screen groups for each.

### Alignment Issues

None identified. UX, PRD, and Architecture are aligned for Phase 1 scope.

### Warnings

None. UX document exists, is referenced by Architecture and Epics, and covers all Phase 1 user flows and screen groups.

---

## Epic Quality Review

Validation was performed against create-epics-and-stories best practices: user value, epic independence, no forward dependencies, and story completeness.

### Epic Structure Validation

**User value focus:** All five epics are user-centric (Booking & Check-in, QR Table Experience, In-Store Operations, Billing & Feedback, Branch Config & Analytics). Epic titles and goals describe user outcomes. No technical-only epics (e.g. "Setup Database" or "API Development") were found.

**Starter template:** Architecture specifies NestJS + Next.js + Prisma + Redis. Epic 1 Story 1 ("Project Foundation & Core Infrastructure") is framed as "As a development team" and sets up monorepo, backend, frontend, Prisma (`branches`, `users`), Redis, and health check. This is accepted as the allowed "initial project from starter template" story per workflow.

### Epic Independence & Dependencies

**Critical finding – forward dependencies on Epic 5:**

- **Epic 5.1 (Staff Authentication & Role Management)** is required for: Epic 1.5 (Host Check-in Console – host must log in), Epic 3 (all FOH/kitchen/bar screens), Epic 4 (staff bill control). Epics 1, 3, and 4 are ordered before Epic 5, so they have a forward dependency on Epic 5.1.
- **Epic 5.2 (Branch & Table Configuration)** is the only place that creates and configures branches and restaurant tables. Epic 1.2 (Branch Availability & Time Slot Browsing) needs branches and slot configuration; Epic 2.1 (Table QR Code Generation & Binding) states "Given a table is configured in the system"; Epic 3.1 (Live Table Map) requires tables and zones. So Epic 1, 2, and 3 depend on Epic 5.2, which appears later in the backlog.

**Rule violated:** "Epic N cannot require Epic N+1 to work." Here, Epics 1–4 logically require Epic 5.1 and/or 5.2 to function.

**Recommendation:** Reorder work so that foundational capabilities are available first: (1) Implement Epic 5.1 (Staff Authentication) and Epic 5.2 (Branch & Table Configuration) as the first delivery slice, or (2) Move Stories 5.1 and 5.2 into an "Epic 0" or into Epic 1 (e.g. 1.1 = Foundation + Auth + Branch/Table config), then keep Epic 5 for analytics-only (5.3–5.5). Alternatively, keep epic order but plan sprint order so that 5.1 and 5.2 are completed before or in parallel with early Epic 1–3 stories that need them.

### Story Quality Assessment

**Acceptance criteria:** Stories use clear Given/When/Then structure, testable outcomes, and cover error/edge cases (e.g. wrong branch, expired token, empty cart, permission denied). No vague or non-measurable ACs were identified.

**Story sizing:** Stories are scoped to single themes (e.g. one story for soft hold, one for check-in, one for bill closing). No single story was found that is effectively epic-sized.

**Within-epic ordering:** Stories within each epic read in a logical sequence (e.g. 1.2 availability → 1.3 booking → 1.4 soft hold → 1.5 check-in → 1.6 punctuality). No explicit "Story X depends on Story Y" forward references within an epic.

### Best Practices Compliance Summary

| Criterion                         | Status |
|----------------------------------|--------|
| Epics deliver user value         | Yes    |
| Epic N does not require Epic N+1 | No – forward deps on Epic 5 |
| Stories appropriately sized      | Yes    |
| No forward dependencies          | No – see above |
| Clear acceptance criteria        | Yes    |
| Traceability to FRs              | Yes (FR Coverage Map) |

### Quality Findings by Severity

**Critical:** Forward dependencies on Epic 5 (Stories 5.1 and 5.2) by Epics 1, 2, 3, and 4. Implementation order must be adjusted so auth and branch/table configuration are available before dependent features.

**Major:** None beyond the above.

**Minor:** Epic 1 Story 1 is the only story framed as "development team" rather than end-user; acceptable as the explicit project-foundation story per architecture.

---

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK.** PRD, Architecture, UX, and epic/story content are strong and aligned; one structural issue must be resolved before implementation to avoid blocked or rework-heavy sprints.

### Implementation Order & Sprint 1 Scope (action before Sprint Planning)

**Epic 5.1 (Staff Authentication & Role Management)** and **Epic 5.2 (Branch & Table Configuration)** must be delivered **before or in the same sprint as** early Epic 1–3 stories that depend on them. Do one of the following **before** running Sprint Planning:

1. **Option A – Sprint 1 scope (recommended):** Define Sprint 1 as: **1.1 (Foundation), 5.1 (Auth), 5.2 (Branch/Table config)**. Complete 5.1 and 5.2 in Sprint 1 so that 1.2 (Branch Availability), 2.1 (Table QR), 3.x (Host/Staff/Kitchen), and 4.x (Staff bill control) have auth and branch/table data available.
2. **Option B – Reorder backlog:** In `sprint-status.yaml`, order stories so that 5.1 and 5.2 are the next backlog items after 1.1 (see readiness recommendation below). Then create-story and sprint planning will naturally pick 5.1 and 5.2 for the first sprint.

**Sprint 1 recommended scope (explicit):**

| Order | Story key | Story title |
|-------|-----------|-------------|
| 1 | 1-1 | Project Foundation & Core Infrastructure |
| 2 | 5-1 | Staff Authentication & Role Management |
| 3 | 5-2 | Branch & Table Configuration |

After Sprint 1, proceed with 1.2, 1.3, … then Epic 2, 3, 4, then 5.3–5.5 (analytics-only).

### Critical Issues Requiring Immediate Action

1. **Forward dependencies on Epic 5:** Epics 1–4 depend on Epic 5.1 (Staff Authentication) and Epic 5.2 (Branch & Table Configuration). The current backlog order (E1 → E2 → E3 → E4 → E5) means auth and branch/table setup are built last, so booking, QR table, table map, and host/staff flows cannot be fully implemented or tested until Epic 5 is done. This creates a single large batch of dependency and increases risk.

### Recommended Next Steps

1. **Before Sprint Planning:** Apply **Implementation Order & Sprint 1 Scope** above: either adopt Sprint 1 = 1.1, 5.1, 5.2, or reorder `sprint-status.yaml` so 5.1 and 5.2 follow 1.1.
2. **Doc update:** In `epics.md`, add a short "Implementation order" note stating that 5.1 and 5.2 should be completed before (or with) early Epic 1–3 stories (see epics.md update below).
3. **When running Sprint Planning:** Ensure 5.1 and 5.2 are included in the first sprint; do not schedule 1.2+ or Epic 2/3/4 stories that require staff login or branch/table config before 5.1 and 5.2 are done.

### Final Note

This assessment identified **1 critical issue** (forward dependencies on Epic 5) in the **epic quality** category. PRD extraction, FR coverage (100%), and UX/Architecture alignment have no blocking issues. Address the critical ordering/dependency issue before starting implementation, or explicitly accept the risk of building Epics 1–4 with stubs until Epic 5 is delivered. These findings can be used to update the epic order and sprint plan, or you may proceed as-is with the dependency risk documented.
