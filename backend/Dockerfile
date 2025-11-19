# Use Node.js base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript to JS
RUN npx tsc

# Expose backend port
EXPOSE 4000

# Start the server
CMD ["node", "src/index.js"]