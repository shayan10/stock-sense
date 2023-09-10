# Use a Node.js base image
FROM node:16 as base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install -g kysely-codegen ts-node
RUN npm install

# Copy the rest of the application code
COPY . .

# Make the script executable
RUN chmod +x entrypoint.sh

# Expose port 4040 for Socket.io
EXPOSE 4040

# Set the custom script as the CMD instruction
CMD ["./wait-for-it.sh", "postgres:5432", "--", "./wait-for-it.sh", "redis:6379", "--", "./entrypoint.sh"]