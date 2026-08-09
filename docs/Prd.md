# PRD — ERP Backend (Construction ERP)

## What this is

A production-quality NestJS backend, built as a practice project that mirrors a
real construction-company ERP system Hallow Tech will eventually need. Dual
purpose: (1) learn senior-level backend architecture hands-on, (2) produce a
reusable starter kit for future company projects.

## Problem

Construction companies coordinate people (office staff, site engineers,
drivers), materials, vendors, and money across multiple active sites. This
needs to be tracked centrally, with different roles seeing/doing different
things, and mobile access for field staff (e.g. drivers submitting daily
logsheets from site).

## Target users / roles (initial)

- **Admin** — full access, manages users/roles, sees everything
- **Site Engineer** — manages a project/site, materials, workers on that site
- **Accountant** — invoices, payments, vendor bills
- **Driver** (mobile-only) — submits daily logsheets, trip records

Roles are enum-based initially (Phase 1), migrating to a dynamic `roles` table
(Phase 2) so admins can add new roles (e.g. "Store Keeper") without a code
deploy. See `architecture.md`.

## Platforms

- **Web** — office staff, admin, accountant, site engineer (desktop-first)
- **Mobile** — drivers and site staff filling logs/forms in the field

Both share the same backend, versioned and namespaced by platform:
`api/v1/web/...` and `api/v1/mobile/...`.

## Core modules (in build order — see `phases.md`)

1. Auth + Users (RBAC) — **in progress**
2. Projects & Sites
3. Inventory / Materials
4. Procurement / Vendors
5. HR / Attendance
6. Invoicing / Payments

## Non-goals (for now)

- Multi-company / multi-tenant SaaS — this is single-company (Hallow Tech)
  internal use, so no tenant isolation layer is being built
- Real-time features (websockets/live tracking) — not in initial scope
- Native mobile app itself — backend only; mobile client is a separate concern

## Success criteria for the practice project

- Each milestone in `phases.md` is fully working, tested manually via Swagger,
  and committed before moving to the next
- The resulting codebase is clean enough to literally copy as a starter kit
  for the next real project
