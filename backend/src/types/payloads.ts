export interface VenuePayload {
  name: string;
  address?: string;
  description?: string;
  image_url?: string;
  opening_hours?: string;
}

export interface UpdateVenuePayload extends Partial<VenuePayload> {}

export interface StallPayload {
  venue_id: number;
  name: string;
  description?: string;
  stall_image?: string;
  is_open?: boolean;
  waiting_time?: number;
}

export interface UpdateStallPayload extends Partial<StallPayload> {}

export interface MenuItemPayload {
  stall_id: number;
  item_image?: string;
  name: string;
  description?: string;
  price: number;
  prep_time?: number;
  is_available?: boolean;
}

export interface UpdateMenuItemPayload extends Partial<MenuItemPayload> {}

export interface MenuItemModifierSectionPayload {
  item_id: number;
  name: string;
  min_selections?: number;
  max_selections?: number;
}

export interface MenuItemModifierPayload {
  item_id: number;
  name: string;
  price_modifier?: number;
  is_available?: boolean;
}

export interface TablePayload {
  venue_id: number;
  table_number: string;
  qr_code: string;
}

export interface OrderPayload {
  table_id: number;
  status?: string;
  total_price?: number;
  remarks?: string;
}

export interface OrderItemPayload {
  order_id: number;
  item_id: number;
  stall_id: number;
  quantity: number;
  price: number;
}

export interface OrderItemModifierPayload {
  order_item_id: number;
  option_id: number;
}
