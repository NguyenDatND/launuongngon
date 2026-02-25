stepsCompleted:

- step-01-init
  inputDocuments:
- \_bmad-output/planning-artifacts/product-brief-LauNuongNgon-2026-02-25.md
- \_bmad-output/brainstorming/brainstorming-session-2026-02-25.md
  workflowType: 'prd'
  briefCount: 1
  researchCount: 0
  brainstormingCount: 1
  projectDocsCount: 0
  date: 2026-02-25
  author: Teavillageboy

---

# Product Requirements Document - LauNuongNgon

**Author:** Teavillageboy  
**Date:** 2026-02-25

---

## 1. Product Overview

LauNuongNgon is a multi-branch hotpot & BBQ restaurant chain.  
This product is a Phase 1 MVP system to support real, in-store operations during peak hours with a focus on:

- Online table booking across branches.
- QR-based in-store ordering and real-time bill visibility.
- Operational tools for staff (hosts, servers, kitchen/bar).
- Lightweight analytics for branch managers and chain owners.

Phase 1 deliberately avoids heavy loyalty, complex promotions, deep POS/accounting integrations, and native mobile apps; those will be considered in later phases.

**Differentiation:** Instead of being a full POS or generic booking tool, this Phase 1 focuses narrowly on peak-hour, multi-branch operations by unifying time-slot booking, table-bound QR ordering, and lightweight, action-oriented dashboards for staff and managers.

## 2. Goals and Non-Goals

### 2.1 Goals (Phase 1)

- Ensure the system can be used **in production during peak hours** at medium-size branches.
- Reduce chaos at the front desk and in the dining area when the restaurant is full.
- Improve guest experience for:
  - Booking in advance for busy time slots.
  - Checking in quickly when arriving.
  - Ordering via QR at the table and tracking the approximate bill in real time.
- Give staff and managers **clear visibility** into table states, queues, and no-show behavior.
- Provide enough analytics for owners to make data-driven decisions about capacity and staffing.

### 2.2 Non-Goals (Explicitly Out of Scope for Phase 1)

- Loyalty/points systems and complex voucher logic.
- Online waiting list/queue for walk-in customers beyond basic host tools.
- Smart recommendation systems (e.g., “AI dish suggestions”).
- Deep POS/accounting integrations.
- Native mobile apps (iOS/Android) – Phase 1 can be web-first, mobile-friendly.

---

## 3. Product Scope (Phase 1 MVP)

### 3.1 In Scope (Phase 1)

- Online table booking by branch, date, time slot, and party size, with basic availability display.
- QR-based in-store experience for viewing menu, placing orders, and tracking the bill in real time.
- Core in-store operations tooling:
  - Table map and state management.
  - Host/FOH dashboard and walk-in handling.
  - Staff order console for adjusting and adding orders.
  - Kitchen/bar screens (or printouts) for preparation workflow.
- Lightweight chain management and analytics:
  - Multi-branch configuration (tables, zones, opening hours, peak windows).
  - Basic reports and heatmaps around occupancy, bookings vs walk-ins, and no-shows.
- Web-first, mobile-friendly UI for both guests and staff terminals.

### 3.2 Explicitly Out of Scope for Phase 1

The following are deferred to later phases even if partially mentioned elsewhere:

- Loyalty/points, vouchers, and complex promotion engines.
- Advanced online waiting-list product for walk-ins beyond simple host tools.
- Recommendation/“smart suggestion” features based on order history or patterns.
- Deep POS/accounting integrations and end-to-end financial reporting.
- Native iOS/Android apps; only responsive web is supported in Phase 1.

---

## 4. Personas

### 4.1 Customer (Guest)

Profile:

- Groups of 2–8 people going for hotpot/BBQ, often during peak hours (evenings, weekends).
- Frequently unsure about exact arrival time but expects a table within a reasonable window.

Key needs:

- Know whether a branch has available slots at the desired time.
- Book a table online and trust it will be honored.
- Check in quickly upon arrival without repeating information many times.
- Order more items easily during the meal without waiting for staff.
- See an estimate of the bill while eating to avoid surprises at the end.

### 4.2 Staff (Host, Server, Cashier, Busser)

