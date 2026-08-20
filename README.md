# Stock Sync

Stock Sync is an inventory synchronization app for managing products and keeping
local edits safe when the API is unavailable. The web app updates the UI
optimistically, queues failed create/update/delete operations in IndexedDB, and
lets users review, execute, or discard those pending operations later.

## What is in this repository?

This is a pnpm/Turborepo monorepo.

- `apps/web`: React 19 inventory UI built with Rsbuild, TanStack Router,
  TanStack Query, Ant Design, Tailwind CSS, Zod, Axios, and Dexie.
- `apps/service`: NestJS API built with Rspack, Prisma 7, PostgreSQL,
  Swagger, and Terminus health checks.
- `packages/rslint-config`: shared Rslint configuration.
- `packages/typescript-config`: shared TypeScript configuration.
- `infrastructure/k3s`: k3s manifests and a helper script for importing local
  Docker images into k3s.

## Main features

- Create, edit, delete, and paginate inventory products.
- Validate product input on both the client and API.
- Store products remotely in PostgreSQL through Prisma.
- Queue failed product mutations locally in IndexedDB.
- Overlay pending local operations on top of the remote product list.
- Review pending operations at `/pending-operations`.
- Execute or exclude pending operations one by one or in bulk.
- Expose API health checks and Swagger documentation.

## Requirements

- Node.js 24.
- pnpm 11.21.0 through Corepack or a matching local install.
- Docker and Docker Compose for the containerized stack.
- PostgreSQL 16 when running the service directly outside Docker.
- For k3s deployment: Docker, `kubectl`, k3s, and permission to run
  `sudo k3s ctr` unless you override `K3S_CTR`.

## Environment

Create a local `.env` from the example file before running the stack:

```sh
cp .env.example .env
```

The project uses these runtime values:

- `NODE_ENV`: runtime environment.
- `PORT`: service port, defaulting to `5400`.
- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `REACT_APP_PUBLIC_API_URL`: public API URL compiled into the web app.
- `CROSS_ORIGIN_SERVICE`: optional CORS origin for the service.

Rsbuild public variables are compile-time values. Set
`REACT_APP_PUBLIC_API_URL` before building the web app or pass it as the Docker
build argument used by `apps/web/Dockerfile`.

For Docker Compose, `.env.example` points the service at the Compose PostgreSQL
host (`postgres`). For direct local development, point `DATABASE_URL` at
`localhost` instead:

```env
NODE_ENV=development
PORT=5400
DATABASE_URL=postgres://stock_sync:stock_sync@localhost:5432/stock_sync
REACT_APP_PUBLIC_API_URL=http://localhost:5400/api
CROSS_ORIGIN_SERVICE=http://localhost:3000
```

## Quick start with Docker Compose

The fastest way to run the full application is Docker Compose:

```sh
pnpm install
cp .env.example .env
docker compose up --build
```

The Compose stack starts:

- Web app: `http://localhost:3000`
- API: `http://localhost:5400/api`
- Swagger UI: `http://localhost:5400/api/docs`
- PostgreSQL: `localhost:5432`

The service container runs `prisma migrate deploy` before starting the API.

## Local development

Install dependencies:

```sh
pnpm install
```

Start PostgreSQL in Docker:

```sh
docker compose up -d postgres
```

Update `.env` for local service execution by using `localhost` in
`DATABASE_URL`, then run the initial migration:

```sh
pnpm --filter service prisma:migrate
```

Start both apps through Turborepo:

```sh
pnpm dev
```

Useful filtered commands:

```sh
pnpm --filter web dev
pnpm --filter service dev
pnpm --filter service prisma:studio
```

## Scripts

Run these from the repository root unless noted otherwise.

- `pnpm dev`: start all development tasks through Turborepo.
- `pnpm build`: build every app/package.
- `pnpm test`: run unit tests for all apps.
- `pnpm lint`: run Rslint.
- `pnpm check-types`: run TypeScript checks.
- `pnpm format`: format TypeScript, TSX, and Markdown files.
- `pnpm format:check`: check formatting without writing files.
- `pnpm --filter web test:e2e`: build the web app and run Playwright-backed
  e2e tests.
- `pnpm --filter service prisma:generate`: generate the Prisma client.
- `pnpm --filter service prisma:migrate`: create/apply a development migration.
- `pnpm --filter service prisma:deploy`: apply production migrations.
- `pnpm k3s:sync-local-images`: build local app images, import them into k3s,
  apply manifests, and update deployments.

## Web app behavior

The web app reads products from `REACT_APP_PUBLIC_API_URL` and validates API
responses with Zod before rendering them. Product mutations first try the API.
If the API call fails, the app applies an optimistic local change and stores a
pending sync operation in the browser IndexedDB database named
`stock-sync-inventory`.

Pending operation types are:

- `CREATE`: stores a full product payload.
- `UPDATE`: stores the latest product payload.
- `DELETE`: stores the deleted product id.

The inventory page derives its visible product list by applying pending
operations over the latest remote products. The pending operations page lets the
user resend operations to the API or remove them from the local queue.

## API

The NestJS service uses a global `/api` prefix. Swagger is available at
`/api/docs`.

### Health endpoints

