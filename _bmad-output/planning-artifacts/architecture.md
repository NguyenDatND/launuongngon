---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-LauNuongNgon-2026-02-25.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/prd-validation-report.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: "architecture"
project_name: "LauNuongNgon"
user_name: "Teavillageboy"
date: "2026-02-25"
lastStep: 8
status: "complete"
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Hệ thống LauNuongNgon Phase 1 tập trung vào bốn cụm chức năng lớn:

- **Booking & Peak-Hour Check-in**
  - Đặt bàn theo chi nhánh, ngày, khung giờ và số người, kèm ghi chú.
  - Soft-hold slot với deadline xác nhận, auto release nếu không xác nhận.
  - Sinh mã/QR booking để check-in nhanh tại chi nhánh, xử lý đúng branch, khung giờ và size nhóm.
  - Phân loại trạng thái đúng giờ/trễ/trễ quá hạn với gợi ý hành động cho host.

- **QR In-Store Experience (Menu, Ordering, Bill)**
  - Mỗi bàn có QR riêng, scan là gắn context bàn ngay, không cần login.
  - Menu số có tag “fast to prepare/peak-time friendly” để tối ưu vận hành giờ cao điểm.
  - Khách đặt món từ bàn, thêm ghi chú, gửi vào hàng đợi staff/kitchen/bar.
  - Bill hiển thị realtime, tự cập nhật khi có món mới hoặc staff chỉnh sửa, kèm nhắc hết slot mềm.

- **In-Store Operations (Host, Staff, Kitchen/Bar)**
  - Bản đồ bàn với các trạng thái: Free, Reserved, Occupied, Needs Cleaning.
  - Host dashboard cho booking timeline, walk-in, bàn cần dọn, bàn sắp hết slot.
  - Cleaning queue được ưu tiên theo khách đang chờ, kích thước/demand bàn, quy tắc đơn giản.
  - Staff console để xem/orders theo bàn, confirm QR orders, thêm order thủ công.
  - Kitchen/bar screens hiển thị queue món theo station, trạng thái (new/in progress/ready), hỗ trợ in ticket.

- **Billing, Discounts, Feedback & Chain Analytics**
  - Staff điều chỉnh bill: thêm/bớt món, đổi số lượng, giảm giá đơn giản (%, số tiền), có log ai/bao giờ/thay đổi gì.
  - Đóng bill, chuyển bàn sang “needs cleaning” hoặc “free” để quay vòng.
  - Feedback sau bữa ăn với survey rất ngắn.
  - Quản lý chuỗi: cấu hình chi nhánh, số bàn, layout sơ bộ, giờ mở cửa, peak windows.
  - Dashboard & báo cáo cơ bản: doanh thu/ngày/chi nhánh, booking vs walk-in, no-show rate, heatmap occupancy và sử dụng loại bàn, soft-flag no-show lặp lại.

**Non-Functional Requirements:**
Các NFR có ảnh hưởng trực tiếp tới kiến trúc:

- **Reliability & Performance:**
  - Hệ thống phải chịu được tải giờ cao điểm của chuỗi tầm trung, đặc biệt ở flows booking, check-in, đặt món và cập nhật bill.
  - QR menu và bill view phải load trong khoảng ~2 giây trên thiết bị di động phổ biến và mạng thực tế.

- **Usability:**
  - Giao diện cho staff phải cực kỳ đơn giản, thao tác nhanh, ít bước, chịu được áp lực giờ cao điểm.
  - Giao diện cho khách chỉ cần scan QR là dùng được, không yêu cầu đăng nhập hay onboarding phức tạp.

- **Availability:**
  - Chấp nhận downtime có kế hoạch ngoài giờ peak trong Phase 1; về lâu dài sẽ hướng tới SLA cao hơn.

- **Open Questions & Risks (ảnh hưởng kiến trúc trong tương lai):**
  - Mức độ tích hợp với POS/cash hiện có ở các chi nhánh.
  - Chính sách đặt cọc và xử lý no-show/lateness (có thể kéo theo yêu cầu về payment và rule engine).
  - Chính sách bảo mật & retention dữ liệu booking/guest.
  - Khả năng training và thay đổi vận hành ở từng chi nhánh.

**Scale & Complexity:**
Dựa trên PRD và UX:

