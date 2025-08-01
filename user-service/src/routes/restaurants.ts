import { Router } from 'express';
import { Database } from '../../../shared/database';

export const restaurantRoutes = (db: Database) => {
  const router = Router();

  router.get('/available', async (req, res) => {
    try {
      const currentTime = new Date().toTimeString().split(' ')[0];
      
      const result = await db.query(`
        SELECT r.*, 
               COALESCE(JSON_AGG(
                 JSON_BUILD_OBJECT(
                   'id', m.id,
                   'name', m.name,
                   'description', m.description,
                   'price', m.price,
                   'category', m.category,
                   'is_available', m.is_available
                 )
               ) FILTER (WHERE m.id IS NOT NULL), '[]') as menu_items
        FROM restaurants r
        LEFT JOIN menu_items m ON r.id = m.restaurant_id AND m.is_available = true
        WHERE r.is_online = true 
          AND r.opening_time <= $1 
          AND r.closing_time >= $1
        GROUP BY r.id
        ORDER BY r.name
      `, [currentTime]);

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/:id/menu', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await db.query(
        'SELECT * FROM menu_items WHERE restaurant_id = $1 AND is_available = true ORDER BY category, name',
        [id]
      );

      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};