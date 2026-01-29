"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api"; 
import { MenuItem, Stall, MenuCategory } from "@/../types";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton"; 
import { StandardMenuCard } from "@/components/ui/MenuCard";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";

export default function MenuListPage() {
  const params = useParams();
  const stallId = Number(params.stallId); 

  const { venueId, tableNumber } = useCartStore();

  const [stall, setStall] = useState<Stall | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cartItems = useCartStore((state) => state.items);
  
  const getItemQty = (itemId: string) => {
    return cartItems
      .filter((cartItem) => cartItem.menuItem.item_id === itemId)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  useEffect(() => {
    async function fetchData() {
      if (!stallId) return;
      try {
        setLoading(true);
        // Fetch Stall, Items, and Categories in parallel
        const [stallData, menuData, categoryData] = await Promise.all([
          api.getStallById(stallId),
          api.getMenuByStall(stallId),
          api.getCategoriesByStall(stallId)
        ]);
        setStall(stallData);
        setMenuItems(menuData || []);
        setCategories(categoryData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stallId]);

  /**
   * Grouping Logic:
   * Maps through the categories from the DB and finds items belonging to each.
   */
  const groupedMenu = useMemo(() => {
    return categories
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map(cat => ({
        ...cat,
        items: menuItems.filter(item => Number(item.category_id) === cat.category_id)
      }))
      .filter(group => group.items.length > 0); // Only show categories with items
  }, [categories, menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !stall) return <div className="p-10 text-center">Error loading stall</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32 w-full flex flex-col">
      
    {/* --- HEADER --- */}
    <div className="relative z-10 h-full flex flex-col justify-between p-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm w-fit">
            <BackButton 
              href={`/ordering/stalls?venue=${venueId}&table=${tableNumber}`} 
            />
      </div>

      <div className="text-center pb-2">
          <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow-md">
              {stall.name}
          </h1>
      </div>
    </div>

      {/* --- MENU SECTIONS --- */}
      <div className="flex-1 px-6 pt-8 space-y-10">
        
        {groupedMenu.map((group) => (
            <section key={group.category_id}>
                <h2 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
                    {group.name}
                </h2>
                <div className="flex flex-col">
                    {group.items.map((item) => (
                        <StandardMenuCard 
                            key={item.item_id}
                            item={item}
                            href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                            quantity={getItemQty(item.item_id)} 
                        />
                    ))}
                </div>
            </section>
        ))}

        {/* Fallback for items with no category assigned in DB */}
        {menuItems.filter(i => !i.category_id).length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">
              Others
            </h2>
            <div className="flex flex-col">
              {menuItems.filter(i => !i.category_id).map((item) => (
                <StandardMenuCard 
                    key={item.item_id}
                    item={item}
                    href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                    quantity={getItemQty(item.item_id)} 
                />
              ))}
            </div>
          </section>
        )}

      </div>

      <FloatingCartButton />
    </div>
  );
}