- Hệ thống bao gồm nhiều luồng cho 4 nhóm user (guest, FOH staff, kitchen/bar, manager/owner), với số lượng màn hình và trạng thái phong phú.
- Có nhu cầu cập nhật gần realtime cho trạng thái bàn, order, bill và slot-time, tuy không yêu cầu hard-realtime.
- Dữ liệu gồm bookings, tables, orders, bills, cấu hình chi nhánh và log sự kiện phục vụ analytics.

Từ đó, có thể đánh giá:

- Primary domain: **full-stack web** (backend API + web app responsive cho nhiều persona).
- Complexity level: **medium–high** cho một MVP thương mại nghiêm túc.
- Estimated architectural components (logic lớn, không phải service chi tiết):
  - Core backend domain (Bookings, Tables & Seating, Orders & Bills, Branch Config).
  - Module Realtime/notifications cho cập nhật trạng thái UI.
  - Guest-facing web app (booking + QR table experience).
  - Staff/Host console (FOH operations).
  - Kitchen/Bar screens.
  - Manager dashboard & analytics pipeline.

### Technical Constraints & Dependencies

Hiện tại các ràng buộc/điểm phụ thuộc trực tiếp từ tài liệu:

- **Phase 1 web-first, mobile-friendly**, chưa yêu cầu native app – cho phép tập trung vào một tech stack web thống nhất.
- **Tích hợp POS** chưa bắt buộc trong Phase 1, nhưng là hướng mở trong tương lai – kiến trúc nên chừa chỗ cho integration layer hoặc adapter.
- **Không xây loyalty, voucher engine phức tạp, recommendation, deep reporting** ở Phase 1 – kiến trúc có thể tối ưu cho các flows vận hành chính, tránh over-engineering sớm.
- Môi trường triển khai, chiến lược multi-tenant (nếu bán cho nhiều chuỗi khác), yêu cầu bảo mật/compliance chi tiết chưa được xác định, cần được thiết kế sao cho có thể mở rộng sau này mà không phá vỡ domain model.

### Cross-Cutting Concerns Identified

Một số concern xuyên suốt nhiều module, sẽ cần được thiết kế như các capability chung:

- **Quản lý trạng thái bàn/booking/order nhất quán:**
  - Nhiều màn hình cùng xem/chỉnh cùng một thực thể (bàn, booking, order, bill), dễ gây race condition nếu không có model/event rõ ràng.

- **Authentication & Authorization đa vai trò:**
  - Phân tách rõ guest (QR/table/booking), FOH staff, kitchen/bar, manager/owner; mỗi role có quyền khác nhau với cùng dữ liệu.

- **Audit logging & traceability:**
  - Đặc biệt với thay đổi bill, chuyển trạng thái bàn, thao tác nhạy cảm (release booking, mark no-show, apply discount).

- **Analytics & event logging:**
  - Thu thập dữ liệu sự kiện (booking, check-in, order, bill, bàn) đủ chi tiết để dựng dashboard/heatmap nhưng không làm phình kiến trúc quá mức.

- **Configurability theo chi nhánh:**
  - Tables, zones, opening hours, peak windows, menu/giá có thể khác nhau theo branch; cần một model cấu hình rõ ràng, được tham chiếu bởi nhiều module.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application (Next.js + NestJS-based Node.js backend + PostgreSQL) based on project requirements và ưu tiên stack:

- Frontend: TypeScript + React + Next.js (UI build trên shadcn-ui).
- Backend: TypeScript + Node.js (NestJS: modules, controllers, services, guards).
- Database: PostgreSQL.
- Triển khai: VPS tự host trên DigitalOcean (Docker cho backend + services, hoặc PM2/Node trực tiếp).

### Starter Options Considered

1. **ZENN Stack (Next.js + NestJS monorepo)**
   - Monorepo full TypeScript với Next.js + NestJS, tích hợp Docker, hỗ trợ Postgres/Drizzle.
   - Tập trung DX, end-to-end type-safety, phù hợp cho triển khai container hóa (VPS, cloud).
   - Phù hợp nếu muốn tự customize nhiều tầng kiến trúc, nhưng tài liệu hiện tại thiên về “stack giới thiệu” hơn là template thuần SaaS.

