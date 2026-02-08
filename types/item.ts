import type { ID, Decimal } from "./common";

export interface MenuItem {
  item_id: ID;
  stall_id: ID;
  category_id?: number | null;
  item_image?: string | null;
  name: string;
  description?: string | null;
  price: Decimal;        // decimal(10,2)
  prep_time?: number | null; // minutes
  is_available?: boolean | null;
}

export interface MenuItemModifierSection {
  section_id: ID;
  item_id: ID;
  name: string;
  min_selections?: number | null;
  max_selections?: number | null;
}

export interface MenuItemModifier {
  option_id: ID;
  section_id: ID;
  name: string;
  price_modifier: Decimal;
  is_available: boolean;
}

export interface MenuCategory {
  category_id: number;
  stall_id: number;
  name: string;
  sort_order?: number | null;
}

export interface DiningTable {
  table_id: ID;
  venue_id: ID;
  table_number: string;
  qr_code?: string | null;
}