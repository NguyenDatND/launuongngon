stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-epic-1-complete
  - step-03-epic-2-complete
  - step-03-epic-3-complete
  - step-03-epic-4-complete
  - step-03-epic-5-complete
  - step-03-create-stories-complete
  - step-04-final-validation-complete
status: complete
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
project_name: LauNuongNgon
author: Teavillageboy
date: 2026-02-25
---

# LauNuongNgon - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for LauNuongNgon, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Customers can book tables by branch, date, time slot and party size, including optional notes and visibility of remaining capacity per slot.  
FR2: The system supports soft-hold bookings with a confirmation deadline; unconfirmed holds auto-expire and release capacity.  
FR3: After booking, the system generates a booking code and QR code linking to booking details, shown on screen and optionally via basic email/SMS.  
FR4: On arrival, host or kiosk can check in bookings via code/QR, validating branch, time window and party size, and assigning a table.  
FR5: The system classifies bookings as on time, late within grace, or past grace and surfaces clear suggested actions to host.  
FR6: Each table has a unique QR that opens the correct table context without login.  
FR7: Guests can view a digital menu with categories, item details and “fast to prepare/peak-time friendly” flags emphasized during peak hours.  
FR8: Guests can place orders from the table, add per-item notes, and send orders into staff/kitchen/bar queues.  
FR9: Guests can view a real-time bill grouped by item type with automatically updated totals (including configurable fees/taxes) as orders change.  
FR10: For time-limited slots, the system shows remaining time banners and soft “end-of-slot” reminders in the guest experience.  
FR11: The system maintains table states (Free, Reserved, Occupied, Needs cleaning) and presents them on a visual table map by area.  
FR12: A host dashboard shows upcoming bookings with statuses, optional walk-in queue, tables needing cleaning, and tables nearing slot end.  
FR13: The system prioritizes the cleaning queue based on waiting guests, table size/demand and simple rules.  
FR14: Staff have a console to view active orders per table, confirm QR-submitted orders and add manual orders.  
FR15: Kitchen/bar screens show ordered items grouped by station and time, with status (new/in progress/ready) and optional printing of tickets.  
FR16: Authorized staff can adjust bills by adding/removing items, changing quantities and applying simple discounts (percentage or fixed amount) with an audit log.  
FR17: When payment is completed, staff can close the bill and transition the table to “needs cleaning” or “free” to enable turnover.  
FR18: After closing the bill, guests can optionally submit a very short feedback survey (1–2 rating questions plus optional comment).  
FR19: Admin/owners can configure branches, table counts and sizes, simple zones, opening hours and peak-time ranges.  
FR20: The system provides basic reporting and dashboards for daily revenue per branch, online bookings vs walk-ins and no-show rates.  
FR21: The system visualizes occupancy and table usage over time (heatmaps) to inform layout and staffing decisions.  
FR22: The system tracks repeated no-shows/very late arrivals per booking identity and surfaces soft flags internally to staff.

### NonFunctional Requirements

NFR1: Reliability – the system must handle typical peak load of a medium-size chain without noticeable slowdowns in critical flows (booking, check-in, ordering, bill updates).  
NFR2: Usability – UIs must be simple enough for staff with limited technical training and for guests who only scan a QR and want to order quickly.  
NFR3: Performance – QR menu and bill view should load in under approximately 2 seconds on common mobile devices and real-world networks.  
NFR4: Availability – Phase 1 can tolerate planned downtime off-peak, with a longer-term direction toward higher availability SLAs.

### Additional Requirements

- The system must be implemented as a full-stack web application using a Next.js frontend (with shadcn-ui) and a NestJS-based Node.js backend with PostgreSQL as the primary database.  
- Prisma ORM must be used for schema and migrations, following an additive-first migration strategy with versioned migrations committed to the repo.  
- The data model must be single-tenant for the LauNuongNgon chain, with `branch_id` on all main entities and a clear path to future multi-tenant support via additive changes.  
- Redis should be used to cache availability per branch/time-slot, table map snapshots and frequently accessed analytics aggregates, with event-driven cache invalidation.  
- Authentication must use JWT for staff/kitchen/manager with role-based access control, while guests access booking/table flows via booking codes or table tokens without login.  
- API endpoints must follow the standardized REST structure under `/api`, using plural, kebab-case resource paths and a consistent response format `{ data, error }`.  
- JSON payloads must use camelCase fields and ISO 8601 UTC strings for date/time, while the database uses snake_case with clear indexing conventions.  
- Audit logging is required for sensitive operations such as bill adjustments, table state changes, booking releases and no-show markings.  
- Frontend structure must separate guest, staff, kitchen and manager experiences into clear route segments and feature-based components, aligned with the architecture document.  
- Event and analytics logging must capture enough booking/check-in/order/bill/table events to power dashboards and heatmaps without excessive overhead.  
- UX must provide: live table maps with clear color-coded states, timeline-style booking views, prioritized cleaning queues, and simple but focused dashboards for managers as described in the UX specification.

