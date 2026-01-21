import { SelectionControl } from "../SelectionControl";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  price?: number;
  isSelected: boolean;
  isRadio: boolean;
  onClick: () => void;
}

export function ModifierRow({ name, price, isSelected, isRadio, onClick }: Props) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between py-4 border-b border-slate-100 cursor-pointer group select-none"
    >
      <div className="flex flex-col">
        <span className={cn("text-base font-medium", isSelected ? "text-slate-800" : "text-slate-600")}>{name}</span>
        {price && price > 0 ? <span className="text-xs text-slate-400">+${price.toFixed(2)}</span> : null}
      </div>
      <SelectionControl isSelected={isSelected} type={isRadio ? "radio" : "checkbox"} />
    </div>
  );
}