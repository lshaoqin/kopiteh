"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  widthClassName?: string;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  widthClassName = "w-96",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-white ${widthClassName} rounded-xl p-6`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center py-2">
          <Button onClick={onClose} variant="backcreatestall" size="bare" type="button">
            <ArrowLeft className="text-primary1" />
          </Button>

          <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-primary1">
            {title}
          </h2>
        </div>

        <div className="mt-4 mx-7">{children}</div>
      </div>
    </div>
  );
}