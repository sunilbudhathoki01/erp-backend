# Phases

Status tracker — update as milestones complete. Strict order; each phase is
fully working and committed before the next starts.

- [x] **M1 — Environment & Project Bootstrap**
      Node/nvm, NestJS CLI, project scaffold, running locally.

- [x] **M2 — Dockerized PostgreSQL + TypeORM Connection**
      docker-compose Postgres, namespaced `db.config.ts`, clean connection.
      (Debugged: native WSL Postgres port conflict — see `architecture.md`.)

- [x] **M3 — Config & Environment Validation**
      Joi schema, fail-fast on missing/invalid env vars.

- [x] **Tooling — ESLint + Prettier + format-on-save**
      Confirmed working via VS Code `.vscode/settings.json`.

- [~] **M4 — Users Module + Authentication (JWT)** — in progress
  - [x] Swagger setup (`config/swagger.config.ts`, `/api/docs`)
  - [x] `User` entity extending `BaseEntity`, enum `role`/`status`
  - [x] Users DTOs (create/update/response/query) + pagination utils
  - [x] `UsersService` + `UsersController` (CRUD, soft-delete, senior error
        handling), routed via `@ApiController` → `api/v1/web/users`
  - [x] JWT config (`jwt.config.ts`, access + refresh secrets/expiry)
  - [x] Auth module skeleton, `LoginDto`, `AuthResponseDto`, `JwtModule` wired
  - [ ] `AuthService.login()` — credential check + token issuing
  - [ ] JWT Strategy + `AuthGuard`
  - [ ] `GET /auth/me` (first protected route)
  - [ ] `POST /auth/refresh`
  - [ ] `POST /auth/logout` (stub — real invalidation needs Redis, M6)
  - [ ] `forgetPassword` / `resetPassword` (stub — needs Email, M7)
  - [ ] User creation via OTP flow (deferred — needs Redis + Email)

- [ ] **M5 — Role-Based Access Control (RBAC)**
  - Phase 1: enum-based `role`, `@Roles()`/`@RequirePermissions()` + guard
  - Phase 2: migrate enum → `roles` table + FK relation (admin-manageable)

- [ ] **M5.5 — Audit & Activity Tracking**
      TypeORM subscriber to auto-populate `createdBy`/`updatedBy`/`deletedBy`
      from request context; global interceptor for activity/audit logging
      (`@LogAudit()`), building directly on `BaseEntity`.

- [ ] **M6 — Redis Integration**
      Dockerized Redis, caching layer, refresh-token/session store, OTP storage.

- [ ] **M7 — Email System**
      Nodemailer + Mailhog (dev), queued sending via Redis + BullMQ.

- [ ] **M8 — First Real ERP Domain Module**
      Likely Projects & Sites — first module to exercise `DataSource` transactions.

- [ ] **M9 — Testing**
      Unit tests (services), e2e tests (auth flow).

- [ ] **M10 — CI/CD**
      GitHub Actions: lint + test → build image → push Docker Hub → SSH deploy to
      cPanel server, restart container.

- [ ] **M11 — Logging, Health Checks, Hardening**
      Structured logging, `/health`, rate limiting, helmet, production checklist.
