"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api"; 
import { MenuItem, Stall } from "@/../types";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton"; 
import { Button } from "@/components/ui/button";
import { PopularMenuCard, StandardMenuCard } from "@/components/ui/MenuCard";

export default function MenuListPage() {
  const params = useParams();
  const stallId = Number(params.stallId); 

  const [stall, setStall] = useState<Stall | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- CART STATE ---
  const cartItems = useCartStore((state) => state.items);
  
  // Helper: Get quantity of a specific item currently in cart
  const getItemQty = (itemId: string) => {
    return cartItems
      .filter((cartItem) => cartItem.menuItem.item_id === itemId)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
  };

  // Helper: Get total items for the footer button
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function fetchData() {
      if (!stallId) return;
      try {
        setLoading(true);
        const [stallData, menuData] = await Promise.all([
          api.getStallById(stallId),
          api.getMenuByStall(stallId)
        ]);
        setStall(stallData);
        setMenuItems(menuData || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load menu data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stallId]);

  // Splitting data to match the UI sections. Hardcoding first before Sri fixes schema
  const popularItems = menuItems.slice(0, 4); // First 4 items, criteria to be updated
  const drinksItems = menuItems.filter(i => // Filtering drinks since currently there is no way to tell if a menu item is a food or a drink
    i.name.toLowerCase().includes('kopi') || 
    i.name.toLowerCase().includes('teh') || 
    i.name.toLowerCase().includes('milo') ||
    i.name.toLowerCase().includes('drink')
  );
  // Main Category is everything else
  const mainItems = menuItems.filter(i => !drinksItems.includes(i));

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
      </div>
    );
  }

  if (error || !stall) return <div>Error loading stall</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32 w-full flex flex-col">
      
      {/* Header */}
      <div className="bg-slate-50 pb-6 pt-4 px-6 rounded-b-[2rem]">
         <div className="flex items-center justify-between mb-4">
            <BackButton href="/ordering/stalls" />
            <h1 className="text-lg font-bold text-slate-700">{stall.name}</h1>
            <button className="p-2 -mr-2 rounded-full hover:bg-slate-200 transition-colors">
                <Search className="w-6 h-6 text-slate-700" />
            </button>
         </div>
         <div className="flex justify-center">
            {stall.stall_image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={stall.stall_image} alt="stall" className="w-12 h-12 object-cover rounded-xl" />
            ) : (
                <div className="flex flex-col items-center text-slate-400">
                     <ImageIcon className="w-8 h-8 mb-1" strokeWidth={1.5} />
                </div>
            )}
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-6 space-y-8">
        
        {/* Popular */}
        {popularItems.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4">Popular</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {popularItems.map((item, index) => (
                <PopularMenuCard 
                    key={item.item_id}
                    item={item}
                    href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                    rank={index + 1}
                    quantity={getItemQty(item.item_id)} 
                />
              ))}
            </div>
          </section>
        )}

        {/* Drinks */}
        {drinksItems.length > 0 && (
            <section>
                <h2 className="text-lg font-bold text-slate-700 mb-2">Drinks</h2>
                <div className="flex flex-col">
                    {drinksItems.map((item) => (
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

        {/* Category */}
        <section>
            <h2 className="text-lg font-bold text-slate-700 mb-2">Category</h2>
            <div className="flex flex-col">
                {mainItems.map((item) => (
                    <StandardMenuCard 
                        key={item.item_id}
                        item={item}
                        href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                        quantity={getItemQty(item.item_id)} 
                    />
                ))}
            </div>
        </section>

      </div>

      {/* FLOATING CART BUTTON */}
      {totalCartCount > 0 && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-6 pb-8 z-30">
            <Link href="/ordering/cart">
                <Button 
                    variant="confirm" 
                    size="xl" 
                    className="w-full text-lg font-semibold"
                >
                    Go To Cart ({totalCartCount})
                </Button>
            </Link>
          </div>
      )}

    </div>
  );
}