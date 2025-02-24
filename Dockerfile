# Use Node.js 22 as the base image
FROM node:22

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Hardcode DATABASE_URL inside the container
ENV DATABASE_URL="postgresql://nestdb_owner:npg_EmxM8RHBOw6a@ep-nameless-bird-a18qlch8-pooler.ap-southeast-1.aws.neon.tech/nestdb?sslmode=require"

# Expose port
EXPOSE 8000

# Generate Prisma client
RUN npx prisma generate

# Run Prisma migrations before starting the app
CMD npx prisma migrate deploy && npm run start:prod
