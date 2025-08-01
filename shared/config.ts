import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/food_delivery',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
  },

  // Services
  services: {
    user: {
      url: process.env.USER_SERVICE_URL || 'http://localhost:3001',
      port: parseInt(process.env.USER_SERVICE_PORT || '3001'),
    },
    restaurant: {
      url: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3002',
      port: parseInt(process.env.RESTAURANT_SERVICE_PORT || '3002'),
    },
    delivery: {
      url: process.env.DELIVERY_SERVICE_URL || 'http://localhost:3003',
      port: parseInt(process.env.DELIVERY_SERVICE_PORT || '3003'),
    },
  },

  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',

  // Security
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};