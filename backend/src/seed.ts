import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const venues = [
  {
    name: 'Kopiteh Central',
    address: '123 Market Street',
    description: 'A cosy hawker centre featuring local favourites.',
    image_url: 'https://example.com/images/kopiteh-central.jpg',
    opening_hours: '08:00 - 22:00',
  },
  {
    name: 'Sunrise Hawker Hub',
    address: '456 Sunrise Way',
    description: 'Breakfast stalls with freshly brewed kopi and kaya toast.',
    image_url: 'https://example.com/images/sunrise-hawker-hub.jpg',
    opening_hours: '06:00 - 14:00',
  },
];

async function seed() {
  try {
    const existing = await pool.query('SELECT 1 FROM venue LIMIT 1');
    if ((existing.rowCount ?? 0) > 0) {
      console.log('Venue table already populated. Skipping seed.');
      return;
    }

    for (const venue of venues) {
      await pool.query(
        `
        INSERT INTO venue (name, address, description, image_url, opening_hours)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [venue.name, venue.address, venue.description, venue.image_url, venue.opening_hours],
      );
    }

    console.log('Venue table seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