### FR Coverage Map

FR1: Epic 1 – Booking & Peak-Hour Check-in (table booking by branch/date/slot/party size with capacity visibility)
FR2: Epic 1 – Booking & Peak-Hour Check-in (soft-hold with confirmation deadline and auto-expire)
FR3: Epic 1 – Booking & Peak-Hour Check-in (booking code and QR generation with optional email/SMS)
FR4: Epic 1 – Booking & Peak-Hour Check-in (check-in via QR/code with branch, time window and party size validation)
FR5: Epic 1 – Booking & Peak-Hour Check-in (on-time/late/past-grace classification with host action suggestions)
FR6: Epic 2 – QR Table Experience (unique per-table QR that opens table context without login)
FR7: Epic 2 – QR Table Experience (digital menu with categories, item details and peak-time friendly flags)
FR8: Epic 2 – QR Table Experience (order placement from table with per-item notes, sent to staff/kitchen/bar queues)
FR9: Epic 2 – QR Table Experience (real-time bill view grouped by item type with live total updates)
FR10: Epic 2 – QR Table Experience (slot time remaining banner and soft end-of-slot reminders)
FR11: Epic 3 – In-Store Operations (table state management: Free/Reserved/Occupied/Needs Cleaning with visual map)
FR12: Epic 3 – In-Store Operations (host dashboard with booking timeline, walk-in queue, cleaning and slot alerts)
FR13: Epic 3 – In-Store Operations (prioritized cleaning queue based on waiting guests, table size/demand)
FR14: Epic 3 – In-Store Operations (staff console to view, confirm QR orders and add manual orders per table)
FR15: Epic 3 – In-Store Operations (kitchen/bar order queue screens by station/time/status with optional ticket printing)
FR16: Epic 4 – Billing & Post-Meal Feedback (bill adjustments: add/remove items, quantities, discounts with audit log)
FR17: Epic 4 – Billing & Post-Meal Feedback (bill closing and table state transition to enable turnover)
FR18: Epic 4 – Billing & Post-Meal Feedback (optional short post-meal feedback survey after bill close)
FR19: Epic 5 – Branch Configuration & Analytics (branch/table/zone/opening hours/peak window configuration)
FR20: Epic 5 – Branch Configuration & Analytics (basic reporting: daily revenue, booking vs walk-in, no-show rate)
FR21: Epic 5 – Branch Configuration & Analytics (occupancy and table-type usage heatmaps)
FR22: Epic 5 – Branch Configuration & Analytics (repeated no-show/late-arrival soft flags per booking identity)

## Epic List

### Epic 1: Booking & Peak-Hour Check-in
Guests can discover available time slots at any branch, book a table online, receive a booking code/QR, and check in smoothly on arrival. Hosts have clear visibility of punctuality status and can handle late arrivals or no-shows with confidence.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: QR Table Experience – Menu, Ordering & Live Bill
Guests at the table scan a QR code to instantly access the full menu (with peak-time highlights), place and update orders with item notes, and track their live bill at any time, including soft reminders when their slot is nearing its end.
**FRs covered:** FR6, FR7, FR8, FR9, FR10

### Epic 3: In-Store Operations – Table Map, Host & Kitchen/Bar
Front-of-house staff see a live table map with color-coded states and a prioritized cleaning queue, while the host console tracks the booking timeline and walk-in flow. Kitchen and bar teams work from a clear, station-grouped order queue with status tracking and optional ticket printing.
**FRs covered:** FR11, FR12, FR13, FR14, FR15

### Epic 4: Billing, Adjustments & Post-Meal Feedback
Authorized staff can adjust bills (add/remove items, apply discounts) with a full audit trail, close the bill to free the table for turnover, and give guests a brief optional feedback prompt after checkout.
**FRs covered:** FR16, FR17, FR18

### Epic 5: Branch Configuration & Chain-Level Analytics
Owners and managers configure each branch (tables, zones, opening hours, peak windows) and access chain-level dashboards covering daily revenue, booking vs walk-in split, no-show rates, occupancy heatmaps, and soft flags for repeat no-shows.
**FRs covered:** FR19, FR20, FR21, FR22

**Implementation order:** Stories **5.1 (Staff Authentication & Role Management)** and **5.2 (Branch & Table Configuration)** have forward dependencies from Epics 1–4 (host login, branch/table data for booking, QR table, table map, staff flows). Complete 5.1 and 5.2 **before or in the same sprint as** early Epic 1–3 stories (e.g. Sprint 1 = 1.1, 5.1, 5.2). See `implementation-readiness-report-*.md` for Sprint 1 scope.

---

## Epic 1: Booking & Peak-Hour Check-in

Guests can discover available time slots at any branch, book a table online, receive a booking code/QR, and check in smoothly on arrival. Hosts have clear visibility of punctuality status and can handle late arrivals or no-shows with confidence.

### Story 1.1: Project Foundation & Core Infrastructure