2. **drizzle-nest-next (Charles-Chrismann/drizzle-nest-next)** _(đã khảo sát nhưng không chọn làm hướng chính)_
   - Monorepo Turborepo với:
     - `apps/web`: Next.js (TypeScript) cho frontend.
     - `apps/api`: NestJS (TypeScript) cho backend.
     - `packages/db`: Drizzle ORM + PostgreSQL (schema dùng chung).
     - `packages/*`: chia sẻ config/UI/tiện ích.
   - Dùng `pnpm` + Turborepo cho dev/build đồng bộ (`pnpm dev` chạy cả web + api).
   - Hỗ trợ lệnh `pnpm db:push`, `pnpm db:studio` để quản lý schema Postgres thân thiện.
   - Cấu trúc rõ ràng, dễ map với domain: bookings, tables, orders, analytics.
   - Thân thiện với mô hình triển khai trên VPS (có thể dùng Docker compose hoặc chạy từng app Node).

3. **ServerCN + Next.js custom** _(evaluated but not chosen)_
   - Backend dùng ServerCN làm “backend component registry” để compose Express-style API.
   - Đã được đánh giá; dự án chọn NestJS thay thế để có kiến trúc module/DI/guards thống nhất.

### Selected Starter: NestJS backend + Next.js (shadcn-ui) frontend

**Rationale for Selection:**

- Phù hợp với ưu tiên stack: TypeScript + Next.js + Node.js + PostgreSQL, với backend chuẩn hóa qua **NestJS** (modules, controllers, services, guards, DI).
- NestJS cung cấp kiến trúc rõ ràng (auth, error handling, RBAC, testing) phù hợp hệ thống đa epic, đa persona.
- Frontend dùng Next.js + shadcn-ui giúp đồng bộ UI, dễ mở rộng màn hình booking, table map, dashboards theo UX spec.
- Kiến trúc giữ Postgres + Prisma + Redis như đã quyết trong phần Core Decisions; backend chạy trong **Docker** (containerized) và/hoặc docker-compose cho local dev (Postgres, Redis, optional backend).

**Initialization Command (high-level):**

```bash
# Backend (NestJS)
npx @nestjs/cli new backend
# hoặc: nest new backend (sau khi cài @nestjs/cli global)
# Thêm Prisma, Redis, cấu hình theo architecture (modules, HealthModule, PrismaService, v.v.)

# Frontend (Next.js + shadcn-ui)
cd frontend
npx create-next-app@latest --typescript
npx shadcn-ui init
```

**Deployment (Docker):**

- Backend NestJS đóng gói thành Docker image; chạy phía sau reverse proxy (Nginx/Caddy). Có thể dùng `docker-compose` cho local: Postgres, Redis, backend, (optional) frontend.
- Frontend Next.js build static/hybrid và serve qua cùng Nginx hoặc dịch vụ riêng. Chi tiết triển khai sẽ được chốt trong phần Infrastructure.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Chọn Postgres làm database chính cho toàn bộ hệ thống.
- Dùng Prisma ORM + Prisma Migrate làm lớp ORM và migration duy nhất.
- Thiết kế single-tenant theo chuỗi LauNuongNgon với `branch_id` cho mọi entity chính.
- Dùng JWT cho authentication staff/manager, với RBAC rõ ràng: guest/staff/kitchen/manager.

**Important Decisions (Shape Architecture):**

- Redis được dùng làm cache cho availability, table map, và một số aggregate dashboard (có thể bật sau khi cần tối ưu hiệu năng).
- Chuẩn hóa schema và migration theo nguyên tắc additive-first, destructive-sau.
- QR guest flows không yêu cầu login, chỉ dựa trên token/binding theo booking/table.

**Deferred Decisions (Post-MVP):**

- Thiết kế multi-tenant đầy đủ (thêm `tenant_id/chain_id`, tách DB vật lý nếu cần).
- Tích hợp SSO nội bộ với IdP (Google Workspace, Azure AD, Okta, …) nếu scale lên enterprise.
- Bổ sung 2FA/MFA cho các role nhạy cảm (manager/owner) nếu cần compliance cao hơn.

### Data Architecture

**Database Choice & Tenancy Model**

- Database: **PostgreSQL** duy nhất cho LauNuongNgon ở Phase 1.
- Mô hình **single-tenant** theo chuỗi: tất cả entity chính (`branch`, `table`, `booking`, `order`, `bill`, `user`, …) đều có `branch_id`.
- Định hướng dài hạn:
  - Khi cần multi-tenant, bổ sung `tenant_id/chain_id` cho các bảng chính (additive migration).
  - Từ đó, mọi query sẽ luôn filter theo `tenant_id`, và có thể tách DB vật lý / schema riêng cho từng tenant về sau.

