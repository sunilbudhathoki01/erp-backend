# Memory / Decision Log

Running log of decisions made, why, and things learned the hard way. Append
to this as we go — it's the "why" behind `architecture.md` and `rules.md`.

## Environment

- Dev setup: WSL2 Ubuntu on Windows, Docker Desktop with WSL integration
  enabled for the `Ubuntu` distro specifically (Settings → Resources → WSL
  Integration).
- **Gotcha (M2)**: a native Postgres install inside WSL had silently claimed
  port 5432 before the Docker container did. Symptom looked like a wrong
  password (`password authentication failed`), but was actually the app
  talking to the wrong Postgres entirely. Root-caused via
  `sudo lsof -i :5432` — a bare `postgres` process (not a Docker proxy) is
  the tell. Fixed by `sudo service postgresql stop` +
  `sudo systemctl disable postgresql`. Always suspect "wrong server" before
  "wrong password" when auth errors appear right after a fresh Docker setup.
- Always work as the normal user (`sunil`), never `root` — avoids
  file-permission mismatches between root-owned and user-owned files.
- Docker Compose `version:` key is obsolete in current Compose — omit it,
  start files directly with `services:`.

## Architecture decisions

- **BaseEntity over per-entity audit columns**: every entity extends a
  shared `common/entities/base.entity.ts` (id, timestamps, soft-delete,
  createdBy/updatedBy/deletedBy) rather than repeating these fields. Decided
  early (M4) specifically because this is meant to become a starter kit.
- **`select: false` on password + `@Exclude()`/`@Expose()` on response
  DTOs**: deliberate defense-in-depth — even if a query accidentally
  fetches the password hash, the response DTO still can't leak it.
- **Enum role now, roles table later**: enum ships faster and unblocks
  auth/RBAC guard logic sooner; a proper `roles` table (admin-manageable,
  e.g. to add "Driver") is planned as an explicit Phase 2 migration, not
  forgotten scope. Tracked in `phases.md` under M5.
- **Two JWT secrets (access/refresh)**: chosen so a leaked access token
  can't be reused to forge a refresh token — cryptographically unrelated
  keys, not just different expiry times.
- **OTP-based user creation deferred**: a senior reference implementation
  used `create-with-otp` / `set-password` / `resend-otp` instead of plain
  register. Decided to build plain JWT register/login first since OTP
  delivery genuinely depends on Redis (storage/expiry, M6) and Email
  (delivery, M7) — building it earlier would mean stubbing core
  infrastructure it depends on.
- **`DataSource` transactions reserved, not forced**: `UsersService` injects
  `DataSource` but doesn't use `createQueryRunner()` yet, since user creation
  only touches one table. Pattern is established (see class-stream-group
  reference in `architecture.md`) and will be used for real starting with
  the Projects module (M8), where multi-table atomicity actually matters.

## Open questions / revisit later

- `logout` and `forgetPassword`/`resetPassword` are stubbed with TODOs until
  Redis (M6) and Email (M7) land — revisit once those milestones complete.
- Decide during M5 Phase 2: do `createdBy`/`updatedBy`/`deletedBy` on
  `BaseEntity` stay as plain UUID columns, or become `@ManyToOne` relations
  to `User`? Plain UUIDs chosen for now (simpler); revisit if querying
  "who created this" by name becomes frequent enough to justify the join
  complexity.
