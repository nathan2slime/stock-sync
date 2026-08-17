# syntax=docker/dockerfile:1

FROM node:24-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/service/package.json apps/service/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/rslint-config/package.json packages/rslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build

COPY . .

RUN pnpm --filter service build

FROM node:22-alpine AS runner

ENV NODE_ENV="production"
ENV PNPM_HOME="/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"
ENV PORT="5400"

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY --from=build /repo ./

EXPOSE 5400

CMD ["pnpm", "--filter", "service", "start"]
