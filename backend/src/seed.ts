import dotenv from "dotenv";
import pool from "./config/database";

dotenv.config();

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
    waiting_time: 10,
  },
];

const menuCategories = [
  { stall_id: 1, name: "Noodles", sort_order: 1 },
  { stall_id: 1, name: "Soup", sort_order: 2 },

  { stall_id: 2, name: "Coffee", sort_order: 1 },
  { stall_id: 2, name: "Specials", sort_order: 2 },
];

const menuItems = [
  // --- STALL 1 ITEMS ---
  {
    stall_id: 1,
    name: "Signature Dry Beef Noodles",
    category: "Noodles",
    description:
      "Dry noodles tossed in savory dark sauce, topped with beef slices and balls.",
    price: 6.5,
    item_image: "",
    prep_time: 5,

    // Sections: Headers for choices
    sections: [
      { name: "Choice of Noodle", min: 1, max: 1 },
      { name: "Spiciness Level", min: 1, max: 1 },
      { name: "Add-ons", min: 0, max: 5 },
    ],

    // Modifiers: The actual choices (NOW linked to a section)
    modifiers: [
      { section: "Choice of Noodle", name: "Kway Teow", price: 0 },
      { section: "Choice of Noodle", name: "Yellow Noodle", price: 0 },
      { section: "Choice of Noodle", name: "Thick Bee Hoon", price: 0 },

      { section: "Spiciness Level", name: "Chili", price: 0 },
      { section: "Spiciness Level", name: "No Chili", price: 0 },

      { section: "Add-ons", name: "Extra Beef Slices", price: 2.0 },
      { section: "Add-ons", name: "Extra Beef Balls", price: 1.5 },
    ],
  },

  {
    stall_id: 1,
    name: "Sliced Beef Soup",
    category: "Soup",
    description: "Comforting herbal beef broth with tender slices.",
    price: 7.0,
    item_image: "",
    prep_time: 5,

    sections: [{ name: "Options", min: 0, max: 1 }],

    modifiers: [
      { section: "Options", name: "Add Rice", price: 1.0 },
      { section: "Options", name: "No Spring Onions", price: 0 },
    ],
  },

  // --- STALL 2 ITEMS (Drinks) ---
  {
    stall_id: 2,
    name: "Kopi O",
    description: "Traditional black coffee with sugar.",
    category: "Specials",
    price: 1.4,
    item_image: "",
    prep_time: 2,

    sections: [{ name: "Temperature", min: 1, max: 1 }],

    modifiers: [
      { section: "Temperature", name: "Hot", price: 0 },
      { section: "Temperature", name: "Iced", price: 0.5 },

      // If you want these as part of a section too, add a section:
      // { name: "Sugar Level", min: 0, max: 1 }
      // For now, I’ll keep them under Temperature so it seeds cleanly:
      { section: "Temperature", name: "Siew Dai (Less Sugar)", price: 0 },
      { section: "Temperature", name: "Kosong (No Sugar)", price: 0 },
    ],
  },

  {
    stall_id: 2,
    name: "Milo Dinosaur",
    category: "Coffee",
    description: "Iced Milo topped with a mountain of Milo powder.",
    price: 3.5,
    item_image: "",
    prep_time: 2,

    sections: [],
    modifiers: [],
  },
];

