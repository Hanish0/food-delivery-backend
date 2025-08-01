import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Database } from '../../shared/database';
import { config } from '../../shared/config';
import { agentRoutes } from './routes/agents';
import { deliveryRoutes } from './routes/deliveries';

const app = express();
const PORT = config.services.delivery.port;

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests
});

app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json());

const db = new Database();

app.use('/api/agents', agentRoutes(db));
app.use('/api', deliveryRoutes(db));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'delivery-service' });
});

app.listen(PORT, () => {
  console.log(`Delivery service running on port ${PORT}`);
});