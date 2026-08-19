#!/bin/sh

set -e

pnpm --filter service exec prisma migrate deploy

exec pnpm --filter service start