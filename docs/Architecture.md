# Architecture

## Stack

- **Runtime**: Node.js 20 (via nvm)
- **Framework**: NestJS 11
- **ORM**: TypeORM
- **Database**: PostgreSQL 16 (Dockerized)
- **Cache/Queue**: Redis (planned, M6)
- **Auth**: JWT (access + refresh tokens), Passport
- **Docs**: Swagger (`/api/docs`)
- **Dev environment**: WSL2 Ubuntu + Docker Desktop (WSL integration enabled)

## Folder structure

```
src/
├── common/                  # shared across 2+ modules
│   ├── entities/
│   │   └── base.entity.ts   # audit columns, extended by every entity
│   ├── enums/ | types/      # shared enums (UserRole, Status) and interfaces (RequestUser)
│   ├── dto/                 # pagination-query, page-meta, paginated-response
│   ├── decorators/          # @ApiController(), @CurrentUser()
│   ├── guards/               # RBAC guards (M5)
│   ├── interceptors/         # audit log interceptor (M5.5)
│   └── utils/                # paginate.util.ts and other shared helpers
├── config/                   # one file per concern, namespaced via registerAs()
│   ├── db.config.ts
│   ├── jwt.config.ts
│   ├── env.validation.ts     # Joi schema, fail-fast on bad/missing env
│   └── swagger.config.ts
├── users/
│   ├── entities/user.entity.ts
│   ├── dto/                  # create, update, response, query DTOs
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── auth/                      # same shape as users/
└── main.ts                    # bootstrap only — no business logic
```

Rule of thumb: **used in one module → lives in that module's folder. Used in
2+ modules → goes in `common/`.**

## Key patterns

### BaseEntity (audit trail)

Every entity extends `common/entities/base.entity.ts`, which provides:
`id` (uuid), `createdAt`, `updatedAt`, `deletedAt` (soft-delete via
`@DeleteDateColumn`), and `createdBy` / `updatedBy` / `deletedBy` (uuid,
nullable until populated). These `*By` fields are populated manually via
`@CurrentUser()` today; M5.5 introduces a TypeORM subscriber to populate them
automatically from request context instead.

### Config pattern

Each concern (`db`, `jwt`, ...) gets its own `registerAs()`-namespaced config
file under `src/config/`, read via `ConfigService.get('namespace.key')`.
`main.ts` stays free of setup logic — e.g. Swagger setup lives in
`config/swagger.config.ts` as an exported function, called from `main.ts`.

### Env validation

`src/config/env.validation.ts` is a Joi schema enforced at `ConfigModule`
boot. Missing/invalid required vars crash the app immediately with a clear
message — fail fast instead of a confusing downstream connection error.

### DTOs (per module, in `dto/`)

- `create-*.dto.ts` — input validation via `class-validator`
- `update-*.dto.ts` — `PartialType(OmitType(CreateDto, [...]))`
- `*-response.dto.ts` — `@Exclude()`-by-default, explicit `@Expose()` per
  field — defense in depth so sensitive fields (e.g. password hash) can never
  leak through a response even if a query accidentally selects them
- `*-query.dto.ts` — extends `common/dto/pagination-query.dto.ts`

### Pagination

`common/utils/paginate.util.ts` — one reusable function, takes a
`SelectQueryBuilder` + `PaginationQueryDto`, returns
`PaginatedResponseDto<T>` (`data[]` + `meta` with page/limit/total/hasNext).
Every list endpoint across every module uses this same utility.

### API versioning & platform routing

Custom `@ApiController(resource, platform?)` decorator produces routes shaped
`api/v1/{platform}/{resource}`, e.g. `api/v1/web/users`,
`api/v1/mobile/logsheets`. Default platform is `web`.

### Current user context

`@CurrentUser()` param decorator reads `request.user` (populated by the JWT
guard once auth is wired). Typed via `common/types/global.types.ts` →
`RequestUser { userId, email, role }`.

### Transactions

Default: plain repository methods (`create`/`save`/`softDelete`) for
single-table operations. When an operation touches multiple tables and must
be atomic, use `DataSource.createQueryRunner()` with explicit
`connect → startTransaction → try/commit → catch/rollback → finally/release`.
First real use expected around the Projects module (M8).

### Error handling

Services wrap logic in try/catch, log via NestJS `Logger` (`this.logger =
new Logger(ClassName.name)`), rethrow known Nest exceptions
(`NotFoundException`, `ConflictException`, ...) as-is, and wrap anything
unexpected in `InternalServerErrorException` so internals never leak to the
client.

### Soft delete

`remove()` calls `repository.softDelete(id)`, not `.remove()` — rows are
never physically destroyed; `deletedAt`/`deletedBy` are set, and default
queries automatically exclude soft-deleted rows.

### Auth (JWT)

Two independently-secreted tokens: short-lived **access token** (15m) sent on
every request, long-lived **refresh token** (7d) used only to mint a new
access token. Separate secrets so a leaked access token can't be used to
forge a refresh token.

### RBAC (phased)

- **Phase 1** (M5): `role` as a Postgres enum column on `User`, checked via
  guard + `@Roles()`/`@RequirePermissions()` decorator
- **Phase 2** (M5, later): migrate to a `roles` table + FK relation, so
  admins can create/manage roles at runtime without a deploy

## Infrastructure

### Docker

`docker-compose.yml` at repo root. Currently: `postgres` service only.
Planned additions: `redis`, `mailhog` (dev email), `api` (containerize the
NestJS app itself once it's stable enough to ship).

### Known environment gotcha (documented so it's never re-debugged blind)

A **native Postgres install inside WSL Ubuntu** can silently bind port 5432
before Docker does, causing `password authentication failed` errors that look
like a credentials bug but are actually a wrong-server bug. Diagnose with
`sudo lsof -i :5432` — if you see a bare `postgres` process (not a Docker
proxy), stop it: `sudo service postgresql stop`.

### CI/CD (planned, M10)

GitHub Actions: lint + test → build Docker image → push to Docker Hub → SSH
deploy to cPanel-hosted server, restart container.