Profile:

- Front-of-house team handling check-in, table assignment, order adjustments, and checkout.
- Often overloaded during peak hours, juggling walk-ins, bookings, and dirty tables.

Key needs:

- Clear, real-time view of table states (free, reserved, in use, needs cleaning).
- Fast check-in workflow for online bookings.
- Simple tools to adjust orders and bills without losing track of what happened.
- Prioritized list of tables needing cleaning to free capacity faster.

### 4.3 Kitchen/Bar Staff

Profile:

- Team receiving and preparing food and drink orders.

Key needs:

- Clear, consolidated view of pending orders by time and table.
- Ability to distinguish urgent, “fast” dishes (for peak hours) from normal dishes.

### 4.4 Branch Manager / Chain Owner

Profile:

- Manages one branch or the whole chain; cares about revenue, capacity usage, and service quality.

Key needs:

- Understand peak-hour load and table turnover.
- See bookings vs walk-ins and no-show rates.
- Make informed decisions about table layouts and staffing by analyzing data (heatmaps, simple KPIs).

---

## 4. Key Use Cases (Happy Paths)

1. Customer books a table for peak hours at a specific branch and receives confirmation with a booking code/QR.
2. Customer arrives on time, scans/checks in, and is seated with minimal waiting.
3. Walk-in customer is managed by host using the same table/state system alongside online bookings.
4. At the table, customer scans a QR, views the menu, orders dishes, and tracks the bill in real time.
5. Staff can see all active tables, their states, and incoming orders, and coordinate with kitchen/bar.
6. Kitchen/bar sees incoming orders, prepares dishes in priority order, and marks them as done.
7. Staff adjusts the bill (add/remove items, apply simple discounts) and closes it; the table becomes free/needs cleaning.
8. Manager reviews daily revenue, booking vs walk-in split, no-show rate, and peak-time utilization per branch.

---

## 5. Functional Requirements by Epic

### 5.1 Epic: Booking & Peak-Hour Check-in

**FR-1.1 Table Booking by Time Slot**

- Customers can choose:
  - Branch.
  - Date.
  - Time slot (e.g., 18:00–19:30, 19:30–21:00).
  - Party size.
  - Optional notes (e.g., birthday, baby chair, allergies).
- System shows availability per time slot (remaining capacity).

**FR-1.2 Soft Holds and Confirmation Deadline**

- Optionally allow “soft hold” bookings where customers must confirm before a deadline (e.g., by 17:00 for evening slots).
- If not confirmed, the hold auto-expires and capacity is released.

**FR-1.3 Booking Confirmation with Code/QR**

- After a successful booking, system generates:
  - Booking code.
  - QR code linking to booking details.
- Confirmation can be displayed on-screen and optionally sent via email/SMS (minimal template).

**FR-1.4 Check-in on Arrival**

- At the branch, host or kiosk can scan the booking QR/code.
- System validates:
  - Branch.
  - Time window (e.g., ±10 minutes).
  - Party size.
- Booking is marked as “checked-in” and associated to a specific table.

**FR-1.5 Punctuality and Late Arrival Handling**

- System highlights bookings:
  - On time.
  - Late but still within grace period.
  - Past the grace window (at risk of being released).
- Host UI clearly shows suggested actions (e.g., prioritize seating vs release slot).

### 5.2 Epic: QR In-Store Experience (Menu, Ordering, Bill)

**FR-2.1 Table-Specific QR Codes**

- Each table has a unique QR code.
- Scanning QR opens the menu page already bound to that table context; no login required.

**FR-2.2 Digital Menu with Peak-Hour Tags**

- Menu items include:
  - Name, category, description, image (optional), price.
  - Flags such as “fast to prepare” or “peak-hour friendly”.
- Front-end highlights recommended/fast items during peak times.

**FR-2.3 Ordering from the Table**

- Guests can:
  - Add items to the current table’s order.
  - Add notes per item (e.g., less spicy, no onion).
- Orders are sent to the staff/kitchen/bar queues.

**FR-2.4 Real-Time Bill View**

- Guests see:
  - List of ordered items grouped by type (food/drinks/others).
  - Current total including configurable fees/taxes.
