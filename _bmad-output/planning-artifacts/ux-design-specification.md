stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-LauNuongNgon-2026-02-25.md
  - _bmad-output/planning-artifacts/prd.md
---

# UX Design Specification LauNuongNgon

**Author:** Teavillageboy  
**Date:** 2026-02-25

---

## Executive Summary

### Project Vision

A Phase 1 MVP for LauNuongNgon, a multi-branch hotpot & BBQ chain, focused on making peak-hour in-store operations predictable and less chaotic. The product unifies online time-slot table booking, QR-based in-store ordering, and lightweight operational dashboards for staff and managers.

### Target Users

- Guests: small groups (2–8) visiting during peak times, who want reliable bookings, fast check-in, low-friction QR ordering, and real-time bill visibility.
- Front-of-house staff (hosts, servers, cashiers): overloaded during rush hours, need a single, clear view of table states and bookings to seat and turn tables efficiently.
- Kitchen/bar teams: need a clear, prioritized queue of dishes and drinks, with awareness of “fast” items for peak times.
- Branch managers and chain owners: need actionable metrics (revenue, bookings vs walk-ins, no-shows, utilization heatmaps) to adjust layouts and staffing.

### Key Design Challenges

- Designing booking and check-in flows that make time-slot capacity and grace windows obvious, so guests trust the system and hosts can manage late/no-show behavior.
- Creating an ultra-simple mobile QR menu and ordering experience that always binds to the correct table without requiring login.
- Building host/staff UIs that remain readable and operable under peak-hour stress, using strong visual hierarchy, states, and grouping.
- Balancing dashboard depth with simplicity so managers see the right signals without being overwhelmed.

### Design Opportunities

- A live table map with clear states (free, reserved, occupied, needs cleaning) to reduce verbal coordination and guesswork.
- Real-time bill and slot-time reminders at the table to nudge guests and reduce friction at checkout and table turnover.
- Simple but focused analytics (heatmaps, no-show patterns, table-type usage) that directly inform deposit policies, table layouts, and staffing decisions.

---

## Core UX Areas and Screen Groups

### 1. Guest – Booking & Check-in

- **Booking Home (Web/Mobile)**  
  - Inputs: branch, date, time slot, party size, notes.  
  - Shows remaining capacity per slot and highlights near-full slots.  
  - Primary action: “Confirm booking”. Secondary (optional): “Soft hold with confirmation deadline”.

- **Booking Summary / Success**  
  - Displays booking code, QR, time, branch, party size, notes.  
  - Actions: “Add to calendar”, “View/manage booking”.

- **Booking Status / Manage**  
  - Lists upcoming bookings with status (Confirmed / Soft hold / At risk).  
  - Actions: confirm now, cancel, view QR.

- **Check-in at Venue**  
  - Entry via scanning QR or entering booking code at host/kiosk.  
  - Shows whether the guest is on time, late (within grace), or at risk.  
  - Guides guest: “Please see host” or confirms check-in and table assignment.

### 2. Guest – QR Table Experience

- **Welcome to Table**  
  - After scanning table QR: shows table identifier and branch, no login.  
  - Primary action: “View menu”; secondary: “View current bill”.

- **Menu (Mobile Web)**  
  - Categories (e.g., Hotpot, BBQ, Sides, Drinks) with simple search.  
  - Item cards with name, price, optional image, short description.  
  - Badges such as “Fast to prepare” or “Peak-time friendly”.

- **Order Review / Cart**  
  - Lists selected items with notes and quantities.  
  - Shows estimated subtotal and simple grouping.  
  - Primary action: “Submit order”; secondary: “Continue browsing”.

- **Bill View**  
  - Groups items by type (food, drinks, extras, fees/taxes).  
  - Updates automatically when orders change.  
  - Banner for remaining slot time and soft prompts to prepare for checkout.

### 3. Host / Front-of-House Console

- **Today Overview**  
  - Timeline-style view of bookings by time, with status coloring.  
  - Quick filters for branch and time window (current, peak).

- **Table Map**  
  - Visual layout of tables by area, each with a color-coded state:  
    - Free, Reserved, Occupied, Needs cleaning.  
  - Selecting a table opens a side panel with booking details, elapsed/remaining time, and notes.

- **Check-in Panel**  
  - Field or scanner input for booking code/QR.  
  - Validates branch, time window, and party size.  
  - Suggests a table to assign and handles late/at-risk bookings with clear options.

- **Cleaning Queue**  
  - List of tables marked “Needs cleaning”, sorted by priority.  
  - Priority based on waiting guests, table size/demand, and simple rules.  
  - Staff confirm “Cleaned” to move tables back to Free.

### 4. Staff – Table & Order Management

- **My Tables / Section View**  
  - Shows tables assigned to a staff member and nearby tables, with quick status chips.  
  - Highlights tables with new QR orders awaiting confirmation.

- **Table Detail**  
  - Displays core context: party size, start time, slot, special notes.  
  - Orders tab combines QR-submitted items and staff-entered items.  
  - Actions to adjust orders with lightweight change logging.

- **Bill Control**  
  - Detailed bill breakdown for staff.  
  - Simple controls for discounts (percentage or fixed amount) and complimentary items.  
  - Primary action: “Close bill” to transition table to “Needs cleaning”.

### 5. Kitchen / Bar Screens

- **Order Queue**  
  - Columns: time, table, item, notes, “fast” tags.  
  - Grouping by preparation station (hotpot, grill, bar) where relevant.  
  - Actions: mark items as “In progress” and “Ready”.

- **Filtering & Prioritization**  
  - Filters by station, “fast” items, table, or ticket age.  
  - Default sort is oldest-first, with highlighting for orders approaching a soft SLA.

### 6. Manager Dashboard

- **Branch Overview**  
  - High-level cards: daily revenue, number of bookings, no-show rate, booking vs walk-in split.  
  - Branch list with key KPIs per branch.

- **Utilization Heatmap**  
  - Visualizes occupancy by hour and day-of-week.  
  - Optional toggle by table size (2/4/6 seats).

- **Configuration Entry Points**  
  - Entry to branch-level settings for table counts, simple layout metadata, opening hours, and peak-time definitions.

