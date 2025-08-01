const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/food_delivery',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Setting up database...');
    const migrationSQL = fs.readFileSync(path.join(__dirname, '../migrations/init.sql'), 'utf8');
    await pool.query(migrationSQL);
    console.log('Database setup completed successfully!');

    // Insert sample data
    console.log('Inserting sample data...');

    // Sample user
    const userResult = await pool.query(`
      INSERT INTO users (name, email, phone, address) 
      VALUES ('John Doe', 'john.doe@example.com', '+1234567890', '123 Main St, City, State 12345')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    // Sample restaurant
    const restaurantResult = await pool.query(`
      INSERT INTO restaurants (name, address, phone, email, opening_time, closing_time) 
      VALUES ('Pizza Palace', '456 Food St, City, State', '+1987654321', 'info@pizzapalace.com', '10:00:00', '23:00:00')
      ON CONFLICT (email) DO NOTHING
      RETURNING id
    `);

    if (restaurantResult.rows.length > 0) {
      const restaurantId = restaurantResult.rows[0].id;
      
      // Sample menu items
      await pool.query(`
        INSERT INTO menu_items (restaurant_id, name, description, price, category)
        VALUES 
          ($1, 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, 'Pizza'),
          ($1, 'Pepperoni Pizza', 'Pizza with pepperoni and mozzarella cheese', 14.99, 'Pizza'),
          ($1, 'Caesar Salad', 'Fresh romaine lettuce with Caesar dressing', 8.99, 'Salads')
        ON CONFLICT DO NOTHING
      `, [restaurantId]);
    }

    // Sample delivery agent
    await pool.query(`
      INSERT INTO delivery_agents (name, phone, email, current_location) 
      VALUES ('Mike Johnson', '+1555123456', 'mike.johnson@delivery.com', 'Downtown Area')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('Sample data inserted successfully!');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();