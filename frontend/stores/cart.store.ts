import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, MenuItemModifier } from "../../types";

export interface CartItem {
  uniqueId: string; // Composite key: item_id + modifier_ids + remarks
  menuItem: MenuItem;
  stallName: string; 
  modifiers: MenuItemModifier[];
  quantity: number;
  remarks: string; 
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean;
  tableNumber: number | null;

  // Actions
  addItem: (item: MenuItem, modifiers: MenuItemModifier[], quantity: number, stallName: string, remarks?: string) => void;
  removeItem: (uniqueId: string) => void;
  updateQuantity: (uniqueId: string, delta: number) => void;
  updateItem: (uniqueId: string, updates: Partial<Omit<CartItem, 'uniqueId'>>) => void;
  clearCart: () => void;
  setTableNumber: (table: number) => void;
  
  // Getters
  totalPrice: () => number;
  
  // Hydration check
  setHydrated: (v: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      tableNumber: null,
      setTableNumber: (table) => set({ tableNumber: table }),

      addItem: (menuItem, modifiers, quantity, stallName, remarks = "") => {
        // 1. Generate Unique ID
        const sortedModIds = modifiers.map((m) => m.option_id).sort().join("-");
        const uniqueId = `${menuItem.item_id}-${sortedModIds}-${remarks.trim()}`;

        // 2. Calculate Unit Price
        const basePrice = Number(menuItem.price);
        const modPrice = modifiers.reduce((acc, m) => acc + Number(m.price_modifier), 0);
        const unitPrice = basePrice + modPrice;

        set((state) => {
          const existingItem = state.items.find((i) => i.uniqueId === uniqueId);

          if (existingItem) {
            // Update existing item quantity
            return {
              items: state.items.map((i) =>
                i.uniqueId === uniqueId
                  ? {
                      ...i,
                      quantity: i.quantity + quantity,
                      subtotal: (i.quantity + quantity) * unitPrice,
                    }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                uniqueId,
                menuItem,
                stallName, 
                modifiers,
                quantity,
                remarks,
                subtotal: quantity * unitPrice,
              },
            ],
          };
        });
      },

      removeItem: (uniqueId) =>
        set((state) => ({
          items: state.items.filter((i) => i.uniqueId !== uniqueId),
        })),

      updateQuantity: (uniqueId, delta) =>
        set((state) => {
          const newItems = state.items
            .map((item) => {
              if (item.uniqueId === uniqueId) {
                const newQty = Math.max(0, item.quantity + delta);
                // Recalculate subtotal
                const unitPrice = item.subtotal / item.quantity;
                return {
                  ...item,
                  quantity: newQty,
                  subtotal: newQty * unitPrice,
                };
              }
              return item;
            })
            .filter((i) => i.quantity > 0); 

          return { items: newItems };
        }),

      clearCart: () => set({ items: [] }),

      totalPrice: () => {
        return get().items.reduce((acc, item) => acc + item.subtotal, 0);
      },

      updateItem: (uniqueId, updates) =>
        set((state) => ({
            items: state.items.map((i) => {
            if (i.uniqueId === uniqueId) {
                const newItem = { ...i, ...updates };
                const unitPrice = Number(newItem.menuItem.price) + 
                    newItem.modifiers.reduce((acc, m) => acc + Number(m.price_modifier), 0);
                
                return {
                    ...newItem,
                    subtotal: newItem.quantity * unitPrice
                };
            }
            return i;
            }),
        })),

      setHydrated: (v) => set({ isHydrated: v }),
    }),
    {
      name: "cart-storage", 
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);