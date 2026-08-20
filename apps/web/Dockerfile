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

ARG REACT_APP_PUBLIC_API_URL="/api"
ENV REACT_APP_PUBLIC_API_URL="${REACT_APP_PUBLIC_API_URL}"

COPY . .

RUN pnpm --filter web build

FROM nginx:1.27-alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80
