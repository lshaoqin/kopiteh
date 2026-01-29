'use client';

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import ItemModal from "@/components/ui/admin/adminitemmodal"; // <-- your modal
import Link from "next/link";
import { CirclePlus, Pencil, ArrowLeft } from "lucide-react";
import { MenuItem, MenuCategory } from "../../../../../../../../../../types/item";
import { Stall } from "../../../../../../../../../../types/stall";
import CategoryModal from "@/components/ui/admin/admincategoryitemmodal";
import { AdminStallModal } from "@/components/ui/admin/adminstallmodal";

export default function ManageItemsPage() {
    const { venueId, stallId } = useParams<{ venueId: string; stallId: string }>();
    const [stall, setStall] = useState<Stall>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const { accessToken } = useAuthStore();

    const [categories, setCategories] = useState<MenuCategory[]>([]);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // category modal state
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [createCategoryError, setCreateCategoryError] = useState<string | null>(null);

    // update category modal state
    const [showUpdateCategory, setShowUpdateCategory] = useState(false);
    const [updatingCategory, setUpdatingCategory] = useState<MenuCategory>(null);
    const [updateCategoryError, setUpdateCategoryError] = useState<string | null>(null);

    // item modal state
    const [showCreateItem, setShowCreateItem] = useState(false);
    const [creatingItem, setCreatingItem] = useState(false);
    const [createItemError, setCreateItemError] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    // edit item state (optional)
    const [showEditItem, setShowEditItem] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [updatingItem, setUpdatingItem] = useState(false);
    const [updateItemError, setUpdateItemError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const stallIdNum = Number(stallId);

    const [deletingItem, setDeletingItem] = useState(false);
    const [deleteItemError, setDeleteItemError] = useState<string | null>(null);

    // group items by category
    const itemsByCategory = useMemo(() => {
        const map = new Map<number | null, MenuItem[]>();
        for (const it of items) {
            const key = it.category_id ?? null;
            const arr = map.get(key) ?? [];
            arr.push(it);
            map.set(key, arr);
        }
        return map;
    }, [items]);

    type CategoryForm = { name: string };

    useEffect(() => {
        async function loadStall() {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stalls/${stallId}`);
            const json = await res.json();
            setStall(json.payload?.data ?? null);
        }

        const id = Number(stallId);
        if (!Number.isNaN(id)) loadStall();
    }, [stallId]);


    useEffect(() => {
        const load = async () => {
            if (!API_URL || !stallIdNum) return;

            try {
                setLoading(true);
                setError(null);

                const [catRes, itemRes] = await Promise.all([
                    fetch(`${API_URL}/categories/stalls/${stallIdNum}`),
                    fetch(`${API_URL}/items/stalls/${stallIdNum}`),
                ]);

                const catJson = await catRes.json();
                const itemJson = await itemRes.json();

                if (!catRes.ok || catJson?.success === false) {
                    throw new Error(catJson?.payload?.message ?? "Failed to fetch categories");
                }
                if (!itemRes.ok || itemJson?.success === false) {
                    throw new Error(itemJson?.payload?.message ?? "Failed to fetch menu items");
                }

                setCategories(catJson.payload?.data ?? []);
                setItems(itemJson.payload?.data ?? []);
            } catch (e: any) {
                setError(e?.message ?? "Server error");
                setCategories([]);
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [API_URL, stallIdNum]);

    const handleCreateCategory = async ({ name }: CategoryForm) => {
        try {
            setCreateCategoryError(null);

            const trimmed = name.trim();
            if (!trimmed) {
                setCreateCategoryError("Category name is required.");
                return;
            }

            setCreatingCategory(true);

            const res = await fetch(`${API_URL}/categories/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    stall_id: stallIdNum,
                    name: trimmed,
                    sort_order: categories.length, // simple default ordering
                }),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to create category");
            }

            const created: MenuCategory = data.payload?.data;
            setCategories((curr) => [...curr, created]);
            setShowCreateCategory(false);
        } catch (e: any) {
            setCreateCategoryError(e?.message ?? "Failed to create category");
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleUpdateMenuCategory = async ({ name }: CategoryForm) => {
        try {
            setUpdateCategoryError(null);

            if (!updatingCategory) {
                setUpdateCategoryError("No category selected to update.");
                return;
            }

            const trimmed = name.trim();
            if (!trimmed) {
                setUpdateCategoryError("Category name is required.");
                return;
            }

            const categoryId = updatingCategory.category_id;

            const res = await fetch(`${API_URL}/categories/update/${categoryId}`, {
                method: "PUT", // or PATCH if your backend uses PATCH
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: trimmed
                }),
            });

            const data = await res.json();

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to update category");
            }

            const updated: MenuCategory = data.payload?.data;

            setCategories((curr) =>
                curr.map((c) => (c.category_id === categoryId ? { ...c, ...updated } : c))
            );

            setShowUpdateCategory(false);
        } catch (e: any) {
            setUpdateCategoryError(e?.message ?? "Failed to update category");
        } finally {
            setUpdatingCategory(null);
        }
    };

    const handleDeleteMenuCategory = async () => {
        if (!updatingCategory) return;

        try {
            setDeleteError(null);
            setDeleting(true);

            const categoryId = updatingCategory.category_id;

            const res = await fetch(`${API_URL}/categories/remove/${categoryId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to delete category");
            }

            setCategories((curr) => curr.filter((c) => c.category_id !== categoryId));
            setShowUpdateCategory(false);
            setUpdatingCategory(null);
        } catch (e: any) {
            setDeleteError(e?.message ?? "Failed to delete category");
        } finally {
            setDeleting(false);
        }
    };


    const handleCreateItem = async (v: any) => {
        try {
            setCreateItemError(null);

            const trimmedName = v.name.trim();
            if (!trimmedName) {
                setCreateItemError("Item name is required.");
                return;
            }

            const priceNum = Number(v.price);
            if (Number.isNaN(priceNum) || priceNum < 0) {
                setCreateItemError("Price must be a non-negative number.");
                return;
            }

            const prepNum = Number(v.prep_time);
            if (Number.isNaN(prepNum) || prepNum < 0) {
                setCreateItemError("Prep time must be a non-negative number.");
                return;
            }

            if (!selectedCategoryId) {
                setCreateItemError("Please choose a category first.");
                return;
            }

            setCreatingItem(true);

            const res = await fetch(`${API_URL}/items/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    stall_id: stallIdNum,
                    category_id: selectedCategoryId,
                    name: trimmedName,
                    item_image: v.imageUrl?.trim() ? v.imageUrl.trim() : null,
                    description: v.description?.trim() ? v.description.trim() : null,
                    price: priceNum,
                    prep_time: prepNum,
                    is_available: true,
                }),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false) {
                console.log("Create item error payload:", data); // <-- key
                throw new Error(
                    data?.payload?.message ??
                    data?.payload?.data?.message ??
                    JSON.stringify(data?.payload?.data ?? data)
                );
            }

            const created: MenuItem = data.payload?.data;
            setItems((curr) => [...curr, created]);

            setShowCreateItem(false);
            setSelectedCategoryId(null);
        } catch (e: any) {
            setCreateItemError(e?.message ?? "Failed to create item");
        } finally {
            setCreatingItem(false);
        }
    };

    const handleOpenCreateItem = (categoryId: number) => {
        setSelectedCategoryId(categoryId);
        setShowCreateItem(true);
    };

    const handleOpenEditItem = (item: MenuItem) => {
        setEditingItem(item);
        setShowEditItem(true);
    };

    const handleUpdateItem = async (v: any) => {
        if (!editingItem) return;

        try {
            setUpdateItemError(null);

            const trimmedName = v.name.trim();
            if (!trimmedName) {
                setUpdateItemError("Item name is required.");
                return;
            }

            const priceNum = Number(v.price);
            const prepNum = Number(v.prep_time);
            if (Number.isNaN(priceNum) || priceNum < 0) {
                setUpdateItemError("Price must be a non-negative number.");
                return;
            }
            if (Number.isNaN(prepNum) || prepNum < 0) {
                setUpdateItemError("Prep time must be a non-negative number.");
                return;
            }

            setUpdatingItem(true);

            const res = await fetch(`${API_URL}/items/update/${editingItem.item_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    name: trimmedName,
                    item_image: v.imageUrl?.trim() ? v.imageUrl.trim() : null,
                    description: v.description?.trim() ? v.description.trim() : null,
                    price: priceNum,
                    prep_time: prepNum,
                }),
            });

            const data = await res.json();
            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to update item");
            }

            const updated: MenuItem = data.payload?.data;
            setItems((curr) =>
                curr.map((it) => (it.item_id === updated.item_id ? { ...it, ...updated } : it))
            );

            setShowEditItem(false);
            setEditingItem(null);
        } catch (e: any) {
            setUpdateItemError(e?.message ?? "Failed to update item");
        } finally {
            setUpdatingItem(false);
        }
    };

    const handleDeleteMenuItem = async () => {
        if (!editingItem) return;

        try {
            setDeleteItemError(null);
            setDeletingItem(true);

            const itemId = editingItem.item_id;

            const res = await fetch(`${API_URL}/items/remove/${itemId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await res.json().catch(() => ({}));

            if (!res.ok || data?.success === false) {
                throw new Error(data?.payload?.message ?? "Failed to delete item");
            }

            setItems((curr) => curr.filter((it) => it.item_id !== itemId));
            setShowEditItem(false);
            setEditingItem(null);
        } catch (e: any) {
            setDeleteItemError(e?.message ?? "Failed to delete item");
        } finally {
            setDeletingItem(false);
        }
    };


    return (
        <main className="min-h-screen px-6 py-10 flex w-full">
            <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={`/admin/main/managevenues/venues/${venueId}/stalls`}
                            className="text-sm opacity-70 hover:opacity-100"
                        >
                            <ArrowLeft />
                        </Link>
                        <h1 className="font-bold text-2xl">{stall?.name}</h1>
                    </div>

                    <Button variant="addstall" onClick={() => setShowCreateCategory(true)}>
                        <CirclePlus />
                        Add Category
                    </Button>
                </div>

                {loading && (
                    <div className="mt-10 grid place-items-center">
                        <p className="text-primary1">Loading…</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && categories.length === 0 && (
                    <p className="mt-6 opacity-70">No categories yet. Create one first.</p>
                )}

                {!loading && !error && categories.length > 0 && (
                    <div className="mt-6 space-y-8">
                        {categories.map((cat) => {
                            const catItems = itemsByCategory.get(cat.category_id) ?? [];

                            return (
                                <section key={cat.category_id} className="rounded-2xl bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-lg font-bold">{cat.name}</h2>
                                            <button className="rounded-md p-1 hover:bg-gray-100" aria-label="Edit category" onClick={() => { setUpdatingCategory(cat); setShowUpdateCategory(true) }}>
                                                <Pencil className="h-4 w-4 opacity-70" />
                                            </button>
                                        </div>

                                        <Button variant="additem" onClick={() => handleOpenCreateItem(cat.category_id)}>
                                            <CirclePlus />
                                            Add Item
                                        </Button>
                                    </div>

                                    <div className="mt-4 overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead className="border-b">
                                                <tr className="text-left">
                                                    <th className="py-2 pr-3">Item</th>
                                                    <th className="py-2 pr-3">Base Price ($)</th>
                                                    <th className="py-2 pr-3">Est. Prep Time</th>
                                                    <th className="py-2 pr-3">Available</th>
                                                    <th className="py-2 pr-3 text-right">Edit</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {catItems.length === 0 ? (
                                                    <tr>
                                                        <td className="py-4 opacity-60" colSpan={5}>
                                                            No items yet.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    catItems.map((it, idx) => (
                                                        <tr key={it.item_id} className="border-b last:border-b-0">
                                                            <td className="py-3 pr-3">
                                                                <div className="font-medium">
                                                                    {idx + 1}. {it.name}
                                                                </div>
                                                                {it.description ? (
                                                                    <div className="text-xs opacity-60 line-clamp-1">
                                                                        {it.description}
                                                                    </div>
                                                                ) : null}
                                                            </td>

                                                            <td className="py-3 pr-3">
                                                                {typeof it.price === "string" ? Number(it.price).toFixed(2) : it.price.toFixed(2)}
                                                            </td>

                                                            <td className="py-3 pr-3">{it.prep_time}</td>

                                                            <td className="py-3 pr-3">
                                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs ${it.is_available ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                                                                    {it.is_available ? "Yes" : "No"}
                                                                </span>
                                                            </td>

                                                            <td className="py-3 pr-3 text-right">
                                                                <button
                                                                    onClick={() => handleOpenEditItem(it)}
                                                                    className="rounded-md p-2 hover:bg-gray-100"
                                                                    aria-label="Edit item"
                                                                >
                                                                    <Pencil className="h-4 w-4 opacity-70" />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Category */}

            {/* Create Item (under chosen category) */}
            <ItemModal
                open={showCreateItem}
                title="New Item"
                submitText="Create"
                loading={creatingItem}
                error={createItemError}
                onClose={() => {
                    setShowCreateItem(false);
                    setSelectedCategoryId(null);
                    setCreateItemError(null);
                }}
                onSubmit={handleCreateItem}
            />

            {/* Edit Item */}
            <ItemModal
                open={showEditItem}
                title="Edit Item"
                submitText="Update"
                loading={updatingItem}
                error={updateItemError}
                initialValues={
                    editingItem
                        ? {
                            name: editingItem.name,
                            imageUrl: editingItem.image_url ?? "",
                            description: editingItem.description ?? "",
                            price: String(editingItem.price ?? ""),
                            prep_time: String(editingItem.prep_time ?? ""),
                        }
                        : undefined
                }
                onClose={() => {
                    setShowEditItem(false);
                    setEditingItem(null);
                    setUpdateItemError(null);
                }}
                onSubmit={handleUpdateItem}
                onDelete={handleDeleteMenuItem}
            />

            <AdminStallModal
                open={showCreateCategory}
                title="Add Category"
                labelName="Category Name"
                submitText="Create"
                onClose={() => {
                    setShowCreateCategory(false);
                    setCreateCategoryError(null);
                }}
                onSubmit={handleCreateCategory}
            />

            <AdminStallModal
                open={showUpdateCategory}
                title="Edit Category"
                labelName="Category Name"
                initialName={updatingCategory?.name}
                submitText="Update"
                deleteText="Delete"
                onClose={() => {
                    setShowUpdateCategory(false);
                    setUpdateCategoryError(null);
                }}
                onSubmit={handleUpdateMenuCategory}
                onDelete={handleDeleteMenuCategory}
            />

        </main>
    );
}