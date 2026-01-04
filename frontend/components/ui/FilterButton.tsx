"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  label?: string;
  icon?: LucideIcon;
  
  // Logic Props
  options?: string[];          // If provided, this becomes a dropdown
  value?: string;              // The currently selected value
  onChange?: (val: string) => void; // Callback when an option is picked
}

export function FilterButton({ 
  label, 
  icon: Icon, 
  options = [], // Default to empty array
  value, 
  onChange,
  className, 
  onClick,
  ...props 
}: FilterButtonProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isDropdown = options.length > 0;

  // Handle clicking outside to close menu
  useEffect(() => {
    if (!isDropdown) return; // Don't run listener if not a dropdown

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdown]);

  // Handle the main button click
  const handleTriggerClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isDropdown) {
      setIsOpen(!isOpen);
    }
    if (onClick) {
      onClick(e);
    }
  };

  // Determine active state for styling
  const isActive = isOpen || (!!value && value !== "");

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      
      {/* --- THE TRIGGER BUTTON --- */}
      <button
        type="button"
        onClick={handleTriggerClick}
        className={cn(
          // Base Styles
          "flex items-center justify-center gap-1.5 px-3 py-1.5 h-9 text-xs font-medium border rounded-lg transition-all whitespace-nowrap select-none",
          "border-slate-300 text-slate-600 bg-white hover:bg-slate-50",
          
          // Active Styles (Darker background)
          isActive && "bg-slate-800 text-white border-slate-800 hover:bg-slate-900",
          
          className
        )}
        {...props}
      >
        {Icon && <Icon className={cn("w-4 h-4", label ? "mr-1" : "")} />}
        
        {/* If a value is selected, show that instead of the label */}
        {(value || label) && <span>{value || label}</span>}
        
        {/* Show chevron if it's a dropdown */}
        {isDropdown && (
          <ChevronDown 
            className={cn(
              "w-3 h-3 opacity-60 transition-transform duration-200", 
              isActive && "rotate-180 opacity-100"
            )} 
          />
        )}
      </button>

      {/* --- THE DROPDOWN MENU --- */}
      {isDropdown && isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {options.map((option) => {
              const isSelected = option === value;
              return (
                <button
                  key={option}
                  onClick={() => {
                    onChange?.(option);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none",
                    isSelected ? "text-slate-900 font-medium bg-slate-50" : "text-slate-600"
                  )}
                >
                  {option}
                  {isSelected && <Check className="w-4 h-4 text-slate-600" />}
                </button>
              );
            })}

            {/* Clear Button */}
            {value && (
                <button
                  onClick={() => {
                    onChange?.(""); 
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-500 font-medium hover:bg-red-50 border-t border-slate-100"
                >
                  Clear Selection
                </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}