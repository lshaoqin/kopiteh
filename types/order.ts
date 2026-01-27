import type { ID, Decimal } from "./common";

export type OrderStatus =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export type OrderItemStatus =
  | "INCOMING"
  | "PREPARING"
  | "SERVED"
  | "CANCELLED";

export interface Order {
  order_id: ID;
  table_id?: ID | null;
  user_id?: ID | null;
  status: OrderStatus;
  total_price: Decimal;
  created_at: string; // ISO
  remarks?: string | null;
  type: 'STANDARD' | 'CUSTOM';
}

export interface OrderItem {
  order_item_id: ID;
  stall_id: ID;
  table_id: ID | null;
  user_id?: ID | null;
  order_item_name: string;
  status: OrderItemStatus;
  quantity: number;
  price: Decimal;
  created_at: string;
  remarks?: string | null;
  type: 'STANDARD' | 'CUSTOM';
}

export interface OrderItemModifier {
  order_item_option_id: ID;
  order_item_id: ID;
  option_id: ID;
  price_modifier: Decimal;
  option_name: string;
}
