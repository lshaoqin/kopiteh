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

const stalls = [
  {
    venue_id: 1,
    name: 'Hong Kee Beef Noodle',
    description: 'Famous Tangling Keok Road Cuppage Centre Beef Noodles',
    stall_image: 'https://i.pinimg.com/736x/32/b6/f0/32b6f024a935bc4263c5813cdbecbd1f.jpg',
    is_open: true,
    waiting_time: 5,
  },
  {
    venue_id: 1,
    name: 'Drink Stall',
    stall_image: 'https://cache-wak-wak-hawker-com.s3-ap-southeast-1.amazonaws.com/data/images/stall/66/966/block/K8j1sy0mi7BlqZYa_ogp.jpg?v=1612187094',
    is_open: true,
    waiting_time: 10,
  },
  {
    venue_id: 2,
    name: 'Kaya Toast Stall',
    description: 'Fresh kaya toast and kopi every morning',
    stall_image: 'https://danielfooddiary.com/wp-content/uploads/2024/03/Zheng-Ming-Cha-Shi-Hong-Lim-Food-Centre.jpg',
    is_open: true,
    waiting_time: 3,
  },
  {
    venue_id: 2,
    name: 'Nasi Lemak Stall',
    description: 'Delicious nasi lemak with a variety of sides',
    stall_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVEnJTzWGSRo3DmXz-OvYB49xDBMY34XNiVQ&s',
    is_open: false,
    waiting_time: 0,
  }
];

async function seed() {
  try {
    const existingVenues = await pool.query('SELECT 1 FROM venue LIMIT 1');
    if ((existingVenues.rowCount ?? 0) === 0) {
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
    } else {
      console.log('Venue table already populated. Skipping seed.');
    }

    const existingStalls = await pool.query('SELECT 1 FROM stall LIMIT 1');
    if ((existingStalls.rowCount ?? 0) === 0) {
      for (const stall of stalls) {
        await pool.query(
          `
          INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [stall.venue_id, stall.name, stall.description, stall.stall_image, stall.is_open, stall.waiting_time],
        );
      }
      console.log('Stall table seeded successfully.');
    } else {
      console.log('Stall table already populated. Skipping stall seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
