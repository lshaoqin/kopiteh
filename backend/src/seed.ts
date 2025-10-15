//This file seeds the database with mock data. Seed 1 is for testing mock data

import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'volunteer-switchboard-db',
  password: process.env.POSTGRES_PASSWORD || 'dgvs123',
  port: 5432,
});

async function seed_mock() {
  try {
    // Create stalls table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS stalls (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(200) NOT NULL,
        cuisine_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data
    await pool.query(`
      INSERT INTO stalls (name, location, cuisine_type) VALUES
      ('Chicken Rice', 'Block 1 Jln Kukoh Food Centre', 'Chinese'),
      ('Nasi Lemak', 'Block 1 Jln Kukoh Food Centre', 'Malay'),
      ('Prata', 'Block 1 Jln Kukoh Food Centre', 'Indian')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed_mock();