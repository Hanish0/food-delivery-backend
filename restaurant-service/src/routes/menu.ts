import { Router } from 'express';
import { Database } from '../../../shared/database';

export const menuRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { restaurant_id, name, description, price, category } = req.body;
      
      if (!restaurant_id || !name || !price || !category) {
        return res.status(400).json({ error: 'Restaurant ID, name, price, and category are required' });
      }

      const result = await db.query(
        'INSERT INTO menu_items (restaurant_id, name, description, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [restaurant_id, name, description, price, category]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, is_available, category } = req.body;

      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount++}`);
        values.push(name);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (price !== undefined) {
        updates.push(`price = $${paramCount++}`);
        values.push(price);
      }
      if (is_available !== undefined) {
        updates.push(`is_available = $${paramCount++}`);
        values.push(is_available);
      }
      if (category !== undefined) {
        updates.push(`category = $${paramCount++}`);
        values.push(category);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);
      const result = await db.query(
        `UPDATE menu_items SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Menu item not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/restaurant/:restaurant_id', async (req, res) => {
    try {
      const { restaurant_id } = req.params;
      const result = await db.query(
        'SELECT * FROM menu_items WHERE restaurant_id = $1 ORDER BY category, name',
        [restaurant_id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};