"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { MenuItem, MenuItemModifier, MenuItemModifierSection, Stall } from "../../../../../../../types";
import { useCartStore } from "@/stores/cart.store";
import { api } from "@/lib/api"; 

// Components
import { Badge } from "@/components/ui/Badge";
import { ModifierRow } from "@/components/ui/ordering/ModifierRow";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/button"; 

function ItemCustomizationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const cartIdToEdit = searchParams.get("cartId");

  const itemId = Number(params.itemId);
  const stallId = Number(params.stallId); // 1. Get Stall ID

  // --- STATE ---
  const [stall, setStall] = useState<Stall | null>(null); // 2. Stall State
  const [item, setItem] = useState<MenuItem | null>(null);
  const [sections, setSections] = useState<MenuItemModifierSection[]>([]);
  const [modifiers, setModifiers] = useState<MenuItemModifier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedMods, setSelectedMods] = useState<number[]>([]);
  
  const { addItem, updateItem, removeItem, items: cartItems } = useCartStore();

  // 1. Fetch Real Data
  useEffect(() => {
    async function fetchData() {
        if (!itemId || !stallId) return;
        try {
            setLoading(true);
            const [itemData, sectionData, modifierData, stallData] = await Promise.all([
                api.getItemById(itemId),
                api.getSectionsByItem(itemId),
                api.getModifiersByItem(itemId),
                api.getStallById(stallId) // 3. Fetch Stall Data
            ]);

            setItem(itemData);
            setSections(sectionData || []);
            setModifiers(modifierData || []);
            setStall(stallData);
            
            // Auto-select defaults if NOT editing
            if (!cartIdToEdit) {
                const defaultSelections: number[] = [];
                (sectionData || []).forEach(sec => {
                    if ((sec.min_selections ?? 0) > 0) {
                        const firstMod = (modifierData || []).find(m => m.section_id === sec.section_id);
                        if (firstMod) defaultSelections.push(firstMod.option_id);
                    }
                });
                setSelectedMods(defaultSelections);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load item");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [itemId, stallId, cartIdToEdit]);

  // 2. Pre-fill for Edit Mode
  useEffect(() => {
    if (cartIdToEdit && !loading && item) {
        const existingCartItem = cartItems.find(i => i.uniqueId === cartIdToEdit);
        if (existingCartItem) {
            setQuantity(existingCartItem.quantity);
            setSelectedMods(existingCartItem.modifiers.map(m => m.option_id));
        }
    }
  }, [cartIdToEdit, cartItems, loading, item]);

  // --- LOGIC ---

  const handleToggle = (modId: number, sectionId: number, maxSelections: number) => {
    setSelectedMods(prev => {
        const isSelected = prev.includes(modId);
        
        if (maxSelections === 1) {
            // Radio Logic
            const others = prev.filter(id => {
                const m = modifiers.find(mod => mod.option_id === id);
                return m && m.section_id !== sectionId;
            });
            return [...others, modId];
        }

        // Checkbox Logic
        return isSelected ? prev.filter(id => id !== modId) : [...prev, modId];
    });
  };

  const calculateTotal = () => {
    if (!item) return 0;
    const base = Number(item.price);
    const modsPrice = selectedMods.reduce((acc, modId) => {
        const mod = modifiers.find(m => m.option_id === modId);
        return acc + (mod ? Number(mod.price_modifier) : 0);
    }, 0);
    return (base + modsPrice) * quantity;
  };

  const isFormValid = sections.every((section) => {
    if ((section.min_selections ?? 0) === 0) return true;
    const count = selectedMods.filter(modId => modifiers.find(m => m.option_id === modId)?.section_id === section.section_id).length;
    return count >= (section.min_selections ?? 0);
  });

  const handleSave = () => {
    if (!item) return;
    const selectedModifierObjects = modifiers.filter(m => selectedMods.includes(m.option_id));

    if (cartIdToEdit) {
        updateItem(cartIdToEdit, { modifiers: selectedModifierObjects, quantity });
    } else {
        // 4. Pass correct stall name
        addItem(item, selectedModifierObjects, quantity, stall?.name || "Unknown Stall", "");
    }
    router.back();
  };

  const handleRemove = () => {
    if (cartIdToEdit) {
        removeItem(cartIdToEdit);
        router.back();
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (error || !item) return <div className="p-10 text-center text-red-500">Item not found</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-48">
        
        {/* Header */}
        <div className="bg-slate-50 pt-6 pb-6 px-6 rounded-b-[2rem] flex flex-col items-center relative mb-6">
            <div className="absolute top-6 left-6">
                <Button variant="circle" size="icon-lg" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
            </div>
            
            <div className="mt-2 text-slate-400">
                 {item.item_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={item.item_image} alt={item.name} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                 ) : (
                    <ImageIcon className="w-10 h-10" />
                 )}
            </div>
        </div>

        {/* Title */}
        <div className="px-6 mb-8">
            <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{item.description}</p>
        </div>

        {/* Modifier Sections */}
        <div className="flex flex-col space-y-8">
            {sections.map(section => (
                <div key={section.section_id} className="px-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-xl text-slate-700">{section.name}</h3>
                        {(section.min_selections ?? 0) > 0 && <Badge>REQUIRED</Badge>}
                    </div>
                    
                    <div className="border-t border-slate-100">
                        {modifiers
                            .filter(m => m.section_id === section.section_id)
                            .map(mod => (
                                <ModifierRow 
                                    key={mod.option_id}
                                    name={mod.name}
                                    price={Number(mod.price_modifier)}
                                    isSelected={selectedMods.includes(mod.option_id)}
                                    isRadio={section.max_selections === 1}
                                    onClick={() => handleToggle(mod.option_id, section.section_id, section.max_selections ?? 0)}
                                />
                            ))
                        }
                    </div>
                </div>
            ))}
        </div>

        {/* --- FOOTER --- */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-100 px-6 py-6 pb-8 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            
            {/* Quantity Selector */}
            <div className="flex justify-center mb-6">
                <QuantitySelector 
                    value={quantity} 
                    onIncrease={() => setQuantity(q => q + 1)} 
                    onDecrease={() => setQuantity(q => Math.max(1, q - 1))} 
                />
            </div>

            <div className="space-y-3">
                {/* Main Add/Update Button */}
                <Button 
                    onClick={handleSave} 
                    disabled={!isFormValid} 
                    variant="confirm" 
                    size="xl" 
                    className="w-full text-lg justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span>{cartIdToEdit ? "Update Order" : "Add To Order"}</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                </Button>

                {/* Remove Button (Only if editing) */}
                {cartIdToEdit && (
                    <button 
                        onClick={handleRemove}
                        className="w-full py-4 text-lg font-bold text-white bg-red-400 hover:bg-red-500 rounded-xl transition-colors active:scale-[0.98]"
                    >
                        Remove From Order
                    </button>
                )}
            </div>
        </div>

    </div>
  );
}

export default function ItemCustomizationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ItemCustomizationContent />
        </Suspense>
    );
}