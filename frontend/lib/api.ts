import { Stall, MenuItem, MenuItemModifier, MenuCategory, MenuItemModifierSection, DiningTable, Venue, OrderItem } from "../../types";
import { CartItem } from "@/stores/cart.store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Helper to handle the top-level response structure
async function fetchClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await res.json();

  // 1. Check for success flag 
  // If status is not 2xx OR json.success is false, throw error
  if (!res.ok || json.success === false) {
    console.error("API Error Details:", json);
    const errorMessage = json.payload?.message || json.payload?.details || "An error occurred";
    throw new Error(errorMessage);
  }

  // 2. Unwrap Layer 
  // Return the actual data directly so individual functions do not have to unwrap again.
  return json.payload.data as T;
}

export const api = {
  // --- VENUES ---
  getVenues: async (): Promise<Venue[]> => {
    return await fetchClient<Venue[]>("/venue");
  },

  // --- TABLES ---
  getTablesByVenue: async (venueId: number): Promise<DiningTable[]> => {
    const rawData = await fetchClient<any[]>(`/venue/${venueId}/tables`);
    
    return rawData.map((t) => ({
      table_id: Number(t.table_id),
      venue_id: Number(t.venue_id),
      table_number: String(t.table_number),
      qr_code: t.qr_code || null,
    }));
  },

  // --- STALLS ---
  getStallsByVenue: async (venueId: number): Promise<Stall[]> => {
    const rawData = await fetchClient<any[]>(`/stalls/venue/${venueId}`);
    
    return rawData.map((item) => ({
      stall_id: Number(item.stall_id),
      venue_id: Number(item.venue_id),
      name: item.name,
      description: item.description,
      stall_image: item.stall_image, 
      is_open: item.is_open,
      waiting_time: item.waiting_time
    }));
  },

  getStallById: async (stallId: number): Promise<Stall> => {
    const item = await fetchClient<any>(`/stalls/${stallId}`);
    return {
      stall_id: Number(item.stall_id),
      venue_id: Number(item.venue_id),
      name: item.name,
      description: item.description,
      stall_image: item.stall_image,
      is_open: item.is_open,
      waiting_time: item.waiting_time
    };
  },

  // --- MENU ---
  getMenuByStall: async (stallId: number): Promise<MenuItem[]> => {
    const rawData = await fetchClient<any[]>(`/items/stalls/${stallId}`);
    return rawData.map((item) => ({
        item_id: Number(item.item_id),
        stall_id: Number(item.stall_id),
        category_id: item.category_id ? Number(item.category_id) : null,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        item_image: item.item_image, 
        is_available: item.is_available,
        prep_time: item.prep_time
    }));
  },

  getItemById: async (itemId: number): Promise<MenuItem> => {
    const item = await fetchClient<any>(`/items/${itemId}`);
    return {
        item_id: Number(item.item_id),
        stall_id: Number(item.stall_id),
        category_id: item.category_id ? Number(item.category_id) : null,
        name: item.name,
        description: item.description,
        price: Number(item.price),
        item_image: item.item_image,
        is_available: item.is_available,
        prep_time: item.prep_time
    };
  },

  // --- MODIFIERS ---
  getSectionsByItem: async (itemId: number): Promise<MenuItemModifierSection[]> => {
    const rawData = await fetchClient<any[]>(`/item-sections/items/${itemId}`);
    return rawData.map((s) => ({
        section_id: Number(s.section_id),
        item_id: Number(s.item_id),
        name: s.name,
        min_selections: s.min_selections,
        max_selections: s.max_selections
    }));
  },

  getModifiersByItem: async (itemId: number): Promise<MenuItemModifier[]> => {
    const rawData = await fetchClient<any[]>(`/modifiers/items/${itemId}`); 
    return rawData.map((m) => ({
        option_id: Number(m.option_id),
        section_id: Number(m.section_id), 
        name: m.name,
        price_modifier: Number(m.price_modifier),
        is_available: m.is_available
    }));
  },

  getCategoriesByStall: async (stallId: number): Promise<MenuCategory[]> => {
    const rawData = await fetchClient<any[]>(`/categories/stalls/${stallId}`);
    return rawData.map((cat) => ({
      category_id: Number(cat.category_id),
      stall_id: Number(cat.stall_id),
      name: cat.name,
      sort_order: cat.sort_order,
    }));
  },

  // --- ORDERS AND ORDER ITEMS ---
  getOrderItemsByStall: async (stallId: number): Promise<OrderItem[]> => {
    const response = await fetchClient<any>(`/orderItem/stall/${stallId}`);
    return response.map((item: any) => ({
      order_item_id: item.order_item_id,
      stall_id: item.stall_id,
      table_id: item.table_id,
      table_number: item.table_number,
      user_id: item.user_id,
      order_item_name: item.order_item_name,
      status: item.status,
      quantity: item.quantity,
      price: item.price,
      created_at: item.created_at,
      remarks: item.remarks,
      modifiers: item.modifiers ? item.modifiers.map((mod: any) => ({
        option_id: mod.option_id,
        price: mod.price,
        name: mod.name,
      })) : [],
      type: item.type,
    }));
  },

  createOrder: async (orderData: {
    table_id: number;
    total_price: number;
    items: CartItem[];
  }) => {
    // Transform frontend CartItems to backend payload structure
    const request = {
      table_id: Number(orderData.table_id),
      total_price: Number(orderData.total_price),
      items: orderData.items.map((item) => ({
        item_id: Number(item.menuItem.item_id),
        quantity: Number(item.quantity),
        price: Number(item.menuItem.price),
        notes: item.remarks || "",
        modifiers: item.modifiers.map((mod) => ({
          option_id: Number(mod.option_id),
          name: mod.name,
          price: Number(mod.price_modifier),
        })),
      })),
    };

    const response = await fetchClient<any>("/order/create", {
      method: "POST",
      body: JSON.stringify(request),
    });
    
    return response;
  },

  createCustomOrder: async (customOrderData: {
    stall_id: number,
    table_id: number,
    order_item_name: string,
    status: "INCOMING",
    quantity: number,
    price: number,
    remarks?: string,
  }): Promise<OrderItem> => {
    const response = await fetchClient<any>(`/orderItem/create/CUSTOM`, {
      method: "POST",
      body: JSON.stringify(customOrderData),
    });
    
    return response;
  },

  updateOrderItemStatus: async (orderItemId: number, type: string): Promise<OrderItem> => {
    const response = await fetchClient<any>(`/orderItem/updateStatus/${type}/${orderItemId}`, {
      method: "PUT"
    });
    return response;
  },

  revertOrderItemStatus: async (orderItemId: number, type: string): Promise<OrderItem> => {
    const response = await fetchClient<any>(`/orderItem/revertStatus/${type}/${orderItemId}`, {
      method: "PUT"
    });
    return response;
  },

  deleteOrderItem: async (orderItemId: number, type: string): Promise<void> => {
    await fetchClient<any>(`/orderItem/delete/${type}/${orderItemId}`, {
      method: "DELETE"
    });
  }
};