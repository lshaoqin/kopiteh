import dotenv from 'dotenv';
import pool from './config/database';

dotenv.config();

const venuesToSeed = [
  {
    name: 'Kopiteh Central',
    address: '123 Market St',
    description: 'The flagship busy downtown hawker center.',
    tables: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    stalls: [
      {
        name: 'Hong Kee Beef Noodle',
        description: 'Famous Cuppage Centre Beef Noodles',
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
          }
        ]
      },
      {
        name: 'Central Drink Stall',
        description: 'Traditional coffee and tea',
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
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Kopiteh North',
    address: '88 Woodlands Ave',
    description: 'Modern neighborhood hub with fusion food.',
    tables: ["2", "11", "1", "20", "5"], // Mixed for sorting test
    stalls: [
      {
        name: 'Ah Ma Chi Mian',
        description: 'Traditional Minced Meat Noodles',
        stall_image: 'https://static.smartlocal.com/images/lp/2023/10/ah-ma-chi-mian-1.JPG',
        waiting_time: 8,
        categories: [
          {
            name: "Mains",
            sort_order: 1,
            items: [
              { 
                name: 'Bak Chor Mee', 
                description: 'Classic spicy noodles', 
                price: 5.00, 
                prep_time: 7,
                sections: [
                    {
                        name: "Spiciness", min: 1, max: 1,
                        modifiers: [{ name: "No Chili", price: 0 }, { name: "Normal", price: 0 }, { name: "Extra Spicy", price: 0 }]
                    }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    name: 'Kopiteh East Coast',
    address: '50 Marine Parade',
    description: 'Relaxed seaside dining environment.',
    tables: ["101", "102", "103"],
    stalls: [
      {
        name: 'Coastal Seafood',
        description: 'Fresh catch daily',
        stall_image: 'https://sethlui.com/wp-content/uploads/2022/03/White-Restaurant-Sun-Plaza-Seafood.jpg',
        waiting_time: 15,
        categories: [
          {
            name: "Seafood",
            sort_order: 1,
            items: [
              { 
                name: 'White Bee Hoon', 
                description: 'Signature seafood broth', 
                price: 8.50, 
                prep_time: 12,
                sections: [
                    {
                        name: "Add-ons", min: 0, max: 2,
                        modifiers: [{ name: "Extra Prawns", price: 3.00 }, { name: "Extra Egg", price: 1.00 }]
                    }
                ]
              }
            ]
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
    
    // 2. INSERT SHARED GUEST
    await pool.query(`INSERT INTO users (name, email, password_hash, role, is_authenticated) VALUES ('Guest User', 'guest@kopiteh.com', 'hash', 'user', true)`);

    // 3. LOOP THROUGH VENUES
    for (const venueData of venuesToSeed) {
      const venueRes = await pool.query(
        `INSERT INTO venue (name, address, description, opening_hours) VALUES ($1, $2, $3, '08:00 - 22:00') RETURNING venue_id`, 
        [venueData.name, venueData.address, venueData.description]
      );
      const venueId = venueRes.rows[0].venue_id;

      // 4. SEED TABLES for this venue
      for (const tNum of venueData.tables) {
        await pool.query(`INSERT INTO "table" (venue_id, table_number, qr_code) VALUES ($1, $2, $3)`, [venueId, tNum, `qr-${venueId}-${tNum}`]);
      }

      // 5. SEED STALLS for this venue 
      for (const stallData of venueData.stalls) {
        const stallRes = await pool.query(
          `INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time) VALUES ($1, $2, $3, $4, true, $5) RETURNING stall_id`, 
          [venueId, stallData.name, stallData.description, stallData.stall_image, stallData.waiting_time]
        );
        const stallId = stallRes.rows[0].stall_id;

        for (const catData of stallData.categories) {
          const catRes = await pool.query(`INSERT INTO menu_item_category (stall_id, name, sort_order) VALUES ($1, $2, $3) RETURNING category_id`, [stallId, catData.name, catData.sort_order]);
          const catId = catRes.rows[0].category_id;

          for (const itemData of catData.items) {
            const item = itemData as any; 
            const itemRes = await pool.query(
              `INSERT INTO menu_item (stall_id, category_id, name, description, price, item_image, prep_time, is_available) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING item_id`, 
              [stallId, catId, item.name, item.description || '', item.price, item.item_image || '', item.prep_time, true]
            );
            const itemId = itemRes.rows[0].item_id;

            // 6. SEED SECTIONS & MODIFIERS 
            if (item.sections) {
              for (const sectionData of item.sections) {
                const sectionRes = await pool.query(
                  `INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections) VALUES ($1, $2, $3, $4) RETURNING section_id`, 
                  [itemId, sectionData.name, sectionData.min, sectionData.max]
                );
                const sectionId = sectionRes.rows[0].section_id;

                if (sectionData.modifiers) {
                  for (const modData of sectionData.modifiers) {
                    await pool.query(
                      `INSERT INTO menu_item_modifier (section_id, item_id, name, price_modifier, is_available) VALUES ($1, $2, $3, $4, $5)`, 
                      [sectionId, itemId, modData.name, modData.price, true]
                    );
                  }
                }
              }
            }
          }
        }
      }
    }
    console.log('Seed complete! 3 Unique Venues with unique stalls and full modifiers.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

seed();