As a development team,
I want the project monorepo initialized with backend (NestJS + Prisma + PostgreSQL + Redis) and frontend (Next.js + shadcn-ui) scaffolded and runnable locally,
So that all subsequent stories can be built on a consistent, working foundation aligned with the architecture document.

**Acceptance Criteria:**

**Given** the repository is cloned and `.env` is configured from `.env.example`,
**When** `pnpm install && pnpm dev` is run,
**Then** the backend server starts on its configured port and the frontend renders without errors.

**Given** the backend is running,
**When** `GET /api/health` is called,
**Then** it returns `{ "data": { "status": "ok" } }` with HTTP 200.

**Given** the Prisma schema is initialized with the `branches` and `users` tables,
**When** `npx prisma migrate dev` is run,
**Then** the PostgreSQL database is created with those tables and no migration errors occur.

**Given** Redis is configured,
**When** the backend starts,
**Then** it connects to Redis without errors and logs confirmation.

**Given** the project is set up,
**When** the directory structure is reviewed,
**Then** it matches the architecture document: `backend/`, `frontend/`, `prisma/`, `pnpm-workspace.yaml`, and `.env.example` with all required variables documented.

---

### Story 1.2: Branch Availability & Time Slot Browsing

As a guest,
I want to browse available time slots by branch, date, and party size,
So that I can find a slot that fits my group before committing to a booking.

**Acceptance Criteria:**

**Given** the guest opens the booking page,
**When** they select a branch and a date,
**Then** the system displays all configured time slots for that day, each showing remaining capacity.

**Given** a time slot has fewer than 20% of its total capacity remaining,
**When** it is displayed in the slot list,
**Then** it is visually highlighted as "near full" with a distinct badge or color.

**Given** a time slot is fully booked,
**When** it appears in the list,
**Then** it is shown as unavailable and cannot be selected.

**Given** the guest enters a party size larger than any remaining table in a slot can accommodate,
**When** they attempt to select that slot,
**Then** a clear inline message explains the slot is unavailable for their group size.

**Given** the guest is on a common mobile device,
**When** the availability page loads,
**Then** it renders fully in under 2 seconds on a realistic mobile network.

---

### Story 1.3: Table Booking Submission & Confirmation

As a guest,
I want to submit a table booking for my chosen branch, date, time slot, and party size and receive a booking code and QR code,
So that I have confirmed proof of my reservation to present at check-in.

**Acceptance Criteria:**

**Given** the guest has selected a valid branch, date, time slot, and party size,
**When** they complete the booking form (optional notes) and submit,
**Then** the system creates a booking with status `confirmed` and returns a unique booking code.

**Given** a booking is successfully created,
**When** the confirmation page loads,
**Then** it displays: booking code, scannable QR code, branch name, date, time slot, party size, and any notes entered.

**Given** the guest provided an email address during booking,
**When** the booking is confirmed,
**Then** a confirmation email is sent using a basic template containing all booking details and the QR code.

**Given** two guests attempt to book the last available spot in the same slot simultaneously,
**When** both submit at the same time,
**Then** only one booking is created successfully and the other receives a clear "slot no longer available" error.

**Given** a booking is created,
**When** the booking code is inspected,
**Then** it is unique across all branches and all dates.

---

### Story 1.4: Soft-Hold Bookings with Confirmation Deadline

As a guest,
I want to create a soft-hold reservation that temporarily secures capacity until I confirm it by a deadline,
So that I can hold a slot while I finalize my group's plans without losing availability.

**Acceptance Criteria:**

**Given** a slot has soft-hold enabled,
**When** the guest selects the soft-hold option and submits,
**Then** the system creates a booking with status `soft_hold` and the confirmation page prominently displays the deadline for confirming.

**Given** a soft-hold booking exists and the deadline has not passed,
**When** the guest returns to the booking and confirms,
**Then** the booking status changes to `confirmed` and a standard QR code and booking code are generated.

**Given** a soft-hold booking has not been confirmed by its deadline,
**When** the system runs its expiry check,
**Then** the booking status is automatically set to `expired` and the held capacity is released back to the slot.

**Given** a soft-hold booking exists,
**When** the host views upcoming bookings on the dashboard,
**Then** it appears with a "Soft Hold" badge clearly distinguishing it from confirmed bookings.

**Given** a soft-hold booking expires,
**When** the capacity is released,
**Then** no guest-facing notification is sent in Phase 1 and the slot becomes bookable again immediately.

---

### Story 1.5: Host Check-in Console

As a host,
I want to scan or enter a guest's booking QR code or booking code to check them in and assign a table,
So that arriving guests are seated quickly and accurately without manual paperwork.

**Acceptance Criteria:**

**Given** the host opens the check-in panel and enters or scans a valid booking code,
**When** the code is submitted,
**Then** the system displays the booking details (party size, time slot, notes) and suggests an available table for assignment.

**Given** the host selects a table and confirms the assignment,
**When** the check-in is submitted,
**Then** the booking is marked `checked_in`, the assigned table state changes to `occupied`, and the console shows a success confirmation.

