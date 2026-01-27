import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const stallsData = [
  {
    name: 'Hong Kee Beef Noodle',
    description: 'Famous Tangling Keok Road Cuppage Centre Beef Noodles',
    stall_image: 'https://i.pinimg.com/736x/32/b6/f0/32b6f024a935bc4263c5813cdbecbd1f.jpg',
    waiting_time: 5,
    categories: [
      {
        name: "Signatures",
        sort_order: 1,
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
              }
            ]
          }
        ]
      },
      {
        name: "Soup",
        sort_order: 2,
        items: [
          {
            name: 'Sliced Beef Soup',
            description: 'Comforting herbal beef broth with tender slices.',
            price: 7.00,
            item_image: 'https://farm1.staticflickr.com/932/43378519961_7509d3000b_c.jpg',
            prep_time: 5,
            sections: [], modifiers: []
          }
        ]
      },
      {
        name: "Sides",
        sort_order: 3,
        items: [
          {
            name: 'Fried Beancurd Skin',
            description: 'Crispy sides to go with your noodles.',
            price: 2.50,
            item_image: '',
            prep_time: 3,
            sections: [], modifiers: []
          }
        ]
      }
    ]
  },
  {
    name: 'Drink Stall',
    stall_image: 'https://cache-wak-wak-hawker-com.s3-ap-southeast-1.amazonaws.com/data/images/stall/66/966/block/K8j1sy0mi7BlqZYa_ogp.jpg?v=1612187094',
    waiting_time: 2,
    categories: [
      {
        name: "Hot Drinks",
        sort_order: 1,
        items: [
          {
            name: 'Kopi',
            description: 'Coffee with condensed milk',
            price: 1.40,
            item_image: 'https://thehoneycombers.com/singapore/uploads/2017/04/Kopi-O-local-coffee-in-Singapore.jpg',
            prep_time: 2,
            sections: [
              {
                name: "Choice", min: 1, max: 1,
                modifiers: [
                  { name: "Kopi", price: 0 },
                  { name: "Kopi C", price: 0.20 },
                  { name: "Kopi O Kosong", price: 0 }
                ]
              }
            ]
          },
          {
            name: 'Teh',
            description: 'Tea with condensed milk',
            price: 1.40,
            item_image: '', 
            prep_time: 2,
            sections: []
          }
        ]
      },
      {
        name: "Cold Drinks",
        sort_order: 2,
        items: [
          {
            name: 'Milo Dinosaur',
            description: 'Iced Milo topped with a mountain of Milo powder.',
            price: 3.50,
            item_image: 'https://danielfooddiary.com/wp-content/uploads/2012/05/milo.jpg',
            prep_time: 2,
            sections: [], modifiers: []
          }
        ]
      }
    ]
  }
];

async function seed() {
  try {
    console.log('Starting seed...');
    
    // 1. CLEAR DB
    await pool.query(`TRUNCATE TABLE users, venue, "table", stall, menu_item_category, menu_item, menu_item_modifier_section, menu_item_modifier, "order", order_item, order_item_modifiers RESTART IDENTITY CASCADE;`);
    
    // 2. INSERT USER
    await pool.query(`INSERT INTO users (name, email, password_hash, role, is_authenticated) VALUES ('Guest User', 'guest@kopiteh.com', 'hash', 'user', true)`);

    // 3. INSERT VENUE
    const venueRes = await pool.query(`INSERT INTO venue (name, address, description, image_url, opening_hours) VALUES ($1, $2, $3, $4, $5) RETURNING venue_id`, ['Kopiteh Central', '123 Market St', 'Local', '', '08:00 - 22:00']);
    const venueId = venueRes.rows[0].venue_id;

    // 4. INSERT TABLES
    for (let i = 1; i <= 10; i++) {
        await pool.query(`INSERT INTO "table" (venue_id, table_number, qr_code) VALUES ($1, $2, $3)`, [venueId, String(i), `qr-code-table-${i}`]);
    }

    // 5. INSERT STALLS, CATEGORIES & ITEMS
    for (const stallData of stallsData) {
      const stallRes = await pool.query(`INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING stall_id`, [venueId, stallData.name, stallData.description || '', stallData.stall_image, true, stallData.waiting_time]);
      const stallId = stallRes.rows[0].stall_id;

      for (const catData of stallData.categories) {
        // Use the sort_order from the data object
        const catRes = await pool.query(
          `INSERT INTO menu_item_category (stall_id, name, sort_order) VALUES ($1, $2, $3) RETURNING category_id`, 
          [stallId, catData.name, catData.sort_order]
        );
        const catId = catRes.rows[0].category_id;

        for (const itemData of catData.items) {
          const itemRes = await pool.query(
            `INSERT INTO menu_item (stall_id, category_id, name, description, price, item_image, prep_time, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING item_id`, 
            [stallId, catId, itemData.name, itemData.description, itemData.price, itemData.item_image, itemData.prep_time, true]
          );
          const itemId = itemRes.rows[0].item_id;

          if (itemData.sections) {
            for (const sectionData of itemData.sections) {
              const sectionRes = await pool.query(`INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections) VALUES ($1, $2, $3, $4) RETURNING section_id`, [itemId, sectionData.name, sectionData.min, sectionData.max]);
              const sectionId = sectionRes.rows[0].section_id;

              if (sectionData.modifiers) {
                for (const modData of sectionData.modifiers) {
                  await pool.query(`INSERT INTO menu_item_modifier (section_id, item_id, name, price_modifier, is_available) VALUES ($1, $2, $3, $4, $5)`, [sectionId, itemId, modData.name, modData.price, true]);
                }
              }
            }
          }
        }
      }
    }
    console.log('Seed complete!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await pool.end();
  }
}

seed();