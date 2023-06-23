# Use a Node.js base image
FROM node:14 as base

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the entrypoint script
COPY entrypoint.sh /app

# Set the entrypoint script as the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Run the command to start your application
CMD ["npm", "run", "build"]