**Given** the booking code belongs to a different branch,
**When** the host at the current branch scans it,
**Then** an error message clearly states the code is from another branch and check-in is blocked.

**Given** the current time is outside the booking's valid window (e.g. more than 10 minutes before slot start or after grace period ends),
**When** the host attempts to check in,
**Then** the system warns the host but allows an override with a confirmation prompt.

**Given** a booking code has already been checked in,
**When** it is scanned again,
**Then** the system shows an "already checked in" message with the table assignment details.

---

### Story 1.6: Booking Punctuality & Late Arrival Handling

As a host,
I want to see each upcoming booking's punctuality status with clear suggested actions,
So that I can make fast, consistent decisions about seating or releasing slots during a busy peak session.

**Acceptance Criteria:**

**Given** the host dashboard is open during a peak session,
**When** there are upcoming and overdue bookings,
**Then** each booking is displayed with a color-coded status: green for "on time", amber for "late – within grace", red for "past grace window".

**Given** a booking is past its grace window,
**When** it is shown on the dashboard,
**Then** a "Release slot" action button is displayed prominently next to it.

**Given** a booking is late but still within the grace window,
**When** it is displayed,
**Then** a "Prioritize seating on arrival" note is shown as a soft prompt.

**Given** the host clicks "Release slot" and confirms,
**When** the action is processed,
**Then** the booking status is updated to `no_show`, the associated table reservation is cleared, and an undo prompt appears for 30 seconds.

**Given** the host clicks "Undo" within 30 seconds of releasing a slot,
**When** the undo is confirmed,
**Then** the booking is restored to its previous status and the table reservation is reinstated.

---

## Epic 2: QR Table Experience – Menu, Ordering & Live Bill

Guests at the table scan a QR code to instantly access the full menu (with peak-time highlights), place and update orders with item notes, and track their live bill at any time, including soft reminders when their slot is nearing its end.

### Story 2.1: Table QR Code Generation & Binding

As a system administrator,
I want each table to have a unique, persistent QR code that binds any scan to the correct table context without requiring guest login,
So that guests can immediately access the table experience after a single scan.

**Acceptance Criteria:**

**Given** a table is configured in the system,
**When** the admin views the table details,
**Then** a unique QR code is displayed and downloadable for that table, encoding a URL with a unique `tableToken`.

**Given** a guest scans a table QR code,
**When** the URL is opened in a mobile browser,
**Then** the page loads showing the correct branch name and table identifier with no login prompt.

**Given** the `tableToken` in the URL is invalid or expired,
**When** the page loads,
**Then** a clear error message is shown: "This QR code is not valid. Please ask staff for assistance."

**Given** a table's QR code is scanned while the table is in `free` state (not yet occupied),
**When** the page loads,
**Then** the guest sees a "Welcome" screen with options to view the menu or view the current bill.

**Given** the table QR page loads on a common mobile device,
**When** measured on a realistic mobile network,
**Then** the page renders fully in under 2 seconds.

---

### Story 2.2: Digital Menu Browsing with Peak-Time Flags

As a guest at the table,
I want to browse the full menu organized by category with clear item details and peak-time friendly highlights,
So that I can quickly find dishes to order, especially during busy hours.

**Acceptance Criteria:**

**Given** the guest opens the menu from the table QR page,
**When** the menu loads,
**Then** all items are displayed grouped by category (e.g. Hotpot, BBQ, Sides, Drinks) with name, price, and optional description.

**Given** a menu item is flagged as "fast to prepare" or "peak-time friendly",
**When** it appears in the menu,
**Then** a visible badge (e.g. "⚡ Fast") is shown on the item card.

**Given** the current time falls within a configured peak window for the branch,
**When** the menu is displayed,
**Then** peak-time friendly items are visually emphasized (e.g. sorted to top of category or highlighted).

**Given** the guest types in the search field,
**When** at least 2 characters are entered,
**Then** the menu filters in real time to show only items whose name or description matches the query.

**Given** a menu item has no image,
**When** it is displayed,
**Then** a consistent placeholder is shown and the layout does not break.

---

### Story 2.3: Order Placement from the Table

As a guest at the table,
I want to add items to my order with optional per-item notes and submit the order to the kitchen and bar,
So that staff and kitchen receive my order without me needing to flag down a server.

**Acceptance Criteria:**

**Given** the guest taps an item in the menu,
**When** they add it to the cart,
**Then** the item appears in the order review with quantity defaulting to 1 and an optional notes field.

**Given** the guest has items in the cart,
**When** they tap "Submit order",
**Then** the order is sent to the backend, linked to the correct table, and a success confirmation is shown to the guest.

**Given** the order is submitted,
**When** it is received by the backend,
**Then** it appears in the staff order console and kitchen/bar queue with status `new` and the table identifier.

**Given** the guest submits an order with a per-item note (e.g. "less spicy"),
**When** the order appears in the kitchen queue,
**Then** the note is displayed alongside the item.

