"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";

type ModifierOptionDraft = {
  option_id?: number;
  name: string;
  price_modifier: string;
  is_available: boolean;
};

type ModifierSectionDraft = {
  section_id?: number;
  name: string;
  min_selections: string;
  max_selections: string;
  options: ModifierOptionDraft[];
};

type ItemForm = {
  name: string;
  imageUrl: string;
  description: string;
  price: string;
  prep_time: string;
  modifier_sections: ModifierSectionDraft[];
};

function emptyOption(): ModifierOptionDraft {
  return { name: "", price_modifier: "0", is_available: true };
}

function emptySection(): ModifierSectionDraft {
  return {
    name: "",
    min_selections: "0",
    max_selections: "1",
    options: [emptyOption()],
  };
}

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
  const [sections, setSections] = useState<ModifierSectionDraft[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    console.log(initialValues?.description);
    setName(initialValues?.name ?? "");
    setImageUrl(initialValues?.imageUrl ?? "");
    setDescription(initialValues?.description ?? "");
    setPrice(initialValues?.price ?? "");
    setPrepTime(initialValues?.prep_time ?? "");

    setSections(initialValues?.modifier_sections ?? []);
    setFormError(null);
  }, [open, initialValues]);


  if (!open) return null;

  const addVariant = () =>
    setSections((curr) => [...curr, emptySection()]);

  const removeVariant = (idx: number) =>
    setSections((curr) => curr.filter((_, i) => i !== idx));

  const updateVariant = (idx: number, patch: Partial<ModifierSectionDraft>) =>
    setSections((curr) =>
      curr.map((s, i) => (i === idx ? { ...s, ...patch } : s))
    );

  const addOption = (sectionIdx: number) => {
  setSections((curr) =>
    curr.map((s, i) => {
      if (i !== sectionIdx) return s;
      return { ...s, options: [...s.options, emptyOption()] };
    })
  );
};

  const removeOption = (sectionIdx: number, optionIdx: number) =>
    setSections((curr) =>
      curr.map((s, i) =>
        i === sectionIdx
          ? { ...s, options: s.options.filter((_, j) => j !== optionIdx) }
          : s
      )
    );

  const updateOption = (
    sectionIdx: number,
    optionIdx: number,
    patch: Partial<ModifierOptionDraft>
  ) =>
    setSections((curr) =>
      curr.map((s, i) =>
        i === sectionIdx
          ? {
            ...s,
            options: s.options.map((o, j) =>
              j === optionIdx ? { ...o, ...patch } : o
            ),
          }
          : s
      )
    );

  const validateVariants = () => {
    setFormError(null);

    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!(s.name ?? "").trim()) return `Variant ${i + 1}: name is required.`;

      const min = Number(s.min_selections);
      const max = Number(s.max_selections);
      if (Number.isNaN(min) || min < 0) return `Variant ${i + 1}: min selections must be >= 0.`;
      if (Number.isNaN(max) || max < 0) return `Variant ${i + 1}: max selections must be >= 0.`;
      if (max < min) return `Variant ${i + 1}: max must be >= min.`;

      const opts = s.options ?? [];
      if (opts.length === 0) return `Variant ${i + 1}: add at least one option.`;

      for (let j = 0; j < opts.length; j++) {
        const o = opts[j];
        if (!(o.name ?? "").trim()) return `Variant ${i + 1}, option ${j + 1}: name is required.`;
        const pm = Number(o.price_modifier);
        if (Number.isNaN(pm) || pm < 0) return `Variant ${i + 1}, option ${j + 1}: price add-on must be >= 0.`;
      }
    }

    return null;
  };

  const handleSubmit = () => {
    const vErr = validateVariants();
    if (vErr) {
      setFormError(vErr);
      return;
    }

    onSubmit({
      name,
      imageUrl,
      description,
      price,
      prep_time: prepTime,
      modifier_sections: sections,
    });
  };
  
  return (
    
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">
            Close
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {(error || formError) && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError ?? error}
            </div>
          )}

          {/* Base fields */}
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

          {/* Variants */}
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Variants (optional)</h3>
                <p className="text-xs opacity-60">
                  Example: Add-ons / Size / Spice level. Each variant has options.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </button>
            </div>

            {(sections as any[]).length === 0 ? (
              <div className="mt-3 rounded-lg border border-dashed p-4 text-sm opacity-70">
                No variants added.
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {(sections as any[]).map((s: any, sectionIdx: number) => (
                  
                  <div key={sectionIdx} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Variant Name</label>
                            <input
                              className="w-full rounded-lg border px-3 py-2"
                              value={s.name}
                              onChange={(e) => updateVariant(sectionIdx, { name: e.target.value })}
                              placeholder="Add-ons"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Min selections</label>
                            <input
                              className="w-full rounded-lg border px-3 py-2"
                              value={s.min_selections}
                              onChange={(e) => updateVariant(sectionIdx, { min_selections: e.target.value })}
                              inputMode="numeric"
                              placeholder="0"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Max selections</label>
                            <input
                              className="w-full rounded-lg border px-3 py-2"
                              value={s.max_selections}
                              onChange={(e) => updateVariant(sectionIdx, { max_selections: e.target.value })}
                              inputMode="numeric"
                              placeholder="1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Options</p>
                            <button
                              type="button"
                              onClick={() => addOption(sectionIdx)}
                              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4" />
                              Add Option
                            </button>
                          </div>

                          <div className="space-y-2">
                            {(s.options ?? []).map((o: any, optionIdx: number) => (
                              <div
                                key={optionIdx}
                                className="grid grid-cols-12 items-center gap-2 rounded-lg bg-gray-50 p-2"
                              >
                                <div className="col-span-6">
                                  <input
                                    className="w-full rounded-lg border bg-white px-3 py-2"
                                    value={o.name}
                                    onChange={(e) => updateOption(sectionIdx, optionIdx, { name: e.target.value })}
                                    placeholder="Egg"
                                  />
                                </div>

                                <div className="col-span-4">
                                  <input
                                    className="w-full rounded-lg border bg-white px-3 py-2"
                                    value={o.price_modifier}
                                    onChange={(e) =>
                                      updateOption(sectionIdx, optionIdx, { price_modifier: e.target.value })
                                    }
                                    placeholder="1.00"
                                    inputMode="decimal"
                                  />
                                  <p className="mt-1 text-[11px] opacity-60">Price add-on ($)</p>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(o.is_available)}
                                    onChange={(e) =>
                                      updateOption(sectionIdx, optionIdx, { is_available: e.target.checked })
                                    }
                                    className="h-4 w-4"
                                  />
                                </div>

                                <div className="col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeOption(sectionIdx, optionIdx)}
                                    className="rounded-md p-2 hover:bg-white"
                                    aria-label="Remove option"
                                    disabled={loading}
                                  >
                                    <X className="h-4 w-4 opacity-70" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs opacity-60">Checkbox = available for ordering.</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeVariant(sectionIdx)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              onClick={handleSubmit}
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
