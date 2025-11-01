# -------------------------
# 1️⃣ Base Build Stage
# -------------------------
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy only package files first (for caching)
COPY package*.json ./

# Install all dependencies (including devDeps for build)
RUN npm install

# Copy rest of the app
COPY . .

# Build TypeScript to /dist
RUN npm run build


# -------------------------
# 2️⃣ Production Stage
# -------------------------
FROM node:20-slim

WORKDIR /app

# Copy only what’s needed for production
COPY package*.json ./
RUN npm install --omit=dev

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Copy any env or config files you might need
COPY tsconfig.json ./

# Environment setup
ENV NODE_ENV=production
EXPOSE 4000

# Start the app
CMD ["node", "dist/index.js"]
