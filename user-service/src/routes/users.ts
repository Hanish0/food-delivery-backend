import { Router } from 'express';
import { Database } from '../../../shared/database';
import { User } from '../../../shared/types';

export const userRoutes = (db: Database) => {
  const router = Router();

  router.post('/', async (req, res) => {
    try {
      const { name, email, phone, address } = req.body;
      
      if (!name || !email || !phone || !address) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await db.query(
        'INSERT INTO users (name, email, phone, address) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, phone, address]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already exists' });
      }
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};