**ORM & Schema Management (Prisma)**

- ORM: **Prisma ORM** (v7.x, ổn định cho Node 18+/20+).
- Schema trung tâm: file `schema.prisma` mô tả toàn bộ model (Postgres).
- Migration:
  - Dev: `npx prisma migrate dev` dùng cho local/staging khi thay đổi schema.
  - Prod: `npx prisma migrate deploy` chạy trong quy trình deploy trên server/VPS.
  - Mỗi migration được version hóa, commit vào repo, mọi môi trường cùng “replay” chuỗi migration giống nhau.

**Migration & Evolution Strategy**

- Nguyên tắc thay đổi schema:
  - **Additive trước**: thêm bảng/cột/enum mới, cho phép null/giá trị mặc định để không phá vỡ code đang chạy.
  - Sau khi code và dữ liệu đã chuyển hoàn toàn sang cấu trúc mới, mới có migration **cleanup** (drop cột/bảng cũ, siết constraint).
- Quy trình 1 vòng thay đổi:
  1. Sửa model trong `schema.prisma` (ví dụ: thêm `branch_id`, thêm bảng `bookings`, mở rộng trạng thái).
  2. Sinh migration và chạy `npx prisma migrate dev` trên môi trường dev.
  3. Chạy test (unit/integration) để đảm bảo code Next.js/backend (NestJS) tương thích schema mới.
  4. Promote migration lên staging, rồi production với `npx prisma migrate deploy`.
- Chuẩn bị cho multi-tenant:
  - Bước 1: thêm `tenant_id` vào các bảng chính, giữ default cho tenant hiện tại.
  - Bước 2: dần cập nhật logic API/queries để luôn filter theo tenant.
  - Bước 3: cân nhắc tách DB vật lý (nếu cần) sau khi code đã fully tenant-aware.

**Caching Strategy (Redis)**

- Sử dụng **Redis** (self-host trên VPS DigitalOcean) cho:
  - Cache availability/tồn suất theo `branch_id + time-slot` để giảm áp lực query Postgres trong giờ cao điểm.
  - Cache snapshot table map (trạng thái bàn) cho các màn hình FOH.
  - Cache một số aggregate dashboard hay được truy cập (ví dụ: occupancy theo giờ trong ngày).
- Invalidations:
  - Sự kiện booking/check-in/order/bill thay đổi sẽ publish event (trong code) để xoá/refresh các key Redis liên quan.

### Authentication & Security

**Authentication Flows**

- **Staff/Manager Auth**:
  - Cơ chế: **email + password** cho các user nội bộ (`staff`, `kitchen`, `manager`).
  - Password hash bằng thuật toán mạnh (BCrypt/Argon2) trong backend (NestJS), không lưu plaintext.
  - Hỗ trợ reset password qua token (email link hoặc cơ chế nội bộ đơn giản trong Phase 1).
- **Guest QR Access**:
  - Khách không cần account: truy cập thông qua:
    - `booking_code` / QR booking (trước khi được gán bàn).
    - `table_token` / QR bàn (sau khi đã được gán bàn).
  - Guard riêng đảm bảo mỗi request chỉ truy cập được context booking/bàn tương ứng.

**Token Strategy (JWT)**

- Dùng **JWT** cho nhân viên (staff/kitchen/manager):
  - **Access token** short-lived (ví dụ 15–30 phút) chứa:
    - `sub` (user id), `role` (guest/staff/kitchen/manager), `branch_id` (hoặc danh sách branches), các claim cần thiết khác.
  - **Refresh token** long-lived, lưu trong DB hoặc Redis (kèm device info) để có thể revoke.
- API NestJS:
  - Guard xác thực JWT cho các route internal.
  - RBAC dựa trên decorator `@Roles('staff', 'manager', ...)` + kiểm tra `branch_id` trong token.

**Roles & Authorization**

- Roles chính Phase 1:
  - `guest`: chỉ truy cập flows QR menu, order, bill xem được nhưng không quản trị.
  - `staff`: FOH/staff nói chung (host, server, cashier).
  - `kitchen`: người vận hành bếp/bar; truy cập chủ yếu vào queue món.
  - `manager`: manager/owner; có thêm quyền cấu hình chi nhánh, xem báo cáo/analytics.