async function seed() {
  try {
    // 1. Venues
    const existingVenues = await pool.query("SELECT 1 FROM venue LIMIT 1");
    if ((existingVenues.rowCount ?? 0) === 0) {
      for (const venue of venues) {
        await pool.query(
          `INSERT INTO venue (name, address, description, image_url, opening_hours)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            venue.name,
            venue.address,
            venue.description,
            venue.image_url,
            venue.opening_hours,
          ]
        );
      }
      console.log("Venue table seeded.");
    } else {
      console.log("Venue table already has data. Skipping.");
    }

    // 2. Stalls
    const existingStalls = await pool.query("SELECT 1 FROM stall LIMIT 1");
    if ((existingStalls.rowCount ?? 0) === 0) {
      for (const stall of stalls) {
        await pool.query(
          `INSERT INTO stall (venue_id, name, description, stall_image, is_open, waiting_time)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            stall.venue_id,
            stall.name,
            stall.description ?? null,
            stall.stall_image ?? null,
            stall.is_open ?? true,
            stall.waiting_time ?? 0,
          ]
        );
      }
      console.log("Stall table seeded.");
    } else {
      console.log("Stall table already has data. Skipping.");
    }

    // 3. Categories
    const existingCategories = await pool.query(
      "SELECT 1 FROM menu_item_category LIMIT 1"
    );

    // category lookup: `${stall_id}::${category_name}` -> category_id
    const categoryIdByKey = new Map<string, number>();

    if ((existingCategories.rowCount ?? 0) === 0) {
      console.log("Seeding categories...");

      for (const c of menuCategories) {
        const res = await pool.query(
          `INSERT INTO menu_item_category (stall_id, name, sort_order)
           VALUES ($1, $2, $3)
           RETURNING category_id`,
          [c.stall_id, c.name, c.sort_order ?? 0]
        );

        const key = `${c.stall_id}::${c.name}`;
        categoryIdByKey.set(key, res.rows[0].category_id);
      }

      console.log("Categories seeded.");
    } else {
      console.log("Categories already exist. Loading category ids...");

      const res = await pool.query(
        "SELECT category_id, stall_id, name FROM menu_item_category"
      );
      for (const row of res.rows) {
        const key = `${row.stall_id}::${row.name}`;
        categoryIdByKey.set(key, row.category_id);
      }
    }

    // 4. Menu Items + sections + modifiers
    const existingItems = await pool.query("SELECT 1 FROM menu_item LIMIT 1");
    if ((existingItems.rowCount ?? 0) === 0) {
      console.log("Seeding menu items...");

      for (const item of menuItems) {
        const categoryName = (item as any).category as string | undefined;

        if (!categoryName) {
          throw new Error(
            `Menu item "${item.name}" is missing "category". Add category: "<Category Name>".`
          );
        }

        const catKey = `${item.stall_id}::${categoryName}`;
        const categoryId = categoryIdByKey.get(catKey);

        if (!categoryId) {
          throw new Error(
            `Menu item "${item.name}" references category "${categoryName}" but it wasn't seeded for stall_id=${item.stall_id}.`
          );
        }

        // Insert Item (includes category_id)
        const itemRes = await pool.query(
          `INSERT INTO menu_item (stall_id, category_id, name, description, price, item_image, prep_time, is_available)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING item_id`,
          [
            item.stall_id,
            categoryId,
            item.name,
            item.description ?? null,
            item.price ?? 0,
            item.item_image ?? null,
            item.prep_time ?? 0,
            true,
          ]
        );

        const itemId = itemRes.rows[0].item_id as number;

        // Insert Sections + build lookup map: section name -> section_id
        const sectionIdByName = new Map<string, number>();

        if (item.sections?.length) {
          for (const section of item.sections) {
            const secRes = await pool.query(
              `INSERT INTO menu_item_modifier_section (item_id, name, min_selections, max_selections)
               VALUES ($1, $2, $3, $4)
               RETURNING section_id`,
              [itemId, section.name, section.min ?? 0, section.max ?? 1]
            );

            sectionIdByName.set(section.name, secRes.rows[0].section_id);
          }
        }

        // Insert Modifiers (must include section)
        if (item.modifiers?.length) {
          for (const mod of item.modifiers) {
            const sectionName = (mod as any).section as string | undefined;
            if (!sectionName) {
              throw new Error(
                `Modifier "${mod.name}" for item "${item.name}" is missing "section".`
              );
            }

            const sectionId = sectionIdByName.get(sectionName);
            if (!sectionId) {
              throw new Error(
                `Modifier "${mod.name}" references section "${sectionName}" but that section wasn't inserted for item "${item.name}".`
              );
            }

            await pool.query(
              `INSERT INTO menu_item_modifier (section_id, item_id, name, price_modifier, is_available)
               VALUES ($1, $2, $3, $4, $5)`,
              [sectionId, itemId, mod.name, (mod as any).price ?? 0, true]
            );
          }
        }
      }

      console.log("Menu items seeded.");
    } else {
      console.log("Menu items already exist. Skipping.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}
seed();