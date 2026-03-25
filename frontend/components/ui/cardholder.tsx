/* eslint-disable @next/next/no-img-element */
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Button } from "./button";

type CardProps = {
  name: string;
  img?: string;
  variant?: "default" | "venue" | "stall";
  isActive?: boolean;
  onActiveChange?: (v: boolean) => void;
  allowRemarks?: boolean;
  onRemarksChange?: (v: boolean) => void;
  onEdit?: () => void;
};

function CardHolder({
  name,
  img,
  variant,
  isActive,
  onActiveChange,
  allowRemarks,
  onRemarksChange,
  onEdit,
}: CardProps) {
  const showActions = variant === "default" || variant === "venue";
  const showToggle = variant === "default";

  const stopPropagation = (e: React.MouseEvent | React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      className={`flex flex-col rounded-xl bg-white shadow-md shadow-black/25 ${showActions ? "h-auto" : "h-50"
        }`}
    >
      <div className="h-63 rounded-t-xl bg-gray-100 overflow-hidden">
        {img ? (
          <img src={img} alt={name} className="h-full w-full object-cover rounded-t-xl" />
        ) : (
          <div className="h-full w-full grid place-items-center">
            <span className="text-sm opacity-70">No image</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-xl px-5 py-3 flex flex-col gap-2">
        {/* Name + edit button row */}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{name}</div>
          {showActions && (
            <Button
              size="bare"
              type="button"
              onClick={(e) => {
                stopPropagation(e);
                onEdit?.();
              }}
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Edit stall"
              variant="editstall"
              onPointerDown={stopPropagation}
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Both toggles in one row */}
        {showToggle && (
          <div
            className="flex items-center justify-between my-1"
            onClick={stopPropagation}
            onPointerDown={stopPropagation}
          >
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={(v) => onActiveChange?.(v)}
              />
              <span className="text-sm text-gray-500">Open</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Remarks</span>
              <Switch
                checked={allowRemarks}
                onCheckedChange={(v) => onRemarksChange?.(v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { CardHolder };