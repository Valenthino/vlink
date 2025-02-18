# Stage 1: Building the code
FROM node:18-alpine AS builder

WORKDIR /app

# Add build arguments and set environment variables
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create public directory
RUN mkdir -p public

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Verify MongoDB URI is set
RUN if [ -z "$MONGODB_URI" ]; then echo "MongoDB URI is not set" && exit 1; fi

# Build the application
RUN npm run build

# Stage 2: Running the app
FROM node:18-alpine AS runner

WORKDIR /app

# Add runtime environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add MongoDB URI at runtime
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Install necessary utilities
RUN apk add --no-cache wget curl

# Create public directory
RUN mkdir -p public

# Copy necessary files from builder
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Verify MongoDB URI is set
RUN if [ -z "$MONGODB_URI" ]; then echo "MongoDB URI is not set" && exit 1; fi

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Add MongoDB connection check script
COPY <<'EOF' /app/check-mongodb.js
const { MongoClient } = require('mongodb');

async function checkConnection() {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set');
    process.exit(1);
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB');
    await client.close();
    process.exit(0);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

checkConnection();
EOF

# Verify MongoDB connection before starting
RUN node /app/check-mongodb.js

# Command to run the application
CMD ["node", "server.js"] 