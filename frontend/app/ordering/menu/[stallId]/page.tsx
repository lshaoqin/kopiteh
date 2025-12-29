"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Plus, Image as ImageIcon } from "lucide-react";
// import { api } from "@/lib/api"; // Commented out for now
import { MenuItem, Stall } from "../../../../../types";
import { useCartStore } from "@/stores/cart.store";
import { MOCK_STALLS, MOCK_MENU_ITEMS } from "@/lib/mock-data";

export default function MenuListPage() {
  const params = useParams();
  const stallId = Number(params.stallId); // We can use this later to fetch specific data

  // Data State - Initialized directly with MOCK data
  const [stall] = useState<Stall | null>(MOCK_STALLS[0]);
  const [menuItems] = useState<MenuItem[]>(MOCK_MENU_ITEMS);
  const [loading] = useState(false); // No loading needed for mock data
  
  /* 
  // API FETCHING LOGIC (Commented Out)
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [stallData, menuData] = await Promise.all([
          api.getStallById(stallId),
          api.getMenuByStall(stallId)
        ]);
        setStall(stallData);
        setMenuItems(menuData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stallId]); 
  */

  // Cart State (for floating button)
  const cartItems = useCartStore((state) => state.items);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = useCartStore((state) => state.totalPrice());

  // Logic to separate "Popular" vs regular items
  const popularItems = menuItems.slice(0, 3);
  const mainItems = menuItems.slice(3); 

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Menu...</div>;
  if (!stall) return <div className="p-10 text-center text-red-400">Stall not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-600 pb-32">
      
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
            <Link href="/ordering/stalls" className="p-2 -ml-2 rounded-full hover:bg-slate-100">
                <ArrowLeft className="w-6 h-6 text-slate-700" />
            </Link>
            
            <div className="flex flex-col items-center">
                <h1 className="text-lg font-bold text-slate-800">{stall.name}</h1>
                <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center mt-1 border border-slate-200">
                    <ImageIcon className="w-4 h-4 text-slate-400" />
                </div>
            </div>

            <button className="p-2 -mr-2 rounded-full hover:bg-slate-100">
                <Search className="w-6 h-6 text-slate-700" />
            </button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Popular Section (Horizontal Scroll) */}
        {popularItems.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4">Popular</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {popularItems.map((item) => (
                <Link 
                  key={item.item_id} 
                  href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                  className="flex-shrink-0 w-32 flex flex-col group"
                >
                    <div className="w-32 h-32 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center overflow-hidden mb-2 group-hover:border-slate-400 transition-colors relative">
                        {item.image_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                        )}
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-slate-700 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">${Number(item.price).toFixed(2)}</p>
                    </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Menu List */}
        {mainItems.length > 0 && (
            <section>
            <h2 className="text-lg font-bold text-slate-700 mb-4">Menu Items</h2>
            <div className="flex flex-col gap-4">
                {mainItems.map((item) => (
                <Link 
                    key={item.item_id}
                    href={`/ordering/menu/${stallId}/item/${item.item_id}`}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition-colors active:scale-[0.99]"
                >
                    <div className="flex items-center gap-4 flex-1">
                        {/* Item Image */}
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center border border-slate-100 overflow-hidden">
                            {item.image_url ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                        </div>
                        
                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-slate-700 truncate">{item.name}</h3>
                            <p className="text-xs text-slate-400 line-clamp-1">{item.description || "No description available"}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">${Number(item.price).toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Add Icon */}
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ml-2">
                        <Plus className="w-5 h-5" />
                    </div>
                </Link>
                ))}
            </div>
            </section>
        )}
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
          <div className="fixed bottom-6 left-0 w-full px-6 z-20">
            <Link href="/ordering/cart">
                <button className="w-full bg-slate-800 text-white py-4 rounded-xl shadow-xl flex items-center justify-between px-6 font-medium active:scale-[0.98] transition-transform">
                    <div className="flex items-center gap-3">
                        <span className="bg-white text-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
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