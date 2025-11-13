FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create directories for persistent storage
RUN mkdir -p uploads /mnt/data

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
