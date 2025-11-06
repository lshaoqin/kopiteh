import type { ID, Decimal } from "./common";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "served"
  | "paid"
  | "cancelled"; // adjust to your actual status list

export interface Order {
  order_id: ID;
  table_id?: ID | null;
  user_id?: ID | null;
  status: OrderStatus;
  total_price: Decimal;
  created_at: string; // ISO
  remarks?: string | null;
}

export interface OrderItem {
  order_item_id: ID;
  order_id: ID;
  item_id: ID;
  quantity: number;
  unit_price: Decimal;
  line_subtotal: Decimal;
}

export interface OrderItemModifier {
  order_item_option_id: ID;
  order_item_id: ID;
  option_id: ID;
  price_modifier: Decimal;
  option_name: string;
}
