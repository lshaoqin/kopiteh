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

const stallsData = [
  {
    venue_id: 1,
    name: 'Hong Kee Beef Noodle',
    description: 'Famous Tangling Keok Road Cuppage Centre Beef Noodles',
    stall_image: 'https://i.pinimg.com/736x/32/b6/f0/32b6f024a935bc4263c5813cdbecbd1f.jpg',
    is_open: true,
    waiting_time: 5,
    categories: [
      {
        name: "Signatures",
        items: [
          {
            name: 'Signature Dry Beef Noodles',
            description: 'Dry noodles tossed in savory dark sauce.',
            price: 6.50,
            item_image: 'https://4.bp.blogspot.com/-F8yMcy-gWl0/V4Wk-R4ZqWI/AAAAAAAAHvY/k2Sl2l_TbEwJ1UEfTWHNbVubO6KFBqg1gCLcB/s1600/DSCF6841.JPG',
            prep_time: 5,
            sections: [
              {
                name: "Noodle Type", min: 1, max: 1,
                modifiers: [
                  { name: "Kway Teow", price: 0 },
                  { name: "Yellow Noodle", price: 0 },
                  { name: "Thick Bee Hoon", price: 0 }
                ]
              },
              {
                name: "Add-ons", min: 0, max: 5,
                modifiers: [
                  { name: "Extra Beef", price: 2.00 },
                  { name: "Extra Balls", price: 1.50 }
                ]
              }
            ]
          }
        ]
      },
      {
        name: "Soup",
        items: [
          {
            name: 'Sliced Beef Soup',
            description: 'Comforting herbal beef broth with tender slices.',
            price: 7.00,
            item_image: 'https://farm1.staticflickr.com/932/43378519961_7509d3000b_c.jpg',
            prep_time: 5,
            sections: [],
            modifiers: [] 
          }
        ]
      }
    ]
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
      {
        name: "Choice of Noodle",
        min: 1,
        max: 1,
        modifiers: [
          { name: "Kway Teow", price: 0 },
          { name: "Yellow Noodle", price: 0 },
          { name: "Thick Bee Hoon", price: 0 },
        ],
      },
      {
        name: "Spiciness Level",
        min: 1,
        max: 1,
        modifiers: [
          { name: "Chili", price: 0 },
          { name: "No Chili", price: 0 },
        ],
      },
      {
        name: "Add-ons",
        min: 0,
        max: 5,
        modifiers: [
          { name: "Extra Beef Slices", price: 2.0 },
          { name: "Extra Beef Balls", price: 1.5 },
        ],
      },
    ],    
  },
  {
    stall_id: 1,
    name: 'Sliced Beef Soup',
    description: 'Comforting herbal beef broth with tender slices.',
    price: 7.00,
    item_image: '',
    prep_time: 5,
    sections: [
      {
        name: "Options",
        min: 0,
        max: 1,
        modifiers: [
          { name: "Add Rice", price: 1.00 },
          { name: "No Spring Onions", price: 0 }
        ]
      }
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
    sections: [
      {
        name: "Temperature",
        min: 1,
        max: 1,
        modifiers: [
          { name: "Hot", price: 0 },
          { name: "Iced", price: 0.50 },
          { name: "Siew Dai (Less Sugar)", price: 0 },
          { name: "Kosong (No Sugar)", price: 0 }
        ]
      }
    ]
  },
  {
    stall_id: 2,
    name: 'Milo Dinosaur',
    description: 'Iced Milo topped with a mountain of Milo powder.',
    price: 3.50,
    item_image: '',
    prep_time: 2,
    sections: []
  }
];


const tables = [
  { venue_id: 1, table_number: 'A1', qr_code: 'https://example.com/qr/a1.png' },
  { venue_id: 1, table_number: 'A2', qr_code: 'https://example.com/qr/a2.png' },
  { venue_id: 1, table_number: 'A3', qr_code: 'https://example.com/qr/a3.png' },
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
      for (const stall of stallsData) {
        const stallRes = await pool.query(
          `INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1, $2, $3, $4, $5, $6) returning stall_id`,
          [stall.venue_id, stall.name, stall.description, stall.stall_image, stall.is_open, stall.waiting_time],
        );
        const stallId = stallRes.rows[0].stall_id;
        // Default menu item for order items to reference
        await pool.query(
          `INSERT INTO menu_item (stall_id, name) VALUES ($1, 'Default Item')`,
          [stallId]
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

        // Insert Sections + Modifiers
        for (const section of item.sections) {
          const sectionRes = await pool.query(
            `
            INSERT INTO menu_item_modifier_section
              (item_id, name, min_selections, max_selections)
            VALUES ($1, $2, $3, $4)
            RETURNING section_id
            `,
            [itemId, section.name, section.min, section.max]
          );

          const sectionId = sectionRes.rows[0].section_id;

          for (const mod of section.modifiers) {
            await pool.query(
              `
              INSERT INTO menu_item_modifier
                (section_id, item_id, name, price_modifier, is_available)
              VALUES ($1, $2, $3, $4, TRUE)
              `,
              [sectionId, itemId, mod.name, mod.price]
            );
          }
        }
      }
      console.log('Menu items seeded.');
    } else {
        console.log('Menu items already exist. Skipping.');
    }

    // 4. Tables
    const existingTables = await pool.query('SELECT 1 FROM "table" LIMIT 1');
    if ((existingTables.rowCount ?? 0) === 0) {
      for (const table of tables) {
        await pool.query(
          `INSERT INTO "table" (venue_id, table_number, qr_code) VALUES ($1, $2, $3)`,
          [table.venue_id, table.table_number, table.qr_code],
        );
      }
      console.log('Venue Table table seeded.');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

seed();