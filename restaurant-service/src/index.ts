import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Database } from '../../shared/database';
import { config } from '../../shared/config';
import { restaurantRoutes } from './routes/restaurants';
import { menuRoutes } from './routes/menu';
import { orderRoutes } from './routes/orders';

const app = express();
const PORT = config.services.restaurant.port;

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

const db = new Database();

app.use('/api/restaurants', restaurantRoutes(db));
app.use('/api/menu', menuRoutes(db));
app.use('/api/orders', orderRoutes(db));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'restaurant-service' });
});

app.listen(PORT, () => {
  console.log(`Restaurant service running on port ${PORT}`);
});