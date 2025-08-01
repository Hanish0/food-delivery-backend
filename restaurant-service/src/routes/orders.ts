import { Router } from 'express';
import axios from 'axios';
import { Database } from '../../../shared/database';
import { config } from '../../../shared/config';

export const orderRoutes = (db: Database) => {
  const router = Router();

  router.post('/:id/notify', async (req, res) => {
    try {
      const { id } = req.params;
      // Handle order notification logic here
      res.json({ message: 'Order notification received', order_id: id });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status, restaurant_id } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['accepted', 'rejected', 'preparing', 'ready'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const result = await db.query(
        'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND restaurant_id = $3 RETURNING *',
        [status, id, restaurant_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // If order is accepted, assign a delivery agent
      if (status === 'accepted') {
        try {
          const agentResult = await db.query(
            'SELECT id FROM delivery_agents WHERE is_available = true ORDER BY RANDOM() LIMIT 1'
          );

          if (agentResult.rows.length > 0) {
            const agent_id = agentResult.rows[0].id;
            
            await db.query(
              'UPDATE orders SET delivery_agent_id = $1 WHERE id = $2',
              [agent_id, id]
            );

            await db.query(
              'UPDATE delivery_agents SET is_available = false WHERE id = $1',
              [agent_id]
            );

            // Notify delivery service
            try {
              await axios.post(`${config.services.delivery.url}/api/assignments`, {
                order_id: id,
                delivery_agent_id: agent_id
              });
            } catch (error) {
              console.error('Failed to notify delivery service:', error);
            }
          }
        } catch (error) {
          console.error('Failed to assign delivery agent:', error);
        }
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/restaurant/:restaurant_id', async (req, res) => {
    try {
      const { restaurant_id } = req.params;
      const { status } = req.query;

      let query = `
        SELECT o.*, u.name as user_name,
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.id,
                   'menu_item_name', m.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE o.restaurant_id = $1
      `;

      const params = [restaurant_id];

      if (status) {
        query += ' AND o.status = $2';
        params.push(status as string);
      }

      query += ' GROUP BY o.id, u.name ORDER BY o.created_at DESC';

      const result = await db.query(query, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};