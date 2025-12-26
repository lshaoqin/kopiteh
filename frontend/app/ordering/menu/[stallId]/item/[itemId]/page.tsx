"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { MenuItem, MenuItemModifier, MenuItemModifierSection } from "../../../../../../../types";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_ITEM_DETAILS, MOCK_SECTIONS, MOCK_MODIFIERS } from "@/lib/mock-data";

function ItemCustomizationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const itemId = String(params.itemId);
  const cartIdToEdit = searchParams.get("cartId");

  const [item, setItem] = useState<MenuItem | null>(null);
  const [sections, setSections] = useState<MenuItemModifierSection[]>([]);
  const [modifiers, setModifiers] = useState<MenuItemModifier[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [notes, setNotes] = useState("");

  const { addItem, updateItem, removeItem, items: cartItems } = useCartStore();

  useEffect(() => {
    // Simulate Fetching Data
    const loadedItem = MOCK_ITEM_DETAILS[itemId] || MOCK_ITEM_DETAILS["default"];
    
    // Filter sections/modifiers relevant to this item
    const relevantSections = MOCK_SECTIONS.filter(s => s.item_id === loadedItem.item_id);
    const relevantModifiers = MOCK_MODIFIERS.filter(m => relevantSections.some(s => s.section_id === m.section_id));

    setItem(loadedItem);
    setSections(relevantSections);
    setModifiers(relevantModifiers);
    setLoading(false);
  }, [itemId]);

  // Pre-fill logic for Edit Mode
  useEffect(() => {
    if (cartIdToEdit && !loading && item) {
      const existingCartItem = cartItems.find(i => i.uniqueId === cartIdToEdit);
      if (existingCartItem) {
        setQuantity(existingCartItem.quantity);
        setNotes(existingCartItem.notes);
        
        const newSelections: Record<string, string[]> = {};
        existingCartItem.modifiers.forEach(mod => {
           if (!newSelections[mod.section_id]) newSelections[mod.section_id] = [];
           newSelections[mod.section_id].push(mod.option_id);
        });
        setSelections(newSelections);
      }
    }
  }, [cartIdToEdit, cartItems, loading, item]);

  const handleToggleOption = (sectionId: string, modId: string, maxSelections: number | null) => {
    setSelections((prev) => {
      const current = prev[sectionId] || [];
      const isSelected = current.includes(modId);
      const isRadio = maxSelections === 1;

      if (isRadio) {
        return { ...prev, [sectionId]: [modId] };
      } else {
        if (isSelected) {
          return { ...prev, [sectionId]: current.filter(id => id !== modId) };
        } else {
          if (maxSelections && current.length >= maxSelections) return prev;
          return { ...prev, [sectionId]: [...current, modId] };
        }
      }
    });
  };

  const calculateTotal = () => {
    if (!item) return 0;
    const base = Number(item.price);
    const modsPrice = Object.values(selections).flat().reduce((acc, modId) => {
        const mod = modifiers.find(m => m.option_id === modId);
        return acc + (mod ? Number(mod.price_modifier) : 0);
    }, 0);
    return (base + modsPrice) * quantity;
  };

  const handleSave = () => {
    if (!item) return;
    const selectedModifiers = Object.values(selections).flat().map(modId => 
        modifiers.find(m => m.option_id === modId)
    ).filter((m): m is MenuItemModifier => !!m);

    if (cartIdToEdit) {
        updateItem(cartIdToEdit, { modifiers: selectedModifiers, quantity, notes });
    } else {
        addItem(item, selectedModifiers, quantity, notes);
    }
    router.back();
  };

  const handleDelete = () => {
    if (cartIdToEdit) {
        removeItem(cartIdToEdit);
        router.back();
    }
  };

  if (loading || !item) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-600 pb-32">
        {/* Header Image */}
        <div className="relative w-full h-56 bg-slate-100">
            <button onClick={() => router.back()} className="absolute top-4 left-4 bg-white/90 p-2 rounded-full shadow-sm z-10 backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5 text-slate-700" />
            </button>
            <div className="w-full h-full flex items-center justify-center text-slate-400 overflow-hidden">
                {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-4xl opacity-20">No Image</span>
                )}
            </div>
        </div>

        {/* Title Block */}
        <div className="px-6 py-6 border-b border-slate-100">
            <h1 className="text-2xl font-bold text-slate-800">{item.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{item.description}</p>
        </div>

        {/* Dynamic Modifier Sections */}
        <div className="flex flex-col">
            {sections.map((section) => (
                <div key={section.section_id} className="px-6 py-6 border-b border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg text-slate-700">{section.name}</h3>
                        {section.min_selections !== null && section.min_selections > 0 && (
                            <span className="bg-slate-200 text-[10px] px-2 py-1 rounded text-slate-600 font-bold uppercase tracking-wide">REQUIRED</span>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {modifiers.filter(m => m.section_id === section.section_id).map((mod) => {
                            const isSelected = (selections[section.section_id] || []).includes(mod.option_id);
                            const isRadio = section.max_selections === 1;

                            return (
                                <div 
                                    key={mod.option_id}
                                    onClick={() => handleToggleOption(section.section_id, mod.option_id, section.max_selections)}
                                    className="flex items-center justify-between cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="flex-1">
                                            <span className={cn("text-base block", isSelected ? "font-semibold text-slate-800" : "text-slate-600")}>
                                                {mod.name}
                                            </span>
                                            {mod.price_modifier !== 0 && (
                                                <span className="text-slate-400 text-sm">
                                                    {mod.price_modifier > 0 ? '+' : ''}${Number(mod.price_modifier).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {/* Visual Checkbox/Radio */}
                                        <div className={cn(
                                            "w-6 h-6 border-[2px] flex items-center justify-center transition-all duration-200",
                                            isRadio ? "rounded-full" : "rounded-md", // Circle vs Square
                                            isSelected ? "bg-slate-600 border-slate-600" : "border-slate-300 group-hover:border-slate-400"
                                        )}>
                                            {isSelected && (
                                                <div className={cn("bg-white", isRadio ? "w-2.5 h-2.5 rounded-full" : "w-3 h-3 rounded-[1px]")} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {/* Special Request Text Area */}
            <div className="px-6 py-6">
                <h3 className="font-bold text-lg text-slate-700 mb-3">Request</h3>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Customization is subject to the stall's discretion"
                    className="w-full border border-slate-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:border-slate-500 text-slate-600 text-sm"
                />
            </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 p-6 pb-10 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-center gap-8 mb-6">
                <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors"
                >
                    <Minus className="w-5 h-5" />
                </button>
                <span className="text-2xl font-bold w-10 text-center text-slate-800">{quantity}</span>
                <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3">
                <Button 
                    onClick={handleSave} 
                    className="w-full py-7 text-lg font-semibold bg-slate-700 hover:bg-slate-800 shadow-lg rounded-xl"
                >
                    {cartIdToEdit ? "Update Order" : "Add To Order"} <span className="mx-2">•</span> ${calculateTotal().toFixed(2)}
                </Button>

                {cartIdToEdit && (
                    <Button 
                        onClick={handleDelete} 
                        className="w-full py-7 text-lg font-semibold bg-red-400 hover:bg-red-500 text-white shadow-sm rounded-xl"
                    >
                        Remove From Order
                    </Button>
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