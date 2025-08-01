import { Router } from 'express';
import axios from 'axios';
import { Database } from '../../../shared/database';
import { config } from '../../../shared/config';

export const orderRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');

      const { user_id, restaurant_id, items, delivery_address } = req.body;

      if (!user_id || !restaurant_id || !items || !delivery_address || items.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Invalid order data' });
      }

      // Verify menu items exist and are available
      const menuItemsResult = await client.query(
        'SELECT * FROM menu_items WHERE id = ANY($1) AND restaurant_id = $2 AND is_available = true',
        [items.map((item: any) => item.menu_item_id), restaurant_id]
      );

      if (menuItemsResult.rows.length !== items.length) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Some items are not available' });
      }

      // Calculate total amount
      const total_amount = items.reduce((total: number, item: any) => {
        const menuItem = menuItemsResult.rows.find(mi => mi.id === item.menu_item_id);
        return total + (menuItem.price * item.quantity);
      }, 0);

      // Create order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, restaurant_id, total_amount, delivery_address) VALUES ($1, $2, $3, $4) RETURNING *',
        [user_id, restaurant_id, total_amount, delivery_address]
      );

      const order = orderResult.rows[0];

      // Create order items
      for (const item of items) {
        const menuItem = menuItemsResult.rows.find(mi => mi.id === item.menu_item_id);
        await client.query(
          'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ($1, $2, $3, $4)',
          [order.id, item.menu_item_id, item.quantity, menuItem.price]
        );
      }

      await client.query('COMMIT');

      // Notify restaurant service
      try {
        await axios.post(`${config.services.restaurant.url}/api/orders/${order.id}/notify`);
      } catch (error) {
        console.error('Failed to notify restaurant service:', error);
      }

      res.status(201).json(order);
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  });

  router.get('/user/:user_id', async (req, res) => {
    try {
      const { user_id } = req.params;
      
      const result = await db.query(`
        SELECT o.*, r.name as restaurant_name,
               JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', oi.id,
                   'menu_item_name', m.name,
                   'quantity', oi.quantity,
                   'price', oi.price
                 )
               ) as items
        FROM orders o
        JOIN restaurants r ON o.restaurant_id = r.id
        LEFT JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN menu_items m ON oi.menu_item_id = m.id
        WHERE o.user_id = $1
        GROUP BY o.id, r.name
        ORDER BY o.created_at DESC
      `, [user_id]);

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};