import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Database } from '../../shared/database';
import { config } from '../../shared/config';
import { userRoutes } from './routes/users';
import { restaurantRoutes } from './routes/restaurants';
import { orderRoutes } from './routes/orders';
import { ratingRoutes } from './routes/ratings';

const app = express();
const PORT = config.services.user.port;

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

const db = new Database();

app.use('/api/users', userRoutes(db));
app.use('/api/restaurants', restaurantRoutes(db));
app.use('/api/orders', orderRoutes(db));
app.use('/api/ratings', ratingRoutes(db));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'user-service' });
});

app.listen(PORT, () => {
  console.log(`User service running on port ${PORT}`);
});