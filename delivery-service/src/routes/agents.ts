import { Router } from 'express';
import { Database } from '../../../shared/database';

export const agentRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { name, phone, email, current_location } = req.body;
      
      if (!name || !phone || !email) {
        return res.status(400).json({ error: 'Name, phone, and email are required' });
      }

      const result = await db.query(
        'INSERT INTO delivery_agents (name, phone, email, current_location) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, phone, email, current_location]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/:id/availability', async (req, res) => {
    try {
      const { id } = req.params;
      const { is_available } = req.body;

      const result = await db.query(
        'UPDATE delivery_agents SET is_available = $1 WHERE id = $2 RETURNING *',
        [is_available, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.patch('/:id/location', async (req, res) => {
    try {
      const { id } = req.params;
      const { current_location } = req.body;

      const result = await db.query(
        'UPDATE delivery_agents SET current_location = $1 WHERE id = $2 RETURNING *',
        [current_location, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM delivery_agents WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Delivery agent not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};