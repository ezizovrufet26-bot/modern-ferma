#!/bin/sh
echo "=== Initializing database ==="
npx prisma db push --accept-data-loss
echo "=== Database ready ==="
echo "=== Starting Next.js on port ${PORT:-3000} ==="
npx next start -H 0.0.0.0 -p ${PORT:-3000}
