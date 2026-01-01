/* eslint-disable @next/next/no-img-element */
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";

type CardProps = {
  name: string;
  img?: string;
  variant?: "default" | "venue" | "stall";

  // stall-only
  isActive?: boolean;
  onActiveChange?: (v: boolean) => void;
  onEdit?: () => void;
};

function CardHolder({ 
    name, 
    img, 
    variant, 
    isActive,
    onActiveChange, 
    onEdit}: CardProps) {
    const showActions = variant === "default";
    
    return (
        <div className="h-50 flex flex-col rounded-xl bg-white shadow-md shadow-black/25">
            <div className="h-63 rounded-t-xl bg-gray-100 overflow-hidden">
                {img ? (
                    <img src={img} alt={name} className="h-full w-full object-cover rounded-t-xl" />
                ) : (
                    <div className="h-full w-full grid place-items-center">
                        <span className="text-sm opacity-70">No image</span>
                    </div>
                )}
            </div>
            <div className="h-17 bg-whiterounded-b-xl flex items-center px-5">
                <div className="text-lg font-bold w-full">
                    {name}
                </div>
                {showActions && (
                    <div className="flex items-center">
                        <Switch checked={isActive} onCheckedChange={(v) => onActiveChange?.(v)} />

                        <button
                            type="button"
                            onClick={onEdit}
                            className="p-2 rounded-md hover:bg-gray-100"
                            aria-label="Edit stall"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export { CardHolder }