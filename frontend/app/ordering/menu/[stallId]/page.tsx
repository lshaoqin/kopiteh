"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api"; 
import { MenuItem, Stall } from "@/../types";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton"; 
import { PopularMenuCard, StandardMenuCard } from "@/components/ui/MenuCard";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";

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
      
      {/* --- HEADER START --- */}
      <div className="relative w-full h-64 rounded-b-[2.5rem] overflow-hidden shadow-md shrink-0">
         
         {/* 1. Background Image Layer */}
         {stall.stall_image ? (
            <img 
              src={stall.stall_image} 
              alt={stall.name} 
              className="absolute inset-0 w-full h-full object-cover" 
            />
         ) : (
            <div className="absolute inset-0 bg-slate-300 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-slate-400" strokeWidth={1.5} />
            </div>
         )}

         {/* 2. Gradient Overlay */}
         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

         {/* 3. Content Layer  */}
         <div className="relative z-10 h-full flex flex-col justify-between p-6">
            
            {/* Top Row: Buttons */}
            <div className="flex items-center justify-between">
               <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-sm">
                  <BackButton href="/ordering/stalls" />
               </div>

               {/* <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors text-slate-700">
                   <Search className="w-5 h-5" />
               </button> */}
            </div>

            {/* Bottom Row: Title Centered */}
            <div className="text-center pb-2">
                <h1 className="text-3xl font-bold text-white tracking-wide shadow-sm drop-shadow-md">
                    {stall.name}
                </h1>
            </div>
         </div>
      </div>
      {/* --- HEADER END --- */}

      {/* Content */}
      <div className="flex-1 px-6 pt-8 space-y-8">
        
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

      <FloatingCartButton />

    </div>
  );
}