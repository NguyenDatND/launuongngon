#!/bin/sh
set -e
# Run migrations when DATABASE_URL is set (e.g. in docker-compose)
if [ -n "$DATABASE_URL" ]; then
  npx prisma migrate deploy
fi
exec "$@"