- Authorization:
  - Sử dụng guard & decorator của NestJS (VD: `@UseGuards(JwtAuthGuard, RolesGuard)`).
  - Với các endpoint nhạy cảm (cấu hình branch, điều chỉnh bill, release booking, mark no-show), chỉ cho phép `manager` (hoặc `staff` với scope/cấp quyền cụ thể).
  - Phân nhánh theo `branch_id` để tránh user của chi nhánh A thấy/chỉnh dữ liệu chi nhánh B.

**Security Considerations & Future Enhancements**

- Phase 1:
  - Bắt buộc HTTPS từ reverse proxy (Nginx/Caddy) trước app.
  - Sử dụng secret mạnh cho JWT signing, quản lý qua env/secret manager.
  - Log audit cho các thao tác nhạy cảm (thay đổi bill, đổi trạng thái bàn, release booking).
- Post-MVP/Future:
  - Tùy mức độ scale và yêu cầu doanh nghiệp:
    - Tích hợp **SSO nội bộ** (Google Workspace/Azure AD/Okta) cho staff/manager.
    - Bật **2FA/MFA** cho manager/owner.
    - Bổ sung security headers, rate limiting, IP allowlist cho panel quản trị.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**

- Khu vực dễ bị AI/engineer implement khác nhau và gây xung đột:
  - Đặt tên bảng/cột database và field JSON.
  - Đặt tên và cấu trúc route API.
  - Tổ chức thư mục backend/frontend, chỗ đặt tests, shared code.
  - Format response API, error, date/time.
  - Cách đặt tên và xử lý state/loading/error ở frontend.

### Naming Patterns

**Database Naming Conventions (Postgres + Prisma):**

- Table: `snake_case`, **số nhiều**: `branches`, `tables`, `bookings`, `orders`, `bills`, `users`.
- Column: `snake_case`: `branch_id`, `table_id`, `booking_id`, `created_at`, `updated_at`.
- Foreign key: `*_id` theo tên entity: `branch_id`, `user_id`, `booking_id`.
- Index: `idx_<table>_<main_column>[_<extra>]`, ví dụ:
  - `idx_bookings_branch_id_start_time`
  - `idx_orders_table_id_created_at`.

**API Naming Conventions (REST over NestJS backend):**

- Base path: `/api` prefix cho toàn bộ API public/backend.
- Resource: **plural, kebab-case**:
  - `/api/branches`, `/api/tables`, `/api/bookings`, `/api/orders`, `/api/bills`.
- Detail: `/api/bookings/:bookingId`, `/api/tables/:tableId`.
- Nested khi cần: `/api/branches/:branchId/tables`, `/api/tables/:tableId/orders`.
- Query params: **camelCase**: `?branchId=...&from=...&to=...`.

**Code Naming Conventions:**

- Class/Component/Type: **PascalCase**: `BookingController`, `TableMapService`, `BookingListPage`.
- File TS/TSX: **kebab-case**:
  - Backend: `booking.controller.ts`, `booking.service.ts`, `table-map.service.ts`.
  - Frontend: `booking-list.page.tsx`, `table-map.tsx`, `branch-dashboard.page.tsx`.
- Biến & hàm: **camelCase**: `getBookingById`, `createBooking`, `branchId`, `slotStart`.
- Route params trong code: `:bookingId`, `:branchId` (camelCase, không snake_case).

**Event Naming (nếu/ khi dùng event bus):**

- Dot-notation, lowercase, `<domain>.<action>`:
  - `booking.created`, `booking.checked_in`, `booking.cancelled`.
  - `table.needs_cleaning`, `bill.closed`.

### Structure Patterns

**Monorepo / Repo Organization (logical):**

- Có thể tổ chức tách repo hoặc trong một repo với 2 thư mục chính:
  - `backend/`: NestJS app (TypeScript).
  - `frontend/`: code Next.js + shadcn-ui.
- Backend (NestJS):
  - `src/`
    - `main.ts` (bootstrap), `app.module.ts` (root module).
    - `modules/` (feature modules: `booking/`, `table/`, `order/`, `bill/`, `branch/`, `auth/`), mỗi module có `*.module.ts`, `*.controller.ts`, `*.service.ts`.
    - `common/` (shared: guards, interceptors, filters, decorators, PrismaService, Redis provider, config).
  - `prisma/` (schema, migrations) hoặc `packages/prisma/` nếu sau này tách shared package.