**Given** the guest attempts to submit an empty cart,
**When** they tap "Submit order",
**Then** the button is disabled or an inline message prevents submission.

**Given** the network is temporarily unavailable when the guest submits,
**When** the request fails,
**Then** a clear error message is shown and the cart contents are preserved so the guest can retry.

---

### Story 2.4: Real-Time Bill View

As a guest at the table,
I want to see my current bill at any time with items grouped by type and a live-updating total,
So that I can track spending throughout the meal and avoid surprises at checkout.

**Acceptance Criteria:**

**Given** the guest navigates to the bill view,
**When** the page loads,
**Then** all ordered items are displayed grouped by type (Food, Drinks, Extras) with individual prices and a running subtotal.

**Given** the bill includes configurable fees or taxes (e.g. service charge),
**When** the bill is displayed,
**Then** each fee is shown as a labeled line item and included in the total.

**Given** a staff member adds or removes an item from the table's order,
**When** the guest's bill view is open,
**Then** the bill updates automatically within 5 seconds without requiring a page refresh.

**Given** no items have been ordered yet,
**When** the guest opens the bill view,
**Then** an empty state message is shown: "No items ordered yet."

**Given** the bill view is open on a mobile device,
**When** the total updates,
**Then** the update is visually indicated (e.g. brief highlight on the total row) so the guest notices the change.

---

### Story 2.5: Slot Time Remaining & End-of-Slot Reminders

As a guest at the table with a time-limited booking slot,
I want to see how much time remains in my slot and receive a gentle reminder when it is nearly over,
So that I can plan my ordering and prepare for checkout without being caught off guard.

**Acceptance Criteria:**

**Given** the table is linked to a booking with a defined slot end time,
**When** the guest views the menu or bill page,
**Then** a time-remaining indicator is visible showing minutes remaining in the current slot.

**Given** 20 minutes remain in the slot,
**When** the guest's table page is open,
**Then** a soft banner appears: "Your table time is ending in about 20 minutes – time to order dessert or prepare for checkout."

**Given** 5 minutes remain in the slot,
**When** the guest's table page is open,
**Then** the banner becomes more prominent with a stronger prompt to prepare for checkout.

**Given** the table is not linked to a time-limited booking (e.g. walk-in with no slot),
**When** the guest views any table page,
**Then** no time-remaining indicator or end-of-slot banner is shown.

**Given** the slot end time passes,
**When** the guest's table page is still open,
**Then** the banner updates to "Your reserved time has ended. Please see staff to close your bill."

---

## Epic 3: In-Store Operations – Table Map, Host & Kitchen/Bar

Front-of-house staff see a live table map with color-coded states and a prioritized cleaning queue, while the host console tracks the booking timeline and walk-in flow. Kitchen and bar teams work from a clear, station-grouped order queue with status tracking and optional ticket printing.

### Story 3.1: Live Table Map with State Management

As a front-of-house staff member,
I want to see a live visual map of all tables grouped by area with their current state color-coded,
So that I can instantly understand the floor situation and coordinate seating without verbal check-ins.

**Acceptance Criteria:**

**Given** the staff member opens the FOH dashboard,
**When** the table map loads,
**Then** all tables are displayed grouped by their configured area (e.g. Zone A, Zone B) with a color-coded state: green for Free, blue for Reserved, orange for Occupied, red for Needs Cleaning.

**Given** a table's state changes (e.g. a booking is checked in or a bill is closed),
**When** the change is processed by the backend,
**Then** the table map updates to reflect the new state within 5 seconds without requiring a page refresh.

**Given** the staff member taps or clicks a table on the map,
**When** the table is in any state,
**Then** a side panel opens showing: table ID, current state, party size (if occupied), booking details (if reserved or occupied), elapsed time since seating, and any notes.

**Given** the branch has multiple areas configured,
**When** the map is displayed,
**Then** each area is visually separated with a label and tables within it are laid out in a readable grid.

**Given** the staff member is on a tablet or desktop browser,
**When** the table map renders,
**Then** all tables and their state labels are legible without horizontal scrolling.

---

### Story 3.2: Host Dashboard – Booking Timeline & Walk-in Queue

As a host,
I want a consolidated dashboard showing today's booking timeline, walk-in queue, and tables nearing their slot end,
So that I can proactively manage seating flow and avoid bottlenecks during peak hours.

**Acceptance Criteria:**

**Given** the host opens the Today Overview panel,
**When** it loads,
**Then** upcoming bookings are displayed in a timeline-style list ordered by slot start time, each showing: guest name or booking code, party size, status (Confirmed / Soft Hold / At Risk / Checked In), and time until slot.

**Given** the host applies a filter for the current peak window,
**When** the filter is active,
**Then** only bookings within that time range are shown and the count updates accordingly.

**Given** a booking transitions to "at risk" (past grace window and not yet checked in),
**When** the dashboard is open,
**Then** the booking row is highlighted in red and a "Release slot" action is surfaced inline.

