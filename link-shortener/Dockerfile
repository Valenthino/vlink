# Stage 1: Build the Next.js application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies.
COPY package.json yarn.lock* package-lock.json* ./
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

# Copy the rest of the application code.
COPY . .

# Build the Next.js application.
RUN npm run build

# Stage 2: Run the production image
FROM node:18-alpine AS runner
WORKDIR /app

# Copy built files and necessary configuration from the builder stage.
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port 3000.
EXPOSE 3000

# Set the environment to production.
ENV NODE_ENV production

# Start the Next.js application.
CMD ["npm", "start"]
