import { Router } from 'express';
import { Database } from '../../../shared/database';

export const restaurantRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { name, address, phone, email, opening_time, closing_time } = req.body;
      
      if (!name || !address || !phone || !email || !opening_time || !closing_time) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await db.query(
        'INSERT INTO restaurants (name, address, phone, email, opening_time, closing_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, address, phone, email, opening_time, closing_time]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { is_online } = req.body;

      const result = await db.query(
        'UPDATE restaurants SET is_online = $1 WHERE id = $2 RETURNING *',
        [is_online, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};