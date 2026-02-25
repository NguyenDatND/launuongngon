stepsCompleted: [1]
inputDocuments:
  - _bmad-output/brainstorming/brainstorming-session-2026-02-25.md
date: 2026-02-25
author: Teavillageboy
---
 
# Product Brief: LauNuongNgon

## 1. Overview

LauNuongNgon is a medium-size multi-branch hotpot & BBQ restaurant chain.  
This project delivers a **Phase 1 MVP** focusing on **running real operations inside the restaurants during peak hours**, not on long-term loyalty or complex integrations.

The core idea:  
> Make peak-hour service predictable and less chaotic for guests, staff, and managers,  
> by unifying **online booking**, **QR-based in-store ordering**, and **lightweight operational dashboards**.

## 2. Problem Statement

During peak hours (evenings, weekends), medium-size hotpot/BBQ branches often face:

- Unpredictable and over-booked time slots.
- Confusion at the front desk: who booked, who is walk-in, who is late.
- Tables turning slowly because “needs cleaning” states are not visible/prioritized.
- Guests waiting too long to:
  - Get a table.
  - Order additional dishes.
  - Receive the bill.
- Managers and owners lacking clear data about:
  - When and where capacity is over/under-utilized.
  - No-show patterns.
  - Peak-hour performance across branches.

Existing tools (phone, social media messages, manual spreadsheets, generic POS) are either:

- Too manual and error-prone during rush hours, or  
- Too heavy/complex for a focused MVP.

## 3. Target Users

- **Guests (Customers)**  
  - Groups of 2–8 people, often coming during peak times.  
  - Want to know they **actually have a table** and do not need to argue or wait endlessly.
  - Prefer low-friction experiences: scan, order, eat, pay, leave.

- **Front-of-House Staff (Host, Servers, Cashiers)**  
  - Handle check-in, table assignment, order adjustments, payment.  
  - Need one shared “truth” about which tables are free/reserved/occupied/need cleaning.

- **Kitchen/Bar Teams**  
  - Prepare food and drinks in the right order and speed.  
  - Need a clear queue of items, especially during peak load.

- **Branch Managers & Chain Owners**  
  - Oversee capacity, staffing, and financial performance.  
  - Need actionable metrics, not raw data dumps.

## 4. Vision & Objectives (Phase 1)

**Vision**:  
Create a focused, pragmatic system that lets LauNuongNgon run smooth, data-informed operations in busy branches, while keeping the guest experience simple and delightful.

**Phase 1 Objectives**:

- Enable **reliable table booking** for peak-hour slots across branches.
- Shorten and simplify **check-in** when guests arrive.
- Move in-store ordering to **QR-based flows** per table, without mandatory login.
- Give staff **a real-time picture** of tables, bookings, and cleaning priorities.
- Provide managers with **basic dashboards** to see:
  - Daily revenue per branch.
  - Bookings vs walk-ins.
  - No-show and late-arrival patterns.
  - Peak-time heatmaps and table-type utilization.

Out of scope for Phase 1 (explicitly):

- Full loyalty and points systems.
- Complex voucher/discount engines.
- Deep POS/accounting integrations.
- Native mobile apps; Phase 1 is web-first and mobile-friendly.

## 5. Key Product Pillars

1. **Booking & Peak-Hour Reliability**
   - Time-slot based bookings with clear capacity per branch.
   - Soft holds with confirmation deadlines to reduce no-shows.
   - Booking codes/QR for fast, unambiguous check-in on arrival.

2. **QR-Based In-Store Experience**
   - Table-specific QR codes mapping guests directly to “their table”.
   - Digital menu with peak-hour-friendly item tagging.
   - Ordering and bill-view flows tailored for small groups using smartphones.

3. **Operational Control for Staff**
   - Live table map with clear states (Free, Reserved, Occupied, Needs Cleaning).
   - Host dashboard for seeing upcoming bookings, check-ins, and cleaning priorities.
   - Staff and kitchen views that reduce verbal back-and-forth and sticky notes.

4. **Actionable Insights for Management**
   - Simple but meaningful KPIs: revenue, booking mix, no-shows, utilization.
   - Heatmaps that directly inform layout and staffing decisions.

## 6. Core Scenarios (Happy Paths)

1. **Guest books a peak-hour slot online** at a chosen branch, receives a confirmation with a QR code, and arrives to find their booking recognized within a clear grace window.
2. **Guest walks into a busy branch**; host sees current bookings, walk-ins, and table states, and can make fast, informed seating decisions.
3. **At the table**, guests scan the QR, browse a digital menu, place additional orders, and see their bill update in real time.
4. **Staff manages multiple busy tables** using a shared view of table states, pending orders, and which tables urgently need cleaning.
5. **Managers review daily dashboards** to understand which time slots and table types are under pressure and where no-show/cancellation policies need tuning.

## 7. Success Criteria (Phase 1)

- Measurably reduced:
  - Average time from guest arrival to being seated (for those with bookings).
  - Average time from “ready to pay” to table freed for next group.
- Staff subjectively report:
  - Less confusion about which tables are reserved/available.
  - Less manual tracking via paper/whiteboards for peak-hour operations.
- Managers can:
  - Identify top peak periods and adjust staffing accordingly.
  - See at-a-glance how many bookings become no-shows or very late arrivals.

## 8. Future Directions (Beyond Phase 1)

Not for immediate implementation, but naturally enabled by this foundation:

- Loyalty and membership programs tied to booking and visit history.
- More sophisticated promotion and voucher systems.
- Deeper integration with existing POS and accounting systems.
- Automated waitlist and dynamic pricing for highly demanded time slots.