- `GET /api/health`: liveness check.
- `GET /api/health/ready`: readiness check for disk, memory, and PostgreSQL.

### Product endpoints

- `GET /api/products/paginate?page=1&perPage=10`: list products with
  pagination. `perPage` is capped at `40`.
- `POST /api/products/create`: create a product.
- `PUT /api/products/update/:id`: update a product.
- `DELETE /api/products/delete/:id`: delete a product.

Product payloads use this shape:

```json
{
  "sku": 34243,
  "name": "Product Name",
  "quantity": 100
}
```

Validation rules:

- `sku`: positive whole number, unique in the database, at most 6 digits.
- `name`: text, required, at most 450 characters.
- `quantity`: whole number, zero or greater.

## Database

Prisma manages a PostgreSQL `Product` table with these fields:

- `id`: UUID primary key.
- `sku`: unique integer SKU.
- `name`: product name.
- `quantity`: inventory quantity.
- `createdAt`: creation timestamp.
- `updatedAt`: automatic update timestamp.

The Prisma schema is in `apps/service/prisma/schema.prisma`, and generated
client code is emitted under `apps/service/src/generated/prisma`.

## Docker

The repository includes Dockerfiles for both applications:

- `apps/web/Dockerfile`: builds the Rsbuild static app and serves it with Nginx.
- `apps/service/Dockerfile`: builds the NestJS service and starts it through
  `apps/service/startup.sh`.

Docker Compose passes `REACT_APP_PUBLIC_API_URL` into the web build as a Docker
build argument. Rebuild the web image after changing that value.

Build and run the full stack:

```sh
docker compose up --build
```

Stop the stack:

```sh
docker compose down
```

Remove the local PostgreSQL volume when you need a clean database:

```sh
docker compose down -v
```

## k3s deployment

The k3s manifests live in `infrastructure/k3s/apps` and use the `stock-sync`
namespace. They define PostgreSQL, the NestJS service, the web app, services,
config maps, secrets, and a Traefik ingress.

Before applying the manifests, review and update these files for your cluster:

- `infrastructure/k3s/apps/secrets/stock-sync-secret.yaml`: PostgreSQL and
  service secret values.
- `infrastructure/k3s/apps/configmap.yaml`: service runtime config.
- `infrastructure/k3s/apps/web/configmap.yaml`: web container environment.
  Public web variables still need to be available when the static web image is
  built.
- `infrastructure/k3s/apps/ingress.yaml`: local hostnames and routing.

Sync local images into k3s and deploy:

```sh
pnpm k3s:sync-local-images
```

This script builds timestamped local tags for `stock-sync-web` and
`stock-sync-service`, imports them into k3s containerd, applies the kustomize
manifests, updates the running deployments, and waits for rollout completion.

Preview the commands without changing Docker or k3s:

```sh
pnpm k3s:sync-local-images -- --dry-run
```

Useful options:

- `--tag <tag>`: use a specific image tag.
- `--namespace <namespace>`: deploy to a different namespace.
- `--no-rollout-wait`: skip rollout waiting.

Environment overrides:

- `DOCKER`: Docker command, default `docker`.
- `KUBECTL`: kubectl command, default `kubectl`.
- `K3S_CTR`: k3s import command, default `sudo k3s ctr`.
- `IMAGE_TAG`: image tag, default `local-YYYYmmddHHMMSS`.
- `KUBE_NAMESPACE`: Kubernetes namespace, default `stock-sync`.
- `KUSTOMIZE_DIR`: kustomize directory, default `infrastructure/k3s/apps`.

If `kubectl` cannot read `/etc/rancher/k3s/k3s.yaml`, install the included k3s
server config and restart k3s so it writes a user-readable kubeconfig:

```sh
sudo install -m 0644 infrastructure/k3s/cluster/config.yaml /etc/rancher/k3s/config.yaml
sudo systemctl restart k3s
```

Make sure the ingress hostnames in `infrastructure/k3s/apps/ingress.yaml`
resolve to your k3s node through DNS or `/etc/hosts`.

## Testing and CI

CI runs linting, formatting checks, type checks, tests, and builds on pushes to
`master` and pull requests. The workflow is defined in `.github/workflows/ci.yml`.

Run the same checks locally:

```sh
pnpm lint
pnpm format:check
pnpm check-types
pnpm test
pnpm build
```

The web e2e tests require Playwright Chromium:

```sh
pnpm --filter web exec playwright install --with-deps chromium
pnpm --filter web test:e2e
```

## Troubleshooting

- If the API cannot connect to PostgreSQL, verify `DATABASE_URL` matches where
  the service is running. Use `postgres` inside Docker Compose and `localhost`
  when running the service directly on the host.
- If the web app cannot reach the API, verify `REACT_APP_PUBLIC_API_URL` was set
  before building or starting the web app.
- If the Docker-served web app is blocked by Content Security Policy, update
  `apps/web/nginx.conf` so `connect-src` allows the configured API origin, then
  rebuild the web image.
- If product changes show as pending, the web app could not complete the API
  mutation. Visit `/pending-operations` to retry or discard the queued changes.
- If k3s pods fail with image pull errors, verify the local images were imported
  with `pnpm k3s:sync-local-images` and the deployments use
  `imagePullPolicy: Never`.