**Given** a walk-in guest is registered by the host (name and party size),
**When** the walk-in is saved,
**Then** it appears in a separate walk-in queue section with a timestamp and the host can assign a free table to it.

**Given** a table is within 20 minutes of its slot end time,
**When** the dashboard is open,
**Then** it appears in an "Ending soon" section with the table ID, guest count, and minutes remaining.

---

### Story 3.3: Cleaning Queue with Priority Sorting

As a front-of-house staff member,
I want to see a prioritized list of tables that need cleaning with the most urgent ones at the top,
So that I can direct cleaning staff efficiently and free up capacity faster during peak hours.

**Acceptance Criteria:**

**Given** one or more tables are in the `needs_cleaning` state,
**When** the cleaning queue is viewed,
**Then** all such tables are listed with their table ID, area, size (number of seats), and time since they entered the cleaning state.

**Given** there are guests waiting (walk-in queue or at-risk bookings) for tables of a specific size,
**When** the cleaning queue is displayed,
**Then** tables matching the needed size are sorted to the top with a "Guests waiting" badge.

**Given** multiple tables need cleaning with no waiting guests,
**When** the queue is displayed,
**Then** tables are sorted by time in `needs_cleaning` state (oldest first) as the default priority.

**Given** a staff member marks a table as "Cleaned",
**When** the action is confirmed,
**Then** the table is removed from the cleaning queue and its state changes to `free` on the table map immediately.

**Given** the cleaning queue is empty,
**When** it is viewed,
**Then** an empty state message is shown: "All tables are clean."

---

### Story 3.4: Staff Order Console

As a staff member,
I want to view all active orders per table, confirm or adjust QR-submitted orders, and add manual orders for guests who did not use QR,
So that every table's order is accurate and nothing falls through the cracks during a busy service.

**Acceptance Criteria:**

**Given** the staff member opens the order console,
**When** it loads,
**Then** all tables with active orders are listed, each showing table ID, number of items pending confirmation, and time of last order activity.

**Given** a guest submits an order via QR,
**When** it appears in the staff console,
**Then** it is marked with a "New – awaiting confirmation" badge and the staff member can confirm or reject individual items.

**Given** the staff member confirms a QR order,
**When** confirmation is submitted,
**Then** the order status updates to `confirmed` and it is forwarded to the kitchen/bar queue.

**Given** the staff member needs to add a manual order for a table (e.g. guest without QR),
**When** they open the table's order panel and add items,
**Then** the items are added to the table's order with source tagged as `staff` and forwarded directly to the kitchen/bar queue.

**Given** the staff member removes an item from an active order,
**When** the removal is saved,
**Then** the item is removed from the kitchen queue (if not yet in progress) and an audit log entry is created recording who removed it and when.

---

### Story 3.5: Kitchen & Bar Order Queue Screens

As a kitchen or bar team member,
I want to see incoming orders grouped by preparation station with clear status indicators and the ability to mark items as in progress or ready,
So that I can work through the queue efficiently and ensure dishes reach guests in the right order.

**Acceptance Criteria:**

**Given** the kitchen/bar team member opens the queue screen,
**When** it loads,
**Then** all pending orders are displayed grouped by preparation station (e.g. Hotpot, Grill, Bar) with columns for: time received, table ID, item name, quantity, notes, and status.

**Given** a new order is submitted by a guest or staff member,
**When** it is confirmed,
**Then** it appears in the relevant station's queue within 5 seconds with status `new`, highlighted to draw attention.

**Given** a team member taps "In Progress" on an item,
**When** the action is saved,
**Then** the item's status updates to `in_progress` and the highlight is removed.

**Given** a team member taps "Ready" on an item,
**When** the action is saved,
**Then** the item's status updates to `ready` and it moves to a "Ready" section visible to FOH staff for delivery.

**Given** the team member applies a filter for "Fast items only",
**When** the filter is active,
**Then** only items flagged as "fast to prepare" are shown in the queue.

**Given** the branch has a printer configured,
**When** an order is confirmed,
**Then** a kitchen/bar ticket is automatically printed with: table ID, item list, notes, and timestamp.

---

## Epic 4: Billing, Adjustments & Post-Meal Feedback

Authorized staff can adjust bills (add/remove items, apply discounts) with a full audit trail, close the bill to free the table for turnover, and give guests a brief optional feedback prompt after checkout.

### Story 4.1: Bill Adjustment by Staff

As an authorized staff member,
I want to add or remove items and adjust quantities on a table's active bill,
So that the bill accurately reflects what the guests consumed before checkout.

**Acceptance Criteria:**

**Given** the staff member opens the bill control panel for an occupied table,
**When** it loads,
**Then** all ordered items are displayed with their quantities, unit prices, and a running total.

**Given** the staff member adds an item to the bill,
**When** the change is saved,
**Then** the item appears in the bill with the correct price, the total updates immediately, and an audit log entry is created recording the staff member's ID, timestamp, and the item added.