- Frontend:
  - `app/` (nếu dùng App Router) hoặc `pages/` (Pages Router), tổ chức **by feature**:
    - `app/(guest)/booking/...`, `app/(guest)/table/...`
    - `app/(staff)/foh-dashboard/...`, `app/(manager)/analytics/...`
  - `components/` chia theo feature (`booking/`, `table/`, `billing/`) + `ui/` để wrap shadcn-ui primitives.
  - `lib/` cho API client, hooks chung, helpers.

**Tests Placement:**

- Backend:
  - Unit/integration test co-located: `*.spec.ts` cạnh file gốc (`booking.service.spec.ts`).
- Frontend:
  - `*.test.tsx` hoặc thư mục `__tests__` cạnh component/page, không tạo thêm root `tests/` riêng để tránh trùng pattern.

### Format Patterns

**API Response Formats:**

- **Success**:
  - List:
    ```json
    {
      "data": [...],
      "meta": { "total": 123, "page": 1, "pageSize": 20 }
    }
    ```
  - Detail:
    ```json
    {
      "data": { ...entity }
    }
    ```
- **Error**:
  - HTTP status code chuẩn + body:
    ```json
    {
      "error": {
        "code": "BOOKING_NOT_FOUND",
        "message": "Booking not found",
        "details": {}
      }
    }
    ```

**Data Exchange Formats:**

- JSON field: **camelCase** cho toàn bộ API/UI: `branchId`, `tableId`, `slotStart`, `slotEnd`, `totalAmount`, `createdAt`.
- Date/time trong API: **ISO 8601 UTC string** (`"2026-02-25T11:00:00.000Z"`).
  - Frontend hiển thị local time, nhưng gửi/nhận qua API luôn giữ ISO string.
- Boolean: true/false (không dùng 0/1).
- Không bao giờ trộn snake_case trong JSON; snake_case chỉ tồn tại ở DB layer.

### Communication & State Patterns

**Event System Patterns (tương lai):**

- Event payload tối thiểu gồm:
  - `id`, `branchId`, `occurredAt`, và các field domain cần thiết.
- Không dump cả entity full nếu không cần; mỗi event có payload gọn cho use-case.

**State Management Patterns (Frontend):**

- Ưu tiên:
  - Server components + fetch trực tiếp (nơi hợp lý).
  - React Query/`useSWR` cho server state cần caching/refresh (booking list, table map, dashboards).
  - Local component state cho UI nhỏ.
- **Không** introduce Redux/MobX/Recoil mới; chỉ dùng một stack state duy nhất được chốt trong implement (React Query chẳng hạn).
- Đặt tên state loading/error consistent:
  - Loading: `isLoading`, `isFetching`, `isSubmitting`.
  - Error: `error`, `fetchError`, `submitError`.

### Process Patterns

**Error Handling Patterns:**

- Backend:
  - Tất cả error domain map về `error.code` có namespace:
    - `BOOKING_NOT_FOUND`, `TABLE_ALREADY_OCCUPIED`, `BILL_ALREADY_CLOSED`, …
  - Dùng NestJS exception filter (global hoặc per-controller) để convert exception → format `{ error: { code, message, details } }`.
- Frontend:
  - Dùng component thông báo lỗi chung (e.g. toast/banner) cho lỗi global;
  - Không `console.log` lỗi bừa bãi – dùng 1 logger/helper duy nhất để log.

**Loading State Patterns:**

- Luôn có visual feedback cho action lâu:
  - Skeleton cho list/table map.
  - Spinner/disabled state cho các nút “Submit/Confirm/Pay/Close Bill”.
- Không để nhiều biến loading trùng nghĩa; với mỗi request chính nên có đúng **một** biến boolean thể hiện trạng thái hiện tại.

### Enforcement Guidelines

**All AI Agents MUST:**

- Tuân thủ **naming** (DB/API/code) và **format API** (response `{ data, error }`, error `{ error: { code, message, details } }`) đã nêu.
- Không tự ý thêm ORM, HTTP client, state manager, testing framework ngoài stack đã chốt (NestJS, Prisma, React Query/shadcn-ui, Jest/Vitest, v.v.).
- Đặt file/folder đúng khu vực quy định (backend vs frontend, feature-based structure).

**Pattern Enforcement:**

