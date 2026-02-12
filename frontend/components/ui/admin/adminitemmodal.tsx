"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, X } from "lucide-react";
import { FormField } from "../formfield";
import { Button } from "../button";
import { useRef } from "react";
import { useAuthStore } from "@/stores/auth.store";

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

  const { accessToken } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);

  const uploadSelectedImage = async (file: File) => {
    if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL is not set");

    const form = new FormData();
    form.append("image", file);

    const res = await fetch(`${API_URL}/upload/single`, {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: form,
    });

    const json = await res.json().catch(() => null);

    if (!json) {
      throw new Error(`Upload failed (HTTP ${res.status})`);
    }

    if (!res.ok || json?.success === false) {
      throw new Error(json?.payload?.message ?? `Upload failed (HTTP ${res.status})`);
    }

    const imageUrl = json?.payload?.data?.imageUrl as string | undefined;

    if (!imageUrl) {
      throw new Error("Upload succeeded but no imageUrl returned");
    }

    return imageUrl;
  };

  useEffect(() => {
    if (!open) {
      setIsUploaded(false);
      return;
    }

    setFormError(null);
    setName(initialValues?.name ?? "");
    setImageUrl(initialValues?.imageUrl ?? "");
    setDescription(initialValues?.description ?? "");
    setPrice(initialValues?.price ?? "");
    setPrepTime(initialValues?.prep_time ?? "");

    if (initialValues?.modifier_sections) {
      setSections(initialValues.modifier_sections);
    } else {
      setSections([]);
    }

    if (initialValues?.imageUrl) {
      setIsUploaded(true);
    }

  }, [
    open,
    initialValues?.name,
    initialValues?.imageUrl,
    initialValues?.description,
    initialValues?.price,
    initialValues?.prep_time,
    initialValues?.modifier_sections,
  ]);


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
            <FormField
              className="flex flex-col space-y-2 font-semibold"
              classNameOut={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
          `}
              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
              variant="text"
              label="Item Name"
              inputProps={{
                value: name,
                placeholder: "Steamed Chicken Rice",
                onChange: (e) => {
                  setName(e.target.value);
                  setFormError(null);
                },
              }}
            />
          </div>
          {!isUploaded && (
            <div className="space-y-2">
              <FormField
                className="flex flex-col space-y-2 font-semibold"
                classNameOut={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
          `}
                classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                variant="text"
                label="Image URL (optional)"
                inputProps={{
                  value: imageUrl,
                  placeholder: "https//...",
                  onChange: (e) => {
                    setImageUrl(e.target.value);
                    setIsUploaded(false);
                    setFormError(null);
                  },
                }}
              />
            </div>
          )}
          <div>
            <label className="">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={async (e) => {
                  const inputEl = e.currentTarget;
                  const file = inputEl.files?.[0];
                  if (!file) return;

                  try {
                    setUploading(true);
                    setUploadError(null);

                    const url = await uploadSelectedImage(file);
                    setImageUrl(url);
                    setIsUploaded(true);
                  } catch (err: any) {
                    setUploadError(err?.message ?? "Upload failed");
                  } finally {
                    setUploading(false);
                    inputEl.value = "";
                  }
                }}

              />

              <Button
                type="button"
                variant="updatestall"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}

              {imageUrl?.trim() && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="h-64 w-full object-cover rounded-lg border mt-4"
                />
              )}
            </label>
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-md font-bold">Description (optional)</label>
            <textarea
              className={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:outline-none focus-within:ring-primary1/80"}
          `}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <FormField
                className="flex flex-col space-y-2 font-semibold"
                classNameOut={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
          `}
                classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                variant="number"
                label="Base Price ($)"
                inputProps={{
                  value: price,
                  placeholder: "5",
                  onChange: (e) => {
                    setPrice(e.target.value);
                    setFormError(null);
                  },
                }}
              />
            </div>
            <div className="space-y-2">
              <FormField
                className="flex flex-col space-y-2 font-semibold"
                classNameOut={`
            p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
            ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
          `}
                classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                variant="number"
                label="Est. Prep Time (min)"
                inputProps={{
                  value: prepTime,
                  placeholder: "10",
                  onChange: (e) => {
                    setPrepTime(e.target.value);
                    setFormError(null);
                  },
                }}
              />

            </div>
          </div>

          {/* Variants */}
          <div className="pt-2">
            <div className="flex items-center justify-center w-full">
              <Button
                onClick={addVariant}
                variant="editstall"
                className="rounded-lg border gap-1 px-3 py-2 text-sm text-primary1 hover:bg-gray-50"
                disabled={loading || !name.trim() || !price.trim() || !prepTime.trim()}
              >
                <Plus className="h-4 w-4" />
                Add Variant
              </Button>
            </div>

            {(sections as any[]).length === 0 ? (
              <div className="text-sm opacity-70 w-full mt-2 flex justify-center">
                No variants added
              </div>
            ) : (
              <div className="mt-3 space-y-4">
                {(sections as any[]).map((s: any, sectionIdx: number) => (

                  <div key={sectionIdx} className="rounded-xl border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-lg">Variant</span>
                        <span className="text-lg text-gray-500">#{sectionIdx + 1}</span>
                      </div>


                      <Button
                        variant="deletestall"
                        onClick={() => removeVariant(sectionIdx)}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm bg-transparent text-red-500 hover:bg-transparent hover:text-red-600"
                        disabled={loading}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>

                    </div>
                    <hr className="my-2 border-gray-200" />
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-2">
                            <FormField
                              className="flex flex-col space-y-2 font-semibold"
                              classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
                              `}
                              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                              variant="text"
                              label="Variant Name"
                              inputProps={{
                                value: s.name,
                                placeholder: "Add-ons",
                                onChange: (e) => {
                                  updateVariant(sectionIdx, { name: e.target.value })
                                  setFormError(null);
                                },
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormField
                              className="flex flex-col space-y-2 font-semibold"
                              classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
                              `}
                              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                              variant="number"
                              label="Min Selections"
                              inputProps={{
                                value: s.min_selections,
                                placeholder: "0",
                                onChange: (e) => {
                                  updateVariant(sectionIdx, { min_selections: e.target.value })
                                  setFormError(null);
                                },
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <FormField
                              className="flex flex-col space-y-2 font-semibold"
                              classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
                              `}
                              classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                              variant="number"
                              label="Max Selections"
                              inputProps={{
                                value: s.max_selections,
                                placeholder: "1",
                                onChange: (e) => {
                                  updateVariant(sectionIdx, { max_selections: e.target.value })
                                  setFormError(null);
                                },
                              }}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Options</p>
                            <Button
                              type="button"
                              onClick={() => addOption(sectionIdx)}
                              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50 hover:text-black/70"
                              disabled={loading}
                            >
                              <Plus className="h-4 w-4" />
                              Add Option
                            </Button>
                          </div>

                          <div className="space-y-4">
                            {(s.options ?? []).map((o: any, optionIdx: number) => (
                              <div
                                key={optionIdx}
                                className="grid grid-cols-12 gap-2 rounded-lg bg-gray-50 p-2 items-center"
                              >
                                <div className="col-span-6">
                                  <FormField
                                    className="flex flex-col space-y-2 font-semibold"
                                    classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
                              `}
                                    classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                                    variant="text"
                                    label=""
                                    inputProps={{
                                      value: o.name,
                                      placeholder: "Spicy-level",
                                      onChange: (e) => {
                                        updateOption(sectionIdx, optionIdx, { name: e.target.value });
                                        setFormError(null);
                                      },
                                    }}
                                  />
                                </div>

                                <div className="col-span-4">
                                  <FormField
                                    className="flex flex-col space-y-2 font-semibold"
                                    classNameOut={`
                                p-2 bg-white rounded-lg transition-all duration-200 ease-out font-normal
                                ${error ? "border-2 border-red-500" : "border-1 focus-within:ring-2 focus-within:ring-primary1/80"}
                              `}
                                    classNameIn="focus:outline-none text-grey-primary w-full text-left focus:placeholder-transparent"
                                    variant="text"
                                    label=""
                                    inputProps={{
                                      value: o.price_modifier,
                                      placeholder: "Price add-on",
                                      onChange: (e) => {
                                        updateOption(sectionIdx, optionIdx, { price_modifier: e.target.value });
                                        setFormError(null);
                                      },
                                    }}
                                  />
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
                                  <Button
                                    variant="backcreatestall"
                                    onClick={() => removeOption(sectionIdx, optionIdx)}
                                    className="rounded-md p-1 hover:bg-gray-100"
                                    aria-label="Remove option"
                                    disabled={loading}
                                  >
                                    <X className="h-4 w-4 opacity-70" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-xs opacity-60">Checkbox = available for ordering.</p>
                        </div>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center border-t px-6 py-4 w-full justify-between">
          {onDelete ? (
            <Button
              onClick={onDelete}
              variant="deletestall"
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center">
            <Button
              onClick={handleSubmit}
              disabled={loading || !name.trim() || !price.trim() || !prepTime.trim()}
              variant="addstall"
            >
              {loading ? "Saving..." : submitText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
