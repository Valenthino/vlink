# Stage 1: Building the code
FROM node:18-alpine AS builder

WORKDIR /app

# Add build arguments
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Running the app
FROM node:18-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV MONGODB_URI=$MONGODB_URI

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"] 