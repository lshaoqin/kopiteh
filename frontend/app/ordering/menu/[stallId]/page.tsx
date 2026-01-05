"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api"; 
import { MenuItem, Stall } from "../../../../../types";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton"; 
import { PopularMenuCard, StandardMenuCard } from "@/components/ui/MenuCard";

export default function MenuListPage() {
  const params = useParams();
  const stallId = Number(params.stallId); 

  const [stall, setStall] = useState<Stall | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = useCartStore((state) => state.totalPrice());

  // Splitting data to match the UI sections
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
      
      <div className="bg-white min-h-screen shadow-sm">

        {/* HEADER SECTION */}
        <div className="bg-slate-50 pb-6 pt-6 px-6 rounded-b-[2rem]">
           {/* Top Row */}
           <div className="flex items-center justify-between mb-4">
              <BackButton href="/ordering/stalls" />
              
              <h1 className="text-lg md:text-xl font-bold text-slate-700">{stall.name}</h1>

              <button className="p-2 -mr-2 rounded-full hover:bg-slate-200 transition-colors">
                  <Search className="w-6 h-6 text-slate-700" />
              </button>
           </div>

           {/* Centered Stall Image */}
           <div className="flex justify-center">
              {stall.stall_image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={stall.stall_image} alt="stall" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-2xl shadow-sm" />
              ) : (
                  <div className="flex flex-col items-center text-slate-400">
                       <ImageIcon className="w-10 h-10 mb-1" strokeWidth={1.5} />
                  </div>
              )}
           </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 pt-8 space-y-10">
          
          {/* 1. POPULAR SECTION */}
          {popularItems.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-700 mb-4">Popular</h2>
              {/* Increased gap for desktop */}
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar">
                {popularItems.map((item, index) => (
                  <PopularMenuCard 
                      key={item.item_id}
                      item={item}
                      href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                      rank={index + 1}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 2. DRINKS SECTION */}
          {drinksItems.length > 0 && (
              <section>
                  <h2 className="text-lg md:text-xl font-bold text-slate-700 mb-2">Drinks</h2>
                  <div className="flex flex-col">
                      {drinksItems.map((item) => (
                          <StandardMenuCard 
                              key={item.item_id}
                              item={item}
                              href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                          />
                      ))}
                  </div>
              </section>
          )}

          {/* 3. CATEGORY SECTION */}
          <section>
              <h2 className="text-lg md:text-xl font-bold text-slate-700 mb-2">Category</h2>
              <div className="flex flex-col">
                  {mainItems.map((item) => (
                      <StandardMenuCard 
                          key={item.item_id}
                          item={item}
                          href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                      />
                  ))}
              </div>
          </section>

        </div>
      </div>

      {/* Floating Cart Button (Centered relative to window) */}
      {totalItems > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
            <Link href="/ordering/cart">
                <button className="w-full bg-slate-800 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-between px-6 font-medium text-lg active:scale-[0.98] transition-transform hover:bg-slate-700 ring-4 ring-white/50">
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-slate-800 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                            {totalItems}
                        </span>
                        <span>View Order</span>
                    </div>
                    <span>${totalPrice.toFixed(2)}</span>
                </button>
            </Link>
          </div>
      )}

    </div>
  );
}