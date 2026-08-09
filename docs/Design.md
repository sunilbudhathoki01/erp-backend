# API Design Conventions

## Versioning & platform routing

```
api/v1/{platform}/{resource}
```

`platform` is `web` (default) or `mobile`. Set via
`@ApiController(resource, platform?)`. Example: `api/v1/web/users`,
`api/v1/mobile/logsheets`.

Bump `v1` → `v2` only on breaking changes to an existing resource's contract,
not for additive changes (new optional field, new endpoint).

## Request validation

All request bodies are typed DTOs validated globally via `ValidationPipe`:

- `whitelist: true` — strips unknown properties
- `forbidNonWhitelisted: true` — rejects requests containing unknown properties
- `transform: true` — auto-converts payloads into DTO class instances

## Response shapes

**Single resource:**

```json
{ "id": "...", "email": "...", "...": "..." }
```

Returned via a `*ResponseDto` (`@Exclude()`-by-default, explicit `@Expose()`)
— never a raw entity.

**Paginated list:**

```json
{
  "data": [/* ResponseDto[] */],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

Produced by `common/utils/paginate.util.ts` — every list endpoint uses this
same shape, no per-module variation.

**Errors** (Nest's default HttpException shape, kept as-is — no custom
wrapper):

```json
{
  "statusCode": 404,
  "message": "User with id ... not found",
  "error": "Not Found"
}
```

## Pagination query params

`?page=1&limit=10&search=...&order=DESC` — validated via
`PaginationQueryDto`, extended per-module for extra filters (e.g.
`UserQueryDto` adds `role`, `status`).

## Auth headers

Protected routes require `Authorization: Bearer <accessToken>`. Documented
per-controller via `@ApiBearerAuth()`, and globally enabled in Swagger via
`.addBearerAuth()` in `swagger.config.ts` — use the "Authorize" button once
logged in.

## Swagger

Every controller: `@ApiController(...)` (implies `@ApiTags`), every route:
`@ApiOperation({ summary })`. DTOs carry `@ApiProperty()`/`@ApiPropertyOptional()`
on every field — no undocumented fields.
