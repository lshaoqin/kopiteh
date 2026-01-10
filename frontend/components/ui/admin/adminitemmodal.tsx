"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type ItemForm = {
  name: string;
  imageUrl: string;
  description: string;
  price: string;
  prep_time: string;
};

export default function ItemModal({
  open,
  title,
  submitText,
  initialValues,
  loading,
  error,
  onClose,
  onSubmit,
  onDelete,
}: {
  open: boolean;
  title: string;
  submitText: string;
  initialValues?: Partial<ItemForm>;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (v: ItemForm) => void;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [price, setPrice] = useState(initialValues?.price ?? "");
  const [prepTime, setPrepTime] = useState(initialValues?.prep_time ?? "");

  useEffect(() => {
    if (!open) return;
    setName(initialValues?.name ?? "");
    setImageUrl(initialValues?.imageUrl ?? "");
    setDescription(initialValues?.description ?? "");
    setPrice(initialValues?.price ?? "");
    setPrepTime(initialValues?.prep_time ?? "");
  }, [open, initialValues]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Item Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Steamed Chicken Rice"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL (optional)</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description (optional)</label>
            <textarea
              className="w-full rounded-lg border px-3 py-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Price ($)</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="5.00"
                inputMode="decimal"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Est. Prep Time (min)</label>
              <input
                className="w-full rounded-lg border px-3 py-2"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="5"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          {onDelete ? (
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSubmit({
                  name,
                  imageUrl,
                  description,
                  price,
                  prep_time: prepTime,
                })
              }
              className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Saving..." : submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}