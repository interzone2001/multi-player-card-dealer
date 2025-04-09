# Use Node.js LTS version as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files for both backend and frontend
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies for both backend and frontend
RUN npm install
RUN cd client && npm install

# Copy the rest of the application
COPY . .

# Build the React application
RUN cd client && npm run build

# Expose port
EXPOSE 3000

# Start both frontend and backend
CMD ["npm", "run", "dev:full"] 