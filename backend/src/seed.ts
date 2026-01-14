import dotenv from "dotenv";
import pool from "./config/database";

dotenv.config();

// --- 1. DEFINE DATA ---

const venues = [
  {
    name: "Kopiteh Central",
    address: "123 Market Street",
    description: "A cosy hawker centre featuring local favourites.",
    image_url: "https://example.com/images/kopiteh-central.jpg",
    opening_hours: "08:00 - 22:00",
  },
];

const stalls = [
  {
    venue_id: 1,
    name: "Hong Kee Beef Noodle",
    description: "Famous Tangling Keok Road Cuppage Centre Beef Noodles",
    stall_image:
      "https://i.pinimg.com/736x/32/b6/f0/32b6f024a935bc4263c5813cdbecbd1f.jpg",
    is_open: true,
    waiting_time: 5,
  },
  {
    venue_id: 1,
    name: "Drink Stall",
    stall_image:
      "https://cache-wak-wak-hawker-com.s3-ap-southeast-1.amazonaws.com/data/images/stall/66/966/block/K8j1sy0mi7BlqZYa_ogp.jpg?v=1612187094",
    is_open: true,
    waiting_time: 2,
  }
];

const menuItems = [
  // === STALL 2: DRINKS (Matching your UI Screenshot) ===
  {
    stall_id: 2,
    name: 'Kopi',
    description: 'Coffee with condensed milk',
    price: 1.40,
    item_image: 'https://thehoneycombers.com/singapore/uploads/2017/04/Kopi-O-local-coffee-in-Singapore.jpg',
    prep_time: 2,
    sections: [
      {
        name: "Choice",
        min: 1, // Required
        max: 1, // Radio button behavior
        modifiers: [
          { name: "Kopi", price: 0 },
          { name: "Kopi C (Evaporated Milk)", price: 0.20 },
          { name: "Kopi O Kosong (Black)", price: 0 }
        ]
      },
      {
        name: "Request",
        min: 0, // Optional
        max: 5, // Checkbox behavior
        modifiers: [
          { name: "Less sugar", price: 0 },
          { name: "No Condensed Milk", price: 0 },
          { name: "Dairy-free Milk", price: 1.00 }
        ]
      }
    ]
  },
  {
    stall_id: 2,
    name: 'Teh',
    description: 'Tea with condensed milk',
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
          { name: "Iced", price: 0.50 }
        ]
      }
    ]
  },

  // === STALL 1: BEEF NOODLES ===
  {
    stall_id: 1,
    name: 'Signature Dry Beef Noodles',
    description: 'Dry noodles tossed in savory dark sauce.',
    price: 6.50,
    item_image: 'https://4.bp.blogspot.com/-F8yMcy-gWl0/V4Wk-R4ZqWI/AAAAAAAAHvY/k2Sl2l_TbEwJ1UEfTWHNbVubO6KFBqg1gCLcB/s1600/DSCF6841.JPG',
    prep_time: 5,
    sections: [
      {
        name: "Noodle Type",
        min: 1,
        max: 1,
        modifiers: [
          { name: "Kway Teow", price: 0 },
          { name: "Yellow Noodle", price: 0 },
          { name: "Thick Bee Hoon", price: 0 }
        ]
      },
      {
        name: "Add-ons",
        min: 0,
        max: 5,
        modifiers: [
          { name: "Extra Beef", price: 2.00 },
          { name: "Extra Balls", price: 1.50 }
        ]
      }
    ]
  }
];

// --- 2. SEED FUNCTION ---

async function seed() {
  try {
    console.log('Starting seed...');

    // A. Clean existing data to avoid conflicts during dev
    await pool.query(`
      TRUNCATE TABLE venue, stall, menu_item, menu_item_modifier, menu_item_modifier_section 
      RESTART IDENTITY CASCADE;
    `);
    console.log('Database cleared.');

    // B. Insert Venues
    for (const venue of venues) {
      await pool.query(
        `INSERT INTO venue (name, address, description, image_url, opening_hours) VALUES ($1, $2, $3, $4, $5)`,
        [venue.name, venue.address, venue.description, venue.image_url, venue.opening_hours],
      );
    }
    console.log('Venues seeded.');

    // C. Insert Stalls
    for (const stall of stalls) {
      await pool.query(
        `INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1, $2, $3, $4, $5, $6)`,
        [stall.venue_id, stall.name, stall.description, stall.stall_image, stall.is_open, stall.waiting_time],
      );
    }
    console.log('Stalls seeded.');

    // D. Insert Menu Items, Sections, and Modifiers
    for (const item of menuItems) {
      // 1. Insert Item
      const itemRes = await pool.query(
        `INSERT INTO menu_item (stall_id, name, description, price, item_image, prep_time, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING item_id`,
        [item.stall_id, item.name, item.description, item.price, item.item_image, item.prep_time, true]
      );
      const itemId = itemRes.rows[0].item_id;

      if (item.sections) {
        for (const section of item.sections) {
          // 2. Insert Section (Links to Item)
          const sectionRes = await pool.query(
            `INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections)
             VALUES ($1, $2, $3, $4)
             RETURNING section_id`,
            [itemId, section.name, section.min, section.max]
          );
          const sectionId = sectionRes.rows[0].section_id;

          if (section.modifiers) {
            for (const mod of section.modifiers) {
              // 3. Insert Modifier (Links to Item AND Section)
              // NOTE: Your schema requires BOTH item_id and section_id
              await pool.query(
                `INSERT INTO menu_item_modifier (section_id, item_id, name, price_modifier, is_available)
                 VALUES ($1, $2, $3, $4, $5)`,
                [sectionId, itemId, mod.name, mod.price, true]
              );
            }
          }
        }
      }
    }
    console.log('Menu Items, Sections & Modifiers seeded.');
    console.log('Seed complete!');

      console.log("Menu items seeded.");
    } else {
      console.log("Menu items already exist. Skipping.");
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seed();
