FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for Tailwind)
RUN npm ci

# Copy all source files
COPY . .

# Generate Prisma client (does not need DATABASE_URL)
RUN npx prisma generate

# Build Next.js (Tailwind CSS compiles here)
RUN npm run build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start: push DB schema first, then start Next.js
CMD ["sh", "-c", "npx prisma db push && npm run start"]
