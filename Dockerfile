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

# Push database schema
RUN npx prisma db push

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the app
CMD ["npm", "run", "start"]
