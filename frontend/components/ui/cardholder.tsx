/* eslint-disable @next/next/no-img-element */
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { Button } from "./button";
import { useState } from "react";

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

function ImagePlaceholder({ name }: { name: string }) {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-green-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-green-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 2c0 0 2 2 2 6h-4c0-4 2-6 2-6zm0 6v10M6 2v4a2 2 0 004 0V2M8 8v14" />
      </svg>
      <span className="text-xs text-green-400 font-medium">{name}</span>
    </div>
  );
}

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

  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`flex flex-col rounded-xl bg-white shadow-md shadow-black/25 ${showActions ? "h-auto" : "h-50"
        }`}
    >
      <div className="h-63 rounded-t-xl bg-gray-100 overflow-hidden">
        {img && !imgError ? (
          <img
            src={img}
            alt={name}
            className="h-full w-full object-cover rounded-t-xl"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImagePlaceholder name={name} />
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
            className="flex items-center gap-6 my-1"
            onClick={stopPropagation}
            onPointerDown={stopPropagation}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Open</span>
              <Switch
                className="data-[state=checked]:bg-green-600"
                checked={isActive}
                onCheckedChange={(v) => onActiveChange?.(v)}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">Allow remarks</span>
              <Switch
                className="data-[state=checked]:bg-green-600"
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