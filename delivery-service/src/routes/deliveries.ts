import { Router } from 'express';
import { Database } from '../../../shared/database';

export const deliveryRoutes = (db: Database) => {
  const router = Router();

  router.post('/assignments', async (req, res) => {
    try {
      const { order_id, delivery_agent_id } = req.body;
      // Handle assignment logic here
      res.json({ message: 'Assignment received', order_id, delivery_agent_id });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/deliveries/:order_id/status', async (req, res) => {
    try {
      const { order_id } = req.params;
      const { status, delivery_agent_id } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['picked_up', 'delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND delivery_agent_id = $3 RETURNING *',
        [status, order_id, delivery_agent_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found or not assigned to this agent' });
      }

      // If delivered, make agent available again
      if (status === 'delivered') {
        await db.query(
          'UPDATE delivery_agents SET is_available = true WHERE id = $1',
          [delivery_agent_id]
        );
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/deliveries/agent/:agent_id', async (req, res) => {
    try {
      const { agent_id } = req.params;
      const { status } = req.query;

      let query = `
        SELECT o.*, r.name as restaurant_name, r.address as restaurant_address,
               u.name as user_name, u.phone as user_phone
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        JOIN users u ON o.user_id = u.id
        WHERE o.delivery_agent_id = $1
      `;

      const params = [agent_id];

      if (status) {
        query += ' AND o.status = $2';
        params.push(status as string);
      }

      query += ' ORDER BY o.created_at DESC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};