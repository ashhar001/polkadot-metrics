# Dockerfile

# Use the official Node.js 16 image as the base image for the build stage
FROM node:16-alpine AS builder

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the production dependencies
RUN npm install --production

# Copy the rest of the application code to the working directory
COPY . .

# Use the official Node.js 16 image as the base image for the final stage
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the built application from the builder stage to the final stage
COPY --from=builder /usr/src/app ./

# Expose port 3000 to allow external access to the application
EXPOSE 3000

# Define the command to run the application
CMD [ "node", "index.js" ]
