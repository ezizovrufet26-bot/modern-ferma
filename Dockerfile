FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (dev included for Tailwind CSS)
RUN npm ci

# Copy source files (excluding .next, node_modules via .dockerignore)
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js with explicit webpack (NOT turbopack)
RUN npx next build

# Verify .next/static exists and has CSS
RUN ls -la .next/static/css/ || echo "NO CSS FILES FOUND"
RUN ls -la .next/static/ || echo "NO STATIC DIR"

# Railway sets PORT via env var
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"

# Start: push DB schema, then start Next.js
CMD ["sh", "-c", "npx prisma db push && npx next start -H 0.0.0.0 -p ${PORT:-3000}"]
