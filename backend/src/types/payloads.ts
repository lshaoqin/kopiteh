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
}

export interface UpdateStallPayload extends Partial<StallPayload> {}

export interface MenuItemCategoryPayload {
  stall_id: number;
  name: string;
  sort_order?: number;
}

export interface UpdateMenuItemCategoryPayload extends Partial<MenuItemCategoryPayload> {}

export interface ModifierOptionDraft {
  option_id?: number;
  name: string;
  price_modifier: number;
  is_available?: boolean;
}

export interface ModifierSectionDraft {
  section_id?: number;
  name: string;
  min_selections: number;
  max_selections: number;
  options?: ModifierOptionDraft[];
}

export interface MenuItemPayload {
  stall_id: number;
  category_id?: number | null;
  item_image?: string | null;
  name: string;
  description?: string | null;
  price: number;
  prep_time?: number;
  is_available?: boolean;
  modifier_sections?: ModifierSectionDraft[];
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

export interface CustomOrderItemPayload {
  stall_id: number;
  table_id: number;
  user_id?: number;
  order_item_name: string;
  quantity: number;
  price: number;
  created_at: string;
  remarks?: string;
}

export interface UpdateCustomOrderItemPayload extends Partial<CustomOrderItemPayload> {}
export interface FetchOrderItemResponsePayload extends CustomOrderItemPayload {
  order_item_id: number;
  modifiers?: OrderModifierPayload[];
  type: 'STANDARD' | 'CUSTOM';
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