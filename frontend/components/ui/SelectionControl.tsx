import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  isSelected: boolean;
  type: "radio" | "checkbox";
}

export function SelectionControl({ isSelected, type }: Props) {
  return (
    <div className={cn(
      "w-6 h-6 border-2 flex items-center justify-center transition-all duration-200",
      type === "radio" ? "rounded-full" : "rounded-md", 
      isSelected ? "bg-slate-700 border-slate-700" : "border-slate-300"
    )}>
      {isSelected && (
        type === "radio" 
        ? <div className="w-2.5 h-2.5 bg-white rounded-full" /> 
        : <Check className="w-4 h-4 text-white" strokeWidth={3} />
      )}
    </div>
  );
}