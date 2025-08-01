FROM node:18-alpine
WORKDIR /app

# Copy root package.json and shared dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY shared/ ./shared/

# Copy service-specific files
COPY restaurant-service/package*.json ./restaurant-service/
COPY restaurant-service/tsconfig.json ./restaurant-service/

# Install dependencies
WORKDIR /app/restaurant-service
RUN npm install

# Copy service source code
COPY restaurant-service/src/ ./src/

# Build the service
RUN npm run build

EXPOSE 3002
CMD ["npm", "start"]