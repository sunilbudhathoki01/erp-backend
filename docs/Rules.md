# Rules & Conventions

## Naming

- **Enums/types/interfaces**: PascalCase (`UserRole`, `RequestUser`), even
  though enum _values_ are lowercase strings (`'admin'`)
- **Files**: kebab-case (`create-user.dto.ts`, `user-role.enum.ts`)
- **DB columns**: snake_case via `@Column({ name: '...' })`; TS properties
  stay camelCase
- **Branches**: `feature/m{n}-short-description` (one branch per milestone,
  not per sub-feature)
- **Commits**: `M{n}: what changed` for milestone work, `chore:` / `fix:` for
  incidental changes

## Folder placement

Used in one module only → that module's folder. Used in 2+ modules → moves to
`src/common/`. Config/setup concerns (DB, JWT, Swagger) → `src/config/`, one
file per concern.

## Entities

- Every entity extends `common/entities/base.entity.ts` — never redefine
  `id`/timestamps/audit columns per-entity
- Sensitive columns (passwords, tokens) get `@Column({ select: false })` —
  explicitly opt in via `.addSelect()` only where actually needed
- Soft delete via `@DeleteDateColumn()` + `repository.softDelete()` — never
  `.remove()` unless permanent deletion is explicitly required and approved
- Add `@Index()` only where a query pattern justifies it (not on columns
  already covered by a unique constraint)

## DTOs

- Every input DTO uses `class-validator` decorators + `@ApiProperty()` — no
  untyped/unvalidated request bodies
- Response DTOs are `@Exclude()`-by-default with explicit `@Expose()` per
  field — never return an entity directly from a controller
- `UpdateDto` = `PartialType(OmitType(CreateDto, [...never-updatable-fields]))`

## Services

- Wrap logic in try/catch, log via `Logger`, rethrow known
  `HttpException` subclasses as-is, wrap unexpected errors in
  `InternalServerErrorException`
- Inject `DataSource` only when the module will need multi-table
  transactions; default to repository methods otherwise
- `currentUser` (via `@CurrentUser()`) is passed into service methods that
  create/update/delete, to populate `createdBy`/`updatedBy`/`deletedBy`
  (until the M5.5 audit subscriber automates this)

## Controllers

- Always use `@ApiController(resource, platform?)`, never the raw `@Controller()`
- Always annotate with `@ApiOperation({ summary })` and `@ApiBearerAuth()`
  where auth is required
- Guards/permissions/audit-log decorators are added in the milestone that
  introduces them (RBAC → M5, audit → M5.5) — mark with `// TODO (Mx): ...`
  until then rather than skipping silently

## Config & secrets

- No secrets hardcoded, ever — `.env` for real values, `.env.example` for
  placeholders, both kept in sync
- All required env vars are enforced via `src/config/env.validation.ts`
  (Joi) — a missing var should crash startup with a clear message, not fail
  quietly downstream

## Git workflow

- One feature branch per milestone, merged to `main` only once that
  milestone is fully working and manually verified via Swagger
- No direct commits to `main`

## Formatting

- Format-on-save is configured (Prettier + ESLint auto-fix) — never
  hand-format, never fight the formatter