**Given** the staff member removes an item from the bill,
**When** the removal is confirmed,
**Then** the item is removed, the total updates, and an audit log entry is created with the same fields.

**Given** the staff member changes the quantity of an existing item,
**When** the change is saved,
**Then** the quantity and line total update correctly, the overall total recalculates, and the change is recorded in the audit log.

**Given** a staff member with the `kitchen` role attempts to access the bill control panel,
**When** they navigate to it,
**Then** they are denied access with a clear "Insufficient permissions" message.

---

### Story 4.2: Discount Application with Audit Trail

As an authorized staff member,
I want to apply a percentage or fixed-amount discount to a table's bill,
So that I can handle complimentary items, service recovery, or approved promotions accurately and traceably.

**Acceptance Criteria:**

**Given** the staff member opens the bill control panel,
**When** they select "Apply discount",
**Then** they can choose between percentage (%) or fixed amount (VND) and enter the value.

**Given** the staff member applies a percentage discount,
**When** it is saved,
**Then** the discount is shown as a labeled line item (e.g. "Discount 10%"), the total is recalculated correctly, and the audit log records: staff ID, timestamp, discount type, and value.

**Given** the staff member applies a fixed-amount discount,
**When** it is saved,
**Then** the discount is shown as a labeled line item (e.g. "Discount –50,000 VND"), the total is recalculated, and the change is logged.

**Given** the discount value entered would result in a negative total,
**When** the staff member attempts to save,
**Then** an inline validation error is shown: "Discount cannot exceed the bill total."

**Given** a discount has been applied,
**When** another staff member views the bill,
**Then** the discount line and the audit log entry are both visible to any staff with bill access.

---

### Story 4.3: Bill Closing & Table Turnover

As a staff member,
I want to close a table's bill after payment and transition the table to the correct post-service state,
So that the table becomes available for the next guests as quickly as possible.

**Acceptance Criteria:**

**Given** the staff member opens the bill control panel for an occupied table,
**When** they tap "Close bill",
**Then** a confirmation prompt appears showing the final total and asking them to confirm closure.

**Given** the staff member confirms bill closure,
**When** the action is processed,
**Then** the bill is marked as `closed` with a timestamp, and the staff member is prompted to choose the next table state: "Needs cleaning" or "Free".

**Given** the staff member selects "Needs cleaning",
**When** the choice is saved,
**Then** the table state changes to `needs_cleaning`, it appears in the cleaning queue, and the bill is no longer editable.

**Given** the staff member selects "Free" (e.g. table was already cleaned),
**When** the choice is saved,
**Then** the table state changes to `free` on the map immediately and the bill is locked.

**Given** a bill is already closed,
**When** any staff member attempts to modify it,
**Then** all edit controls are disabled and a message reads: "This bill has been closed and cannot be modified."

---

### Story 4.4: Post-Meal Feedback Survey

As a guest,
I want to optionally answer a short feedback survey after my bill is closed,
So that I can share my experience with the restaurant without friction.

**Acceptance Criteria:**

**Given** the bill for a table has been closed,
**When** the guest opens the table QR page within a configurable window (e.g. 30 minutes after closure),
**Then** a feedback prompt is shown with 1–2 rating questions (e.g. "How was your wait time?" and "How was the service?") using a simple star or emoji scale.

**Given** the guest answers the rating questions,
**When** they optionally add a free-text comment and tap "Submit",
**Then** the feedback is saved linked to the bill and branch, and a thank-you message is shown.

**Given** the guest taps "Skip" or closes the prompt,
**When** no answers are submitted,
**Then** no feedback record is created and the guest is not prompted again for the same bill.

**Given** the feedback window has expired (e.g. more than 30 minutes after bill closure),
**When** the guest opens the table QR page,
**Then** the feedback prompt is no longer shown and the page shows a generic "Thank you for visiting" message.

**Given** feedback is submitted,
**When** a manager views the branch analytics,
**Then** the feedback responses are accessible as part of the branch's data (visible in a future analytics story).

---

## Epic 5: Branch Configuration & Chain-Level Analytics

Owners and managers configure each branch (tables, zones, opening hours, peak windows) and access chain-level dashboards covering daily revenue, booking vs walk-in split, no-show rates, occupancy heatmaps, and soft flags for repeat no-shows.

### Story 5.1: Staff Authentication & Role Management

As a manager or owner,
I want to create and manage staff accounts with assigned roles and branch access,
So that each team member can log in with the correct permissions for their job.

**Acceptance Criteria:**

**Given** the manager opens the staff management panel,
**When** they create a new staff account with email, password, role (staff/kitchen/manager), and branch assignment,
**Then** the account is created and the staff member can log in with those credentials.

**Given** a staff member logs in with valid email and password,
**When** authentication succeeds,
**Then** they receive a JWT access token and are redirected to the dashboard appropriate for their role.

**Given** a staff member enters an incorrect password,
**When** they attempt to log in,
**Then** an error message is shown: "Invalid email or password." and no token is issued.

