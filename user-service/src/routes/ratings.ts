import { Router } from 'express';
import { Database } from '../../../shared/database';

export const ratingRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { user_id, order_id, restaurant_rating, delivery_agent_rating, restaurant_review, delivery_review } = req.body;

      if (!user_id || !order_id) {
        return res.status(400).json({ error: 'User ID and Order ID are required' });
      }

      // Verify order exists and is delivered
      const orderResult = await db.query(
        'SELECT * FROM orders WHERE id = $1 AND user_id = $2 AND status = $3',
        [order_id, user_id, 'delivered']
      );

      if (orderResult.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found or not delivered' });
      }

      // Check if rating already exists
      const existingRating = await db.query(
        'SELECT * FROM ratings WHERE order_id = $1',
        [order_id]
      );

      if (existingRating.rows.length > 0) {
        return res.status(409).json({ error: 'Rating already exists for this order' });
      }

      const result = await db.query(
        'INSERT INTO ratings (user_id, order_id, restaurant_rating, delivery_agent_rating, restaurant_review, delivery_review) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [user_id, order_id, restaurant_rating, delivery_agent_rating, restaurant_review, delivery_review]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};