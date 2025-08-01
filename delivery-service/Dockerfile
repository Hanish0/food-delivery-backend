FROM node:18-alpine
WORKDIR /app

# Copy root package.json and shared dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY shared/ ./shared/

# Copy service-specific files
COPY delivery-service/package*.json ./delivery-service/
COPY delivery-service/tsconfig.json ./delivery-service/

# Install dependencies
WORKDIR /app/delivery-service
RUN npm install

# Copy service source code
COPY delivery-service/src/ ./src/

# Build the service
RUN npm run build

EXPOSE 3003
CMD ["npm", "start"]