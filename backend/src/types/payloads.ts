import { OrderStatusCodes, OrderItemStatusCodes } from './orderStatus';

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

export interface MenuItemCategoryPayload {
  stall_id: number;
  name: string;
  sort_order?: number;
}

export interface UpdateMenuItemCategoryPayload extends Partial<MenuItemCategoryPayload> {}

export interface MenuItemPayload {
  stall_id: number;
  category_id?: number | null;
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
  section_id: number;
  name: string;
  price_modifier?: number;
  is_available?: boolean;
}

export interface TablePayload {
  venue_id: number;
  table_number: string;
  qr_code: string;
}

// 1. Nested Modifier Payload
export interface OrderModifierPayload {
  option_id: number;
  name: string;
  price: number;
}

// 2. Nested Item Payload
export interface OrderItemPayload {
  item_id: number;
  quantity: number;
  price: number;
  notes?: string;
  modifiers: OrderModifierPayload[]; // Nested array
  
  // Optional fields for DB retrieval/Updates later
  order_id?: number;
  status?: OrderItemStatusCodes;
  unit_price?: number;
  line_subtotal?: number;
}

// 3. Main Order Payload (Matches Frontend Request)
export interface OrderPayload {
  table_number: number; // Changed from table_id to number
  total_price: number;
  items: OrderItemPayload[]; // Nested array
  
  // Optional/Backend generated
  table_id?: number; 
  user_id?: number;
  status?: OrderStatusCodes;
  created_at?: string;
  remarks?: string;
}

// 4. Update Payload (Decoupled from OrderPayload to avoid nested items issues)
export interface UpdateOrderPayload {
  status?: OrderStatusCodes;
  total_price?: number;
  remarks?: string;
  created_at?: string;
}

export interface UpdateOrderItemPayload extends Partial<OrderItemPayload> {}

export interface OrderItemModifierPayload {
  order_item_id: number;
  option_id: number;
  price_modifier: number;
  option_name: string;
}

export interface CreateAccountPayload {
  name: string;
  email: string;
  password: string;
  secretCode: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
  name: string;
  newPassword: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface LogoutPayload {
  refreshToken: string
}