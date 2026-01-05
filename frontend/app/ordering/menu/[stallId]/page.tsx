"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/api"; 
import { MenuItem, Stall } from "../../../../../types";
import { useCartStore } from "@/stores/cart.store";
import { BackButton } from "@/components/ui/BackButton"; 

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

  const popularItems = menuItems.slice(0, 3);
  const mainItems = menuItems.slice(3); 

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin mb-4" />
        <p className="text-slate-400">Loading Menu...</p>
      </div>
    );
  }

  if (error || !stall) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-red-500 mb-4">{error || "Stall not found"}</p>
        <Link href="/ordering/stalls" className="text-slate-600 underline">
          Return to Stalls
        </Link>
      </div>
    );
  }

  return (
    // MAIN CONTAINER
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32 w-full flex flex-col">
      
      {/* Header - Sticky */}
      <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
         {/* Inner container limits width on huge screens */}
         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <BackButton href="/ordering/stalls" />
            
            <div className="flex flex-col items-center">
                <h1 className="text-xl font-bold text-slate-800">{stall.name}</h1>
            </div>

            <button className="p-2 -mr-2 rounded-full hover:bg-slate-50 transition-colors">
                <Search className="w-6 h-6 text-slate-700" />
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pt-8 space-y-10">
        
        {/* Popular Section */}
        {popularItems.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-5">Popular</h2>
            {/* Horizontal Scroll on Mobile, Grid on Desktop if there are many */}
            <div className="flex gap-5 overflow-x-auto pb-4 no-scrollbar">
              {popularItems.map((item) => (
                <Link 
                  key={item.item_id} 
                  href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                  className="flex-shrink-0 w-40 flex flex-col group cursor-pointer"
                >
                    <div className="w-40 h-40 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden mb-3 relative transition-all group-hover:shadow-md group-hover:border-slate-300">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                        )}
                        
                        <div className="absolute bottom-3 right-3 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                             <Plus className="w-4 h-4 text-slate-800" />
                        </div>
                    </div>
                    <div className="px-1">
                        <p className="text-sm font-bold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-1">${Number(item.price).toFixed(2)}</p>
                    </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Menu List */}
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-5">Menu Items</h2>
          
          {mainItems.length === 0 && popularItems.length === 0 && (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  No items available yet.
              </div>
          )}

          {/* 
              RESPONSIVE GRID:
              - Mobile: 1 column (Stack)
              - Tablet: 2 columns
              - Desktop: 3 columns
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {mainItems.map((item) => (
              <Link 
                  key={item.item_id}
                  href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                  className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.99] group h-28"
              >
                  <div className="flex items-center gap-5 flex-1 overflow-hidden h-full">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden">
                          {item.image_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                              <ImageIcon className="w-8 h-8 text-slate-300" />
                          )}
                      </div>
                      
                      {/* Item Info */}
                      <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                          <h3 className="font-bold text-slate-700 truncate text-base">{item.name}</h3>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-1">{item.description || "Delicious local favorite"}</p>
                          <p className="text-sm font-semibold text-slate-800 mt-2">${Number(item.price).toFixed(2)}</p>
                      </div>
                  </div>

                  {/* Add Icon */}
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 ml-2 shrink-0 group-hover:bg-slate-100 group-hover:text-slate-900 transition-colors">
                      <Plus className="w-5 h-5" />
                  </div>
              </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Floating Cart Button - Centered Fixed */}
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