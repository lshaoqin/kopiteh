import { Stall, MenuItem, MenuItemModifier, MenuItemModifierSection } from "../../types";

// --- STALLS ---
export const MOCK_STALLS: Stall[] = [
  {
    stall_id: 1,
    venue_id: 1,
    name: "Tian Tian Chicken Rice",
    description: "Singapore's most famous chicken rice.",
    stall_image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
    is_open: true,
    waiting_time: 15
  },
  {
    stall_id: 2,
    venue_id: 1,
    name: "Uncle Bob Western",
    description: "Old school chicken chop and fish & chips.",
    stall_image: "https://images.unsplash.com/photo-1625938145744-e38051539994?auto=format&fit=crop&w=500&q=80",
    is_open: true,
    waiting_time: 10
  },
  {
    stall_id: 3,
    venue_id: 1,
    name: "Ah Seng Hokkien Mee",
    description: "Wok hei goodness with fresh prawns.",
    stall_image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80",
    is_open: false, 
    waiting_time: 0
  },
  {
    stall_id: 4,
    venue_id: 1,
    name: "Roti Prata House",
    description: "Crispy prata and spicy curry.",
    stall_image: null, 
    is_open: true,
    waiting_time: 5
  }
];

// --- MENU ITEMS (For Menu List Page) ---
export const MOCK_MENU_ITEMS: MenuItem[] = [
  { item_id: 101, stall_id: 1, name: "Steamed Chicken Rice", description: "Signature tender chicken.", price: 5.50, item_image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80", is_available: true },
  { item_id: 102, stall_id: 1, name: "Roasted Chicken Rice", description: "Crispy skin roasted chicken.", price: 5.50, item_image: "https://plus.unsplash.com/premium_photo-1664472637341-3ec829d1f4df?auto=format&fit=crop&w=300&q=80", is_available: true },
  { item_id: 103, stall_id: 1, name: "Lemon Chicken Cutlet", description: "Fried chicken with lemon sauce.", price: 6.50, item_image: null, is_available: true },
  { item_id: 104, stall_id: 1, name: "Oyster Sauce Kai Lan", description: "Fresh vegetables.", price: 4.00, item_image: null, is_available: true },
  { item_id: 105, stall_id: 1, name: "Braised Egg", description: "Soy sauce egg.", price: 1.00, item_image: null, is_available: true },
  { item_id: 106, stall_id: 1, name: "Kopi O", description: "Black coffee.", price: 1.20, item_image: null, is_available: true },
  { item_id: 107, stall_id: 1, name: "Teh C", description: "Tea with milk.", price: 1.40, item_image: null, is_available: true }
];

// --- ITEM DETAILS (For Customization Page) ---
export const MOCK_ITEM_DETAILS: Record<number, MenuItem> = {
  101: { item_id: 101, stall_id: 1, name: "Chicken Rice Set", description: "Steamed or Roasted chicken.", price: 5.50, item_image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80", is_available: true },
  106: { item_id: 106, stall_id: 1, name: "Kopi", description: "Traditional Nanyang Coffee", price: 1.20, item_image: null, is_available: true },
  0: { item_id: 0, stall_id: 1, name: "Generic Item", description: "Tasty food", price: 5.00, item_image: null, is_available: true }
};

// --- MODIFIERS (Options) ---
export const MOCK_MODIFIERS: MenuItemModifier[] = [
  // Food Options
  { option_id: 1, section_id: 1, name: "Steamed Chicken", price_modifier: 0, is_available: true },
  { option_id: 2, section_id: 1, name: "Roasted Chicken", price_modifier: 0, is_available: true },
  { option_id: 3, section_id: 2, name: "Braised Egg", price_modifier: 1.00, is_available: true },
  { option_id: 4, section_id: 2, name: "Chicken Liver", price_modifier: 0.50, is_available: true },
  { option_id: 5, section_id: 3, name: "No Spring Onions", price_modifier: 0, is_available: true },
  { option_id: 6, section_id: 3, name: "No Chili", price_modifier: 0, is_available: true },
  // Drink Options
  { option_id: 7, section_id: 4, name: "Original Kopi", price_modifier: 0, is_available: true },
  { option_id: 8, section_id: 4, name: "Kopi C", price_modifier: 0.20, is_available: true },
  { option_id: 9, section_id: 4, name: "Kopi O Kosong", price_modifier: -0.10, is_available: true },
  { option_id: 10, section_id: 5, name: "Less sugar", price_modifier: 0, is_available: true },
];

// --- SECTIONS (Grouping) ---
export const MOCK_SECTIONS: MenuItemModifierSection[] = [
  // Food
  { section_id: 1, item_id: 101, name: "Choice of Meat", min_selections: 1, max_selections: 1 },
  { section_id: 2, item_id: 101, name: "Add-ons", min_selections: 0, max_selections: 5 },
  { section_id: 3, item_id: 101, name: "Request", min_selections: 0, max_selections: 5 },
  // Drink
  { section_id: 4, item_id: 106, name: "Choice of Kopi", min_selections: 1, max_selections: 1 },
  { section_id: 5, item_id: 106, name: "Sugar Level", min_selections: 0, max_selections: 1 },
];

// use this until Sri finishes fixing schema
export const MOCK_KOPI_DATA = {
  item: {
    item_id: 999,
    stall_id: 2,
    name: "Kopi",
    description: "Coffee with condensed milk",
    price: 1.40,
    item_image: "https://thehoneycombers.com/singapore/uploads/2017/04/Kopi-O-local-coffee-in-Singapore.jpg",
    prep_time: 2,
    is_available: true
  } as MenuItem,

  sections: [
    { 
        section_id: 100, 
        item_id: 999,
        name: "Choice", 
        min_selections: 1, 
        max_selections: 1 
    },
    { 
        section_id: 101, 
        item_id: 999, 
        name: "Request", 
        min_selections: 0, 
        max_selections: 5 
    }
  ] as MenuItemModifierSection[],

  modifiers: [
    // CHOICE SECTION (Linked via section_id)
    { 
        option_id: 200, 
        section_id: 100,
        name: "Kopi", 
        price_modifier: 0, 
        is_available: true 
    },
    { 
        option_id: 201, 
        section_id: 100, 
        name: "Kopi C", 
        price_modifier: 0.20, 
        is_available: true 
    },
    { 
        option_id: 202, 
        section_id: 100, 
        name: "Kopi O Kosong", 
        price_modifier: 0, 
        is_available: true 
    },
    
    // REQUEST SECTION (Linked via section_id)
    { 
        option_id: 203, 
        section_id: 101,
        name: "Less sugar", 
        price_modifier: 0, 
        is_available: true 
    },
    { 
        option_id: 204, 
        section_id: 101, 
        name: "No Condensed Milk", 
        price_modifier: 0, 
        is_available: true 
    },
    { 
        option_id: 205, 
        section_id: 101, 
        name: "Dairy-free Milk", 
        price_modifier: 1.00, 
        is_available: true 
    },
  ] as MenuItemModifier[]
};