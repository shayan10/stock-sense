# Stage 1: Install dependencies
FROM node:18 as dependencies

WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install -g npm
RUN npm install -g kysely-codegen ts-node
RUN npm install

# Stage 2: Build the application
FROM node:18 as build

WORKDIR /app

# Copy the application code from the previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Make the script executable
RUN chmod +x entrypoint.sh

# Expose port 4040 for Socket.io
EXPOSE 4040

# Set the custom script as the CMD instruction
CMD ["./wait-for-it.sh", "postgres:5432", "--", "./wait-for-it.sh", "redis:6379", "--", "./entrypoint.sh"]
