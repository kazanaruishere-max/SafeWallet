# v3/gateway-nest/Dockerfile
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with legacy-peer-deps to avoid conflicts
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Build the application
COPY . .
RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Standard production command
CMD ["npm", "run", "start:prod"]