- Bill updates automatically as new items are added or modified by staff.

**FR-2.5 Time-Remaining and Soft “End-of-Slot” Reminders**

- For time-limited slots, system can:
  - Show a banner when the table is nearing the end of its reserved time (e.g., 20 minutes left).
  - Surface gentle suggestions like ordering dessert or preparing for checkout.

### 5.3 Epic: In-Store Operations (Host, Staff, Kitchen/Bar)

**FR-3.1 Table Map and State Management**

- System maintains table states:
  - Free.
  - Reserved (future booking).
  - Occupied (seated).
  - Needs cleaning.
- Host/staff see a visual map or list grouped by areas (e.g., A/B/C).

**FR-3.2 Host Dashboard**

- Shows:
  - Upcoming bookings and their status (confirmed, soft hold, at risk).
  - Walk-in queue (optional).
  - Tables needing cleaning.
  - Tables nearing end of reserved time.

**FR-3.3 Cleaning Prioritization**

- When multiple tables are in “needs cleaning” state, system suggests a prioritized list based on:
  - Presence of waiting guests.
  - Table size and demand (e.g., 4-seat tables during peak).
  - Proximity or other simple rules.

**FR-3.4 Staff Order Console**

- Staff can:
  - View active orders per table.
  - Confirm or adjust orders submitted via QR.
  - Add manual orders (e.g., guests without QR).

**FR-3.5 Kitchen/Bar Screens**

- Kitchen/bar sees:
  - Ordered items grouped by preparation station and time.
  - Status (new, in progress, ready).
- Optionally print kitchen/bar tickets.

### 5.4 Epic: Billing, Discounts, and Feedback

**FR-4.1 Bill Adjustments**

- Authorized staff can:
  - Add/remove items.
  - Adjust quantities.
  - Apply simple discounts:
    - Percentage.
    - Fixed amount.
- Basic audit log for adjustments (who, when, what changed).

**FR-4.2 Bill Closing and Table Turnover**

- When payment is completed (handled by existing POS or cash), staff:
  - Marks the bill as closed.
  - Sets table state to “needs cleaning” or “free”.

**FR-4.3 Lightweight Post-Meal Feedback**

- After bill closing, guests can optionally answer a very short survey:
  - 1–2 rating questions (waiting time, service).
  - Optional free-text comment.

### 5.5 Epic: Chain Management & Analytics

**FR-5.1 Branch and Layout Configuration**

- Admin/owner can:
  - Create and edit branches.
  - Configure number of tables, table sizes, and basic zones.
  - Configure opening hours and peak time ranges.

**FR-5.2 Basic Reporting and Dashboards**

- At minimum, show:
  - Daily revenue per branch (as far as data is available).
  - Count of online bookings vs walk-ins.
  - No-show rate and late arrival patterns.

**FR-5.3 Peak Utilization Heatmaps**

- Visualize:
  - Occupancy by hour/day-of-week.
  - Usage of different table sizes.
- Help owners adjust layout and staffing.

**FR-5.4 No-Show Soft Flags**

- Track repeated no-shows or very late arrivals at the booking-identity level.
- Surface soft flags to staff (internal only) to support decisions such as requiring deposits for certain bookings.

---

## 6. Non-Functional Requirements (Phase 1)

- **Reliability:** System should handle typical peak load of a medium-size chain (exact numbers to be defined later) without noticeable slowdowns in critical flows (booking, check-in, ordering).
- **Usability:** Interfaces must be simple enough for:
  - Staff with limited technical training.
  - Guests who just scan a QR and want to order quickly.
- **Performance:**
  - QR menu and bill view load in under ~2 seconds on common mobile devices and networks.
- **Availability:**
  - Acceptable to have planned downtime off-peak; long-term target is high availability but Phase 1 can tolerate modest SLAs.

---

## 7. Open Questions and Risks

- Exact integration level with existing POS/cash systems (if any) in branches.
- Policy decisions for:
  - Deposit requirements.
  - No-show thresholds (how many times before stronger action).
- Data privacy and retention policies, especially around customer identifiers and booking history.
- Operational change management: how much training can each branch realistically do before rollout.
