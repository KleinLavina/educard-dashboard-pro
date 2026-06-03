---
name: Paginated API endpoints
description: Which Django REST endpoints return PaginatedResponse vs plain arrays — critical for correct frontend data access
---

**Rule:** Always check whether an endpoint paginates before calling `.map()` / `.filter()` on `query.data`.

**How to apply:** When wiring a new `useQuery` hook that calls a DRF list endpoint, verify the response shape via `curl` first. Use `.data.results` for paginated endpoints, `.data` directly for plain-array endpoints.

## Paginated (`{ count, next, previous, results: T[] }`)
- `GET /api/tasks/` (`api.tasks.list`)
- `GET /api/id-queue/` (`api.idCards.queue`)
- `GET /api/learners/` (`api.learners.list`) — likely paginated, not yet confirmed

## Plain array (`T[]`)
- `GET /api/learners/at_risk/` (`api.learners.atRisk`) — returns plain array
- `GET /api/dashboard/stats/` — returns single object
- `GET /api/dashboard/departments/` — returns array of department objects
- `GET /api/auth/me/` — returns single object

**Why:** DRF's `PageNumberPagination` is enabled globally in settings. Endpoints that use `ModelViewSet` with no `pagination_class = None` override will paginate. Only custom `@action` endpoints like `at_risk` may bypass pagination. This mismatch caused a runtime crash on the admin dashboard — `.map is not a function` fired the moment React Query delivered data.
