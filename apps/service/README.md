# Stock Sync Service

This package contains the NestJS API for Stock Sync. It exposes product CRUD
endpoints, Swagger documentation, health checks, and PostgreSQL persistence
through Prisma.

See the root [`README.md`](../../README.md) for full project setup,
environment, Docker, k3s, API, and testing documentation.

Useful package commands:

```sh
pnpm --filter service dev
pnpm --filter service build
pnpm --filter service test
pnpm --filter service prisma:migrate
pnpm --filter service prisma:studio
pnpm --filter service prisma:deploy
```
