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
  }
];

const menuItems = [
  // --- STALL 1 ITEMS ---
  {
    stall_id: 1,
    name: 'Signature Dry Beef Noodles',
    description: 'Dry noodles tossed in savory dark sauce, topped with beef slices and balls.',
    price: 6.50,
    item_image: '',
    prep_time: 5,
    // Sections: Headers for choices
    sections: [
        { name: "Choice of Noodle", min: 1, max: 1 },
        { name: "Spiciness Level", min: 1, max: 1 },
        { name: "Add-ons", min: 0, max: 5 }
    ],
    // Modifiers: The actual choices
    modifiers: [
        { name: "Kway Teow", price: 0 },
        { name: "Yellow Noodle", price: 0 },
        { name: "Thick Bee Hoon", price: 0 },
        { name: "Chili", price: 0 },
        { name: "No Chili", price: 0 },
        { name: "Extra Beef Slices", price: 2.00 },
        { name: "Extra Beef Balls", price: 1.50 }
    ]
  },
  {
    stall_id: 1,
    name: 'Sliced Beef Soup',
    description: 'Comforting herbal beef broth with tender slices.',
    price: 7.00,
    item_image: '',
    prep_time: 5,
    sections: [{ name: "Options", min: 0, max: 1 }],
    modifiers: [
        { name: "Add Rice", price: 1.00 },
        { name: "No Spring Onions", price: 0 }
    ]
  },

  // --- STALL 2 ITEMS (Drinks) ---
  {
    stall_id: 2,
    name: 'Kopi O',
    description: 'Traditional black coffee with sugar.',
    price: 1.40,
    item_image: '',
    prep_time: 2,
    sections: [{ name: "Temperature", min: 1, max: 1 }],
    modifiers: [
        { name: "Hot", price: 0 },
        { name: "Iced", price: 0.50 },
        { name: "Siew Dai (Less Sugar)", price: 0 },
        { name: "Kosong (No Sugar)", price: 0 }
    ]
  },
  {
    stall_id: 2,
    name: 'Milo Dinosaur',
    description: 'Iced Milo topped with a mountain of Milo powder.',
    price: 3.50,
    item_image: '',
    prep_time: 2,
    sections: [],
    modifiers: []
  }
];

async function seed() {
  try {
    // 1. Venues
    const existingVenues = await pool.query('SELECT 1 FROM venue LIMIT 1');
    if ((existingVenues.rowCount ?? 0) === 0) {
      for (const venue of venues) {
        await pool.query(
          `INSERT INTO venue (name, address, description, image_url, opening_hours) VALUES ($1, $2, $3, $4, $5)`,
          [venue.name, venue.address, venue.description, venue.image_url, venue.opening_hours],
        );
      }
      console.log('Venue table seeded.');
    }

    // 2. Stalls
    const existingStalls = await pool.query('SELECT 1 FROM stall LIMIT 1');
    if ((existingStalls.rowCount ?? 0) === 0) {
      for (const stall of stalls) {
        await pool.query(
          `INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1, $2, $3, $4, $5, $6)`,
          [stall.venue_id, stall.name, stall.description, stall.stall_image, stall.is_open, stall.waiting_time],
        );
      }
      console.log('Stall table seeded.');
    }

    // 3. Menu Items
    const existingItems = await pool.query('SELECT 1 FROM menu_item LIMIT 1');
    if ((existingItems.rowCount ?? 0) === 0) {
      console.log('Seeding menu items...');
      for (const item of menuItems) {
        // Insert Item
        const itemRes = await pool.query(
          `INSERT INTO menu_item (stall_id, name, description, price, item_image, prep_time, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING item_id`,
          [item.stall_id, item.name, item.description, item.price, item.item_image, 2, true]
        );
        const itemId = itemRes.rows[0].item_id;

        // Insert Sections
        if (item.sections) {
            for (const section of item.sections) {
                await pool.query(
                    `INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections)
                     VALUES ($1, $2, $3, $4)`,
                    [itemId, section.name, section.min, section.max]
                );
            }
        }

        // Insert Modifiers
        if (item.modifiers) {
            for (const mod of item.modifiers) {
                await pool.query(
                    `INSERT INTO menu_item_modifier (item_id, name, price_modifier, is_available)
                     VALUES ($1, $2, $3, $4)`,
                    [itemId, mod.name, mod.price, true]
                );
            }
        }
      }
      console.log('Menu items seeded.');
    } else {
        console.log('Menu items already exist. Skipping.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

seed();