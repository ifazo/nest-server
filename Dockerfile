# Use Node.js 22 as the base image
FROM node:22

# Install Redis and Supervisor
RUN apt-get update && apt-get install -y redis-server supervisor

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV DATABASE_URL="postgresql://nestdb_owner:npg_EmxM8RHBOw6a@ep-nameless-bird-a18qlch8-pooler.ap-southeast-1.aws.neon.tech/nestdb?sslmode=require"

# Run Prisma migrations and generate client after install
RUN npm run prisma:deploy && npm run prisma:generate

# Build the NestJS application (compile TypeScript to JavaScript)
RUN npm run build

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the ports
EXPOSE 8000 6379

# Start all services using Supervisor
CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]