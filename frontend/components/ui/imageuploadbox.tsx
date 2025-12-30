"use client";
/* eslint-disable @next/next/no-img-element */

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";

type ImageUploadBoxProps = {
  value?: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  previewUrl?: string | null; // optional if image already exists
};

export function ImageUploadBox({
  value,
  onChange,
  label = "Select image",
  previewUrl,
}: ImageUploadBoxProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = React.useState<string | null>(null);

  const preview = previewUrl ?? localPreview;

  React.useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange(file);

    if (localPreview) URL.revokeObjectURL(localPreview);

    if (file) setLocalPreview(URL.createObjectURL(file));
    else setLocalPreview(null);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <button
      type="button"
      onClick={openPicker}
      className="w-full rounded-xl border-2 border-primary1 p-8 flex items-center justify-center"
    >
      {!preview ? (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-xl border-2 border-primary1 p-4">
            <ImageIcon className="size-10 text-primary1" />
          </div>

          <span className="rounded-full bg-black/10 px-6 py-2 text-primary1 font-semibold">
            {label}
          </span>
        </div>
      ) : (
        <div className="w-full">
          <img
            src={preview}
            alt="Preview"
            className="h-56 w-full object-cover rounded-lg"
          />

          <div className="mt-3 text-right">
            <span
              onClick={clear}
              className="text-sm text-primary1 underline cursor-pointer"
            >
              Remove
            </span>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </button>
  );
}
