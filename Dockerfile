FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for Tailwind)
RUN npm ci

# Copy all source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Railway sets PORT automatically, default to 3000
ENV HOSTNAME="0.0.0.0"

# Start: push DB schema first, then start Next.js on Railway's PORT
CMD ["sh", "-c", "npx prisma db push && npx next start -p ${PORT:-3000}"]
