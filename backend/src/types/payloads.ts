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

export interface OrderPayload {
  table_id: number;
  user_id: number;
  status: OrderStatusCodes;
  total_price: number;
  created_at: string;
  remarks?: string;
}

export interface UpdateOrderPayload extends Partial<OrderPayload> {}

export interface OrderItemPayload {
  order_id: number;
  item_id: number;
  status: OrderItemStatusCodes;
  quantity: number;
  unit_price: number;
  line_subtotal: number;
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