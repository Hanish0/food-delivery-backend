FROM node:18-alpine
WORKDIR /app

# Copy root package.json and shared dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY shared/ ./shared/
COPY scripts/ ./scripts/
COPY migrations/ ./migrations/

# Copy service-specific files
COPY user-service/package*.json ./user-service/
COPY user-service/tsconfig.json ./user-service/

# Install dependencies
WORKDIR /app/user-service
RUN npm install

# Install root dependencies for migration script
WORKDIR /app
RUN npm install

# Copy service source code
WORKDIR /app/user-service
COPY user-service/src/ ./src/

# Build the service
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
