"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
}

export function SearchBar({ className, containerClassName, ...props }: SearchBarProps) {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      {/* Icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
      
      {/* Input Field */}
      <input 
        type="text" 
        className={cn(
          "w-full border border-slate-300 rounded-xl py-3 pl-10 pr-4 text-slate-700 outline-none",
          "focus:border-slate-500 focus:ring-1 focus:ring-slate-500",
          "placeholder:text-slate-400 bg-white shadow-sm transition-all",
          className
        )}
        {...props}
      />
    </div>
  );
}