**Given** a manager deactivates a staff account,
**When** the deactivation is saved,
**Then** any existing sessions for that account are invalidated and the staff member cannot log in again until reactivated.

**Given** a staff member's access token expires,
**When** they make an authenticated API request,
**Then** the system uses the refresh token to issue a new access token transparently, or redirects to login if the refresh token is also expired.

---

### Story 5.2: Branch & Table Configuration

As a manager or owner,
I want to configure each branch's tables, zones, opening hours, and peak-time windows,
So that the booking system and operational tools reflect the real layout and schedule of each location.

**Acceptance Criteria:**

**Given** the manager opens the branch configuration panel,
**When** they create a new branch with name, address, and opening hours,
**Then** the branch is saved and appears in the branch selector on the booking page.

**Given** the manager adds tables to a branch,
**When** each table is saved with a table ID, seating capacity, and zone assignment,
**Then** the table appears on the table map for that branch with the correct zone grouping.

**Given** the manager configures opening hours for a branch,
**When** a guest attempts to book outside those hours,
**Then** no time slots are shown for that period and a message reads: "No availability outside opening hours."

**Given** the manager defines a peak-time window (e.g. 18:00–21:00 on weekdays),
**When** the system is within that window,
**Then** peak-time friendly menu flags are activated and the host dashboard highlights the peak indicator.

**Given** the manager edits an existing table's capacity or zone,
**When** the change is saved,
**Then** the table map and booking availability calculations reflect the updated values immediately.

---

### Story 5.3: Basic Reporting Dashboard

As a manager or owner,
I want to view a daily summary of revenue, bookings, walk-ins, and no-show rates per branch,
So that I can track operational performance and identify patterns without needing a separate reporting tool.

**Acceptance Criteria:**

**Given** the manager opens the analytics dashboard,
**When** it loads for the current date,
**Then** it displays for each branch: total revenue (sum of closed bills), count of online bookings, count of walk-ins, and no-show rate (no-shows / total bookings × 100%).

**Given** the manager selects a specific date range,
**When** the filter is applied,
**Then** all metrics update to reflect only data within that range.

**Given** a branch had zero bookings on a given day,
**When** it appears in the dashboard,
**Then** all metrics show zero with no errors or blank cells.

**Given** the manager views the booking vs walk-in split,
**When** the data is displayed,
**Then** it is shown as both absolute counts and as a percentage breakdown (e.g. "70% bookings / 30% walk-ins").

**Given** the manager is assigned to a single branch,
**When** they view the dashboard,
**Then** they can only see data for their assigned branch and not other branches.

---

### Story 5.4: Occupancy Heatmap

As a manager or owner,
I want to view an occupancy heatmap showing table utilization by hour and day of the week,
So that I can make informed decisions about table layout, staffing levels, and peak-time capacity.

**Acceptance Criteria:**

**Given** the manager opens the heatmap view,
**When** it loads,
**Then** a grid is displayed with days of the week on one axis and hours of the day on the other, with each cell color-coded by average occupancy percentage (light = low, dark = high).

**Given** the manager selects a specific branch and date range,
**When** the filter is applied,
**Then** the heatmap recalculates and re-renders based on the filtered data.

**Given** the manager toggles the "By table size" filter (e.g. 2-seat, 4-seat, 6-seat),
**When** a size is selected,
**Then** the heatmap shows occupancy only for tables of that size.

**Given** the manager hovers over or taps a heatmap cell,
**When** the tooltip appears,
**Then** it shows the exact average occupancy percentage and the number of sessions recorded for that hour/day combination.

**Given** there is insufficient data for a cell (e.g. fewer than 3 sessions),
**When** the heatmap renders,
**Then** the cell is shown with a "low data" pattern and a tooltip note: "Not enough data for this period."

---

### Story 5.5: No-Show Soft Flags & Repeat Tracking

As a manager or host,
I want to see soft flags on bookings from guests with a history of repeated no-shows or very late arrivals,
So that I can make informed decisions about whether to require deposits or apply stricter confirmation policies for those guests.

**Acceptance Criteria:**

**Given** a booking identity (phone number or email) has accumulated 2 or more no-show or very-late-arrival events,
**When** that identity makes a new booking,
**Then** the booking is created normally but flagged internally with a "Repeat no-show" soft flag.

**Given** a booking has a "Repeat no-show" soft flag,
**When** it appears on the host dashboard or check-in panel,
**Then** a discreet internal badge (visible only to staff) is shown with the count of previous no-shows.

**Given** the manager views the no-show report section,
**When** it loads,
**Then** a list of flagged booking identities is shown with: identifier (masked for privacy), branch, number of no-shows, and dates of incidents.

**Given** a flagged guest arrives and checks in successfully,
**When** the check-in is completed,
**Then** the soft flag remains on their history but the current booking is marked as attended and not counted as a no-show.

**Given** a manager manually clears a soft flag for a booking identity,
**When** the action is saved,
**Then** the flag is removed and an audit log entry records the manager's ID, timestamp, and reason (optional free-text field).

