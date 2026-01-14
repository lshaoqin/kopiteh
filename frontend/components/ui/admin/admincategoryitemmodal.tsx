'use client';

import { useEffect, useState } from "react";

type CategoryForm = { name: string };

export default function CategoryModal({
  open,
  title,
  submitText,
  initialName,
  loading,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  submitText: string;
  initialName?: string;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (v: CategoryForm) => void;
}) {
  const [name, setName] = useState(initialName ?? "");

  useEffect(() => {
    if (!open) return;
    setName(initialName ?? "");
  }, [open, initialName]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg">
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
            <label className="text-sm font-medium">Category Name</label>
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Chicken Rice"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit({ name })}
            className="rounded-lg bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}