- Khi review code (hoặc AI sinh code mới), luôn đối chiếu với section này trước khi chấp nhận.
- Vi phạm pattern phải được ghi chú lại và/hoặc sửa để giữ codebase nhất quán.
- Nếu cần thay đổi pattern (do learnings mới), cập nhật `architecture.md` trước, rồi mới áp dụng rộng.

## Project Structure & Boundaries

### Complete Project Directory Structure

```markdown
lau-nuong-ngon/
├── README.md
├── package.json # scripts chung (lint all, test all, dev both, ...)
├── pnpm-workspace.yaml # nếu dùng pnpm monorepo
├── .gitignore
├── .env.example
├── backend/ # NestJS + Prisma + Redis (Docker-ready)
└── frontend/ # Next.js + shadcn-ui
```

**Backend (NestJS + Prisma + Redis):**

```markdown
backend/
├── package.json
├── tsconfig.json
├── Dockerfile # optional: containerize NestJS app
├── .env
├── .env.example
├── src/
│ ├── main.ts # bootstrap Nest app
│ ├── app.module.ts # root module
│ ├── common/
│ │ ├── prisma/ # PrismaService (injectable)
│ │ ├── redis/ # Redis provider
│ │ ├── guards/ # JwtAuthGuard, RolesGuard
│ │ ├── decorators/ # @Roles(), @CurrentUser()
│ │ ├── filters/ # global exception filter -> { error: { code, message, details } }
│ │ └── config/ # env/config module
│ ├── modules/
│ │ ├── health/ # HealthModule, HealthController -> GET /api/health
│ │ ├── booking/
│ │ ├── table/
│ │ ├── order/
│ │ ├── bill/
│ │ ├── branch/
│ │ └── auth/
│ └── (each feature module: *.module.ts, *.controller.ts, *.service.ts)
├── prisma/
│ ├── schema.prisma
│ └── migrations/
└── test/
├── booking.service.spec.ts
├── table.service.spec.ts
└── e2e/
└── booking.flow.spec.ts
```

**Frontend (Next.js + shadcn-ui):**

```markdown
frontend/
├── package.json
├── next.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── .env.local
├── app/
│ ├── layout.tsx
│ ├── page.tsx # landing / marketing hoặc redirect
│ ├── (guest)/
│ │ ├── booking/
│ │ │ ├── page.tsx # online booking flow
│ │ │ └── success/page.tsx
│ │ └── table/
│ │ └── [tableToken]/page.tsx # QR menu + order + bill view
│ ├── (staff)/
│ │ └── foh-dashboard/
│ │ └── page.tsx # FOH table map + cleaning queue
│ ├── (kitchen)/
│ │ └── queue/
│ │ └── page.tsx # kitchen/bar order queue
│ └── (manager)/
│ └── analytics/
│ └── page.tsx # manager dashboards
├── components/
│ ├── ui/ # shadcn-ui components
│ ├── booking/
│ ├── table/
│ ├── order/
│ ├── bill/
│ └── layout/
├── lib/
│ ├── api-client.ts # wrapper fetch/axios -> chuẩn { data, error }
│ ├── auth.ts # lưu token, helper call backend
│ ├── config.ts # base URLs, feature flags
│ └── utils.ts
├── hooks/
│ ├── useBookings.ts
│ ├── useTableState.ts
│ ├── useOrders.ts
│ └── useBill.ts
└── tests/
├── booking.page.test.tsx
├── table.page.test.tsx
└── components/
```

### Architectural Boundaries

**API Boundaries:**

- Toàn bộ API backend đi qua prefix `/api`.
- Mỗi feature chính có route riêng:
  - Booking: `/api/bookings`, `/api/branches/:branchId/bookings`.
  - Tables: `/api/branches/:branchId/tables`, `/api/tables/:tableId`.
  - Orders: `/api/tables/:tableId/orders`.
  - Bills: `/api/bills`, `/api/tables/:tableId/bill`.
- Auth & RBAC được xử lý bằng NestJS guards (`JwtAuthGuard`, `RolesGuard`) và decorators (`@UseGuards(...)`, `@Roles(...)`) trên controller/route.

**Component Boundaries (Frontend):**

- Guest vs Staff vs Kitchen vs Manager được tách bởi segment `(guest)`, `(staff)`, `(kitchen)`, `(manager)` trong `app/`.
- Component tính năng (booking/table/order/bill/analytics) đặt trong `components/<feature>/`, không lẫn sang feature khác.
- Shared UI primitives (button, input, dialog, sheet, ...) nằm trong `components/ui/` (shadcn-ui).

**Service Boundaries (Backend):**

- Mỗi domain chính có service riêng:
  - `booking.service.ts` xử lý toàn bộ logic booking + check-in.
  - `table.service.ts` xử lý table state, cleaning.
  - `order.service.ts` xử lý create/update/cancel order.
  - `bill.service.ts` xử lý billing & discounts.
  - `analytics.service.ts` xử lý aggregate metrics & dashboard queries.
- Controller chỉ điều phối request/response, không chứa business logic nặng.

**Data Boundaries:**

- Prisma schema là nguồn sự thật duy nhất cho DB; mọi truy vấn đi qua services.
- Redis chỉ được truy cập qua injectable NestJS provider (e.g. `RedisService` hoặc module `RedisModule`), không gọi trực tiếp từ mọi nơi.

### Requirements to Structure Mapping

**Feature/Epic Mapping (ví dụ):**

- **Booking & Peak-Hour Check-in**
  - Backend:
    - Module: `src/modules/booking/` (BookingModule, BookingController, BookingService)
    - DB: bảng `bookings` trong `prisma/schema.prisma` + migration liên quan
    - Tests: `tests/booking.service.spec.ts`, `tests/e2e/booking.flow.spec.ts`
  - Frontend:
    - Pages: `app/(guest)/booking/page.tsx`, `app/(guest)/booking/success/page.tsx`
    - Components: `components/booking/*`
    - Hooks: `hooks/useBookings.ts`

- **QR In-Store Experience (Menu, Ordering, Bill)**
  - Backend:
  - Tables: `modules/table/` (TableModule, TableController, TableService)
  - Orders: `modules/order/` (OrderModule, OrderController, OrderService)
  - Bills: `modules/bill/` (BillModule, BillController, BillService)
    - DB: bảng `tables`, `orders`, `bills` trong `schema.prisma`
  - Frontend:
    - Page QR: `app/(guest)/table/[tableToken]/page.tsx`
    - Components: `components/table/*`, `components/order/*`, `components/bill/*`
    - Hooks: `hooks/useTableState.ts`, `hooks/useOrders.ts`, `hooks/useBill.ts`

- **In-Store Operations (FOH Staff & Kitchen)**
  - Backend:
    - FOH data: kết hợp `booking.service.ts`, `table.service.ts`, `order.service.ts`
    - Kitchen queue: endpoint riêng trong OrderModule hoặc KitchenModule
  - Frontend:
    - FOH dashboard: `app/(staff)/foh-dashboard/page.tsx` + `components/table/table-map`, `components/booking/booking-timeline`
    - Kitchen queue: `app/(kitchen)/queue/page.tsx` + `components/order/kitchen-queue`

- **Manager Dashboards & Analytics**
  - Backend:
    - AnalyticsModule + AnalyticsController → `/api/analytics/*`
    - DB: sử dụng bảng hiện có (bookings, orders, bills) + index hỗ trợ query
  - Frontend:
    - Page: `app/(manager)/analytics/page.tsx`
    - Components: `components/analytics/*`

**Cross-Cutting Concerns:**

- **Authentication & RBAC**
  - Backend:
    - AuthModule, JwtAuthGuard, RolesGuard, decorators trong `src/common/guards`, `src/common/decorators`
    - DB: bảng `users`, `roles`, liên kết với `branch_id`
  - Frontend:
    - Auth helpers: `lib/auth.ts`
    - Protect routes bằng layout/guard cho `(staff)`, `(kitchen)`, `(manager)`.

### Integration Points

**Internal Communication:**

- Frontend gọi backend qua `lib/api-client.ts`, luôn sử dụng format `{ data, error }`.
- Backend services không gọi trực tiếp nhau qua HTTP, mà import service class/module (in-process).

**External Integrations:**

- Phase 1 không tích hợp POS/payment sâu; các điểm tích hợp tiềm năng được gom về một lớp adapter riêng (sau này có thể thêm `integrations/pos/` trong backend).

**Data Flow (high-level):**

- Guest:
  - Web (Next.js) → `/api/bookings` / `/api/tables/:tableId/orders` → Services → Prisma/Postgres (+ Redis).
- Staff/Kitchen/Manager:
  - Web (Next.js staff views) → `/api/*` (secured by JWT + RBAC) → Services → DB/Redis → response về